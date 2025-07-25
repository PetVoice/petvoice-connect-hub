import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { latitude, longitude, radius = 5000 } = await req.json()
    
    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use OpenStreetMap Overpass API (completely free, no API key needed)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        nwr["amenity"="veterinary"](around:${radius},${latitude},${longitude});
        nwr["shop"="pet_grooming"]["veterinary"="yes"](around:${radius},${latitude},${longitude});
        nwr["healthcare"="veterinary"](around:${radius},${latitude},${longitude});
      );
      out center meta;
    `;

    const overpassUrl = 'https://overpass-api.de/api/interpreter'
    
    console.log('Making request to Overpass API with query:', overpassQuery)
    
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: overpassQuery
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenStreetMap')
    }

    // Transform the results to a more usable format
    const veterinarians = data.elements?.map((element: any) => {
      const tags = element.tags || {}
      const lat = element.lat || (element.center ? element.center.lat : null)
      const lon = element.lon || (element.center ? element.center.lon : null)
      
      // Calculate distance from user location
      const distance = lat && lon ? calculateDistance(latitude, longitude, lat, lon) : null
      
      return {
        id: element.id.toString(),
        name: tags.name || tags.operator || 'Veterinario',
        address: buildAddress(tags),
        phone: tags.phone || tags['contact:phone'],
        website: tags.website || tags['contact:website'],
        email: tags.email || tags['contact:email'],
        openingHours: tags.opening_hours,
        location: {
          lat: lat,
          lng: lon
        },
        distance: distance ? Math.round(distance * 100) / 100 : null, // Round to 2 decimal places
        source: 'OpenStreetMap',
        tags: tags
      }
    }).filter((vet: any) => vet.location.lat && vet.location.lng) // Filter out entries without coordinates
    .sort((a: any, b: any) => (a.distance || Infinity) - (b.distance || Infinity)) // Sort by distance
    || []

    return new Response(
      JSON.stringify({ veterinarians }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error finding nearby vets:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Helper function to build address from OSM tags
function buildAddress(tags: any): string {
  const parts = []
  
  if (tags['addr:street']) {
    let street = tags['addr:street']
    if (tags['addr:housenumber']) {
      street += ` ${tags['addr:housenumber']}`
    }
    parts.push(street)
  }
  
  if (tags['addr:city']) {
    parts.push(tags['addr:city'])
  }
  
  if (tags['addr:postcode']) {
    parts.push(tags['addr:postcode'])
  }
  
  return parts.length > 0 ? parts.join(', ') : (tags.address || 'Indirizzo non disponibile')
}