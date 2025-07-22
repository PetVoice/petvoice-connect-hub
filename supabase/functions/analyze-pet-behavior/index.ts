import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, petType, petName } = await req.json();

    if (!description || description.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Descrizione troppo breve' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Sei un esperto veterinario comportamentalista specializzato nell'analisi emotiva degli animali domestici. 

Il tuo compito è analizzare la descrizione del comportamento di un ${petType || 'animale domestico'} e fornire un'analisi emotiva dettagliata.

IMPORTANTE: Devi rispondere SOLO con un oggetto JSON valido nel seguente formato:
{
  "primary_emotion": "emozione_primaria",
  "primary_confidence": 0.XX,
  "secondary_emotions": {
    "emozione2": XX,
    "emozione3": XX
  },
  "behavioral_insights": "analisi dettagliata del comportamento osservato",
  "recommendations": [
    "raccomandazione specifica 1",
    "raccomandazione specifica 2",
    "raccomandazione specifica 3"
  ],
  "triggers": [
    "possibile trigger 1",
    "possibile trigger 2"
  ],
  "analysis_duration": "2-3 secondi"
}

EMOZIONI DISPONIBILI: ansioso, felice, triste, aggressivo, calmo, eccitato, giocoso, spaventato, affettuoso, curioso

LINEE GUIDA:
- La confidenza deve essere realistica (0.60-0.95)
- Le emozioni secondarie sono percentuali (0-100)
- Gli insights devono essere specifici al comportamento descritto
- Le raccomandazioni devono essere pratiche e attuabili
- I trigger devono essere realistici e pertinenti
- Usa un linguaggio professionale ma comprensibile`;

    const userPrompt = `Analizza questo comportamento di ${petName || 'un animale domestico'}:

"${description}"

Fornisci un'analisi emotiva completa seguendo esattamente il formato JSON richiesto.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText);
      // Fallback to a basic analysis if JSON parsing fails
      analysisResult = {
        primary_emotion: 'calmo',
        primary_confidence: 0.70,
        secondary_emotions: { 'curioso': 30 },
        behavioral_insights: 'Analisi basata sulla descrizione fornita. Comportamento nel range normale.',
        recommendations: [
          'Continua ad osservare il comportamento',
          'Mantieni una routine regolare',
          'Assicurati che l\'ambiente sia confortevole'
        ],
        triggers: ['Cambiamenti nell\'ambiente'],
        analysis_duration: '2-3 secondi'
      };
    }

    // Validate and normalize the response
    if (!analysisResult.primary_emotion) {
      analysisResult.primary_emotion = 'calmo';
    }
    if (!analysisResult.primary_confidence || analysisResult.primary_confidence < 0 || analysisResult.primary_confidence > 1) {
      analysisResult.primary_confidence = 0.75;
    }
    if (!analysisResult.secondary_emotions) {
      analysisResult.secondary_emotions = {};
    }
    if (!analysisResult.behavioral_insights) {
      analysisResult.behavioral_insights = 'Comportamento analizzato tramite IA';
    }
    if (!Array.isArray(analysisResult.recommendations)) {
      analysisResult.recommendations = ['Continua ad osservare il comportamento'];
    }
    if (!Array.isArray(analysisResult.triggers)) {
      analysisResult.triggers = ['Da determinare'];
    }
    if (!analysisResult.analysis_duration) {
      analysisResult.analysis_duration = '2-3 secondi';
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: analysisResult,
        metadata: {
          processed_at: new Date().toISOString(),
          model_used: 'gpt-4o-mini',
          description_length: description.length
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-pet-behavior function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Errore durante l\'analisi del comportamento',
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});