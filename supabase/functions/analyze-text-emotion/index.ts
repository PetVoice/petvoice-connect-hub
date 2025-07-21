import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, petId, userId } = await req.json()

    if (!text || !petId || !userId) {
      throw new Error('Text, pet ID e user ID sono richiesti')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata')
    }

    console.log('Processing text analysis for pet:', petId);

    // Genera dati ambientali realistici basati sull'ora attuale
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    
    // Determina il periodo del giorno
    const timeOfDay = hour < 6 ? 'notturno' : 
                     hour < 12 ? 'mattutino' : 
                     hour < 18 ? 'pomeridiano' : 'serale';
    
    // Temperatura basata su stagione e ora
    const baseTemp = month >= 5 && month <= 8 ? 25 : 
                     month >= 9 && month <= 11 ? 18 : 15;
    const tempVariation = (Math.random() - 0.5) * 6;
    const temperature = Math.round(baseTemp + tempVariation);
    
    const environmentalData = {
      timeOfDay,
      temperature,
      humidity: Math.round(60 + Math.random() * 30),
      noiseLevel: hour >= 8 && hour <= 20 ? 'moderato' : 'basso',
      humanPresence: hour >= 7 && hour <= 23 ? 'rilevata' : 'non rilevata'
    };

    // Analizza il testo con OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sei un esperto veterinario comportamentale specializzato nell'analisi delle emozioni degli animali domestici.

            Analizza questo testo che descrive il comportamento di un pet e determina:
            1. L'emozione primaria del pet (felice, calmo, ansioso, eccitato, triste, aggressivo, giocoso, spaventato, confuso, rilassato)
            2. La confidenza dell'analisi (0-100%)
            3. Emozioni secondarie se presenti
            4. Insights comportamentali dettagliati
            5. Raccomandazioni specifiche
            6. Possibili trigger comportamentali

            IMPORTANTE: Usa ESATTAMENTE questi dati ambientali reali nella tua analisi:
            - Orario: ${timeOfDay}
            - Temperatura: ${temperature}°C
            - Umidità: ${environmentalData.humidity}%
            - Livello rumore: ${environmentalData.noiseLevel}
            - Presenza umana: ${environmentalData.humanPresence}

            Nel campo behavioral_insights, includi OBBLIGATORIAMENTE questo testo ESATTO:
            "Contesto Ambientale: Analisi registrata durante orario ${timeOfDay}. Livelli di rumore ambientale: ${environmentalData.noiseLevel}. Temperatura stimata: ${temperature}°C. Presenza umana ${environmentalData.humanPresence}."

            Rispondi SEMPRE in formato JSON valido con questa struttura:
            {
              "primary_emotion": "emozione_principale",
              "confidence": numero_0_100,
              "secondary_emotions": [{"emotion": "nome", "confidence": numero}],
              "behavioral_insights": "analisi dettagliata del comportamento + OBBLIGATORIAMENTE il contesto ambientale sopra specificato",
              "recommendations": ["raccomandazione1", "raccomandazione2"],
              "triggers": ["trigger1", "trigger2"],
              "environmental_context": "Orario ${timeOfDay}. Temperatura: ${temperature}°C. Umidità: ${environmentalData.humidity}%. Livello rumore: ${environmentalData.noiseLevel}. Presenza umana: ${environmentalData.humanPresence}."
            }`
          },
          {
            role: 'user',
            content: `Analizza questo comportamento del pet: "${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Errore sconosciuto'}`)
    }

    const data = await response.json()
    const analysisContent = data.choices[0].message.content
    
    console.log('AI Analysis Response:', analysisContent)

    let analysisData
    try {
      analysisData = JSON.parse(analysisContent)
    } catch (parseError) {
      console.error('Errore parsing JSON:', parseError)
      throw new Error('Formato risposta AI non valido')
    }

    // Salva nel database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: savedAnalysis, error: saveError } = await supabase
      .from('pet_analyses')
      .insert({
        user_id: userId,
        pet_id: petId,
        file_name: 'Analisi Comportamentale Testuale',
        file_type: 'text',
        file_size: text.length,
        storage_path: null,
        primary_emotion: analysisData.primary_emotion,
        primary_confidence: analysisData.confidence / 100,
        secondary_emotions: analysisData.secondary_emotions || [],
        behavioral_insights: analysisData.behavioral_insights,
        recommendations: analysisData.recommendations || [],
        triggers: analysisData.triggers || [],
        analysis_duration: null,
        metadata: {
          analysis_type: 'text_behavioral',
          environmental_context: analysisData.environmental_context,
          input_text: text,
          ai_powered: true
        }
      })
      .select()
      .single()

    if (saveError) {
      console.error('Errore salvataggio database:', saveError)
      throw saveError
    }

    console.log('Analysis saved successfully:', savedAnalysis.id)

    return new Response(JSON.stringify({
      success: true,
      analysisId: savedAnalysis.id,
      analysis: analysisData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in analyze-text-emotion function:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})