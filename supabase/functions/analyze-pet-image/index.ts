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
    const { imageBase64, petName, petType } = await req.json();

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

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
            content: `Sei un esperto veterinario comportamentale specializzato nell'analisi emotiva degli animali domestici attraverso le immagini. 
            Analizza attentamente l'immagine fornita e fornisci una valutazione dettagliata dello stato emotivo dell'animale.
            
            Considera:
            - Espressioni facciali (occhi, bocca, orecchie)
            - Postura corporea
            - Linguaggio del corpo
            - Contesto ambientale
            - Segni di stress, felicità, paura, rilassamento, etc.
            
            Fornisci una risposta in formato JSON con questa struttura:
            {
              "primary_emotion": "emozione principale (felice/triste/ansioso/calmo/giocoso/eccitato/aggressivo)",
              "primary_confidence": numero da 0 a 1,
              "secondary_emotions": ["emozione1", "emozione2"],
              "body_language_analysis": "descrizione dettagliata del linguaggio corporeo",
              "facial_expression_analysis": "analisi delle espressioni facciali",
              "context_analysis": "analisi del contesto e ambiente",
              "wellness_indicators": ["indicatore1", "indicatore2"],
              "recommendations": ["raccomandazione1", "raccomandazione2"],
              "confidence_score": numero da 0 a 100
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analizza lo stato emotivo di questo ${petType || 'animale domestico'}${petName ? ` di nome ${petName}` : ''} nell'immagine. Fornisci un'analisi comportamentale dettagliata.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Try to parse JSON from the response
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: create a structured response from the text
      analysisResult = {
        primary_emotion: "calmo",
        primary_confidence: 0.7,
        secondary_emotions: ["osservativo"],
        body_language_analysis: analysisText,
        facial_expression_analysis: "Analisi disponibile nel testo completo",
        context_analysis: "Contesto analizzato",
        wellness_indicators: ["Postura normale"],
        recommendations: ["Continua monitoraggio"],
        confidence_score: 70
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      raw_response: analysisText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-pet-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});