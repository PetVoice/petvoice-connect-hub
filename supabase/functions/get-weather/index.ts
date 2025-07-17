import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      code: number;
    };
    humidity: number;
    pressure_mb: number;
    wind_kph: number;
    uv: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, latitude, longitude } = await req.json();
    
    if (!location && (!latitude || !longitude)) {
      return new Response(
        JSON.stringify({ error: 'Location or coordinates are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const weatherApiKey = Deno.env.get('WEATHERAPI_KEY');
    
    if (!weatherApiKey) {
      console.error('WEATHERAPI_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Costruisci la query in base ai parametri forniti
    let query = location;
    if (latitude && longitude) {
      query = `${latitude},${longitude}`;
      console.log(`Fetching weather for coordinates: ${latitude}, ${longitude}`);
    } else {
      console.log(`Fetching weather for location: ${location}`);
    }

    // Call WeatherAPI
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(query)}&aqi=no`;
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      console.error(`WeatherAPI error: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const weatherData: WeatherResponse = await response.json();
    
    console.log('Weather data received:', JSON.stringify(weatherData, null, 2));

    // Transform the data to match our interface
    const transformedData = {
      condition: mapWeatherCondition(weatherData.current.condition.code),
      temperature: weatherData.current.temp_c,
      humidity: weatherData.current.humidity,
      windSpeed: Math.round(weatherData.current.wind_kph),
      pressure: weatherData.current.pressure_mb,
      uvIndex: weatherData.current.uv,
      location: `${weatherData.location.name}, ${weatherData.location.country}`,
      description: weatherData.current.condition.text
    };

    return new Response(
      JSON.stringify(transformedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Map WeatherAPI condition codes to our simplified conditions
function mapWeatherCondition(code: number): string {
  // WeatherAPI condition codes mapping
  if (code === 1000) return 'sunny';
  if ([1003, 1006, 1009].includes(code)) return 'cloudy';
  if ([1030, 1135, 1147].includes(code)) return 'foggy';
  if ([1063, 1069, 1072, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246, 1249, 1252].includes(code)) return 'rainy';
  if ([1066, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264, 1279, 1282].includes(code)) return 'snowy';
  if ([1087, 1273, 1276].includes(code)) return 'stormy';
  
  // Default to cloudy for unknown conditions
  return 'cloudy';
}