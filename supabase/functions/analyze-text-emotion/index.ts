import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

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
    const { text, petId, userId } = await req.json();

    if (!text || !petId || !userId) {
      throw new Error('Testo, pet ID e user ID sono richiesti');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('Analyzing text emotion for pet:', petId);

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

            Analizza il testo fornito dall'utente che descrive il comportamento e la situazione del pet e determina:
            1. L'emozione primaria del pet (felice, calmo, ansioso, eccitato, triste, aggressivo, giocoso, spaventato, confuso, rilassato)
            2. La confidenza dell'analisi (0-100%)
            3. Emozioni secondarie se presenti
            4. Insights comportamentali dettagliati
            5. Raccomandazioni specifiche
            6. Possibili trigger comportamentali

            Rispondi SEMPRE in formato JSON valido con questa struttura:
            {
              "primary_emotion": "emozione_principale",
              "primary_confidence": numero_0_100,
              "secondary_emotions": [{"emotion": "nome", "confidence": numero}],
              "behavioral_insights": "descrizione dettagliata del comportamento osservato",
              "recommendations": ["raccomandazione1", "raccomandazione2"],
              "triggers": ["trigger1", "trigger2"],
              "analysis_summary": "riassunto dell'analisi"
            }`
          },
          {
            role: 'user',
            content: `Analizza questa situazione del pet: ${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Errore sconosciuto'}`);
    }

    const aiResponse = await response.json();
    const analysisContent = aiResponse.choices[0].message.content;
    
    console.log('AI Analysis Response:', analysisContent);

    let analysisData;
    try {
      analysisData = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Errore parsing JSON:', parseError);
      throw new Error('Formato risposta AI non valido');
    }

    // Inizializza client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Salva l'analisi nel database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('pet_analyses')
      .insert({
        user_id: userId,
        pet_id: petId,
        file_name: 'Analisi Testuale',
        file_type: 'text',
        file_size: text.length,
        storage_path: null,
        primary_emotion: analysisData.primary_emotion,
        primary_confidence: analysisData.primary_confidence / 100,
        secondary_emotions: analysisData.secondary_emotions,
        behavioral_insights: analysisData.behavioral_insights,
        recommendations: analysisData.recommendations,
        triggers: analysisData.triggers || [],
        analysis_duration: null,
        metadata: {
          analysis_type: 'text',
          original_text: text,
          analysis_summary: analysisData.analysis_summary
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Errore salvataggio database:', saveError);
      throw saveError;
    }

    console.log('Analysis saved successfully:', savedAnalysis.id);

    return new Response(JSON.stringify({
      success: true,
      analysisId: savedAnalysis.id,
      analysis: analysisData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-text-emotion function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});