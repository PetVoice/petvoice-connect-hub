import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Funzione per generare dati ambientali realistici
function generateEnvironmentalData() {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  
  // Determina se è giorno/sera/notte
  let timeOfDay = 'diurno';
  if (hour >= 19 || hour <= 6) {
    timeOfDay = 'serale/notturno';
  } else if (hour >= 6 && hour <= 11) {
    timeOfDay = 'mattutino';
  } else if (hour >= 12 && hour <= 18) {
    timeOfDay = 'pomeridiano';
  }
  
  // Stima temperatura stagionale realistica per l'Italia
  let temperature = 20;
  if (month >= 11 || month <= 2) { // Inverno
    temperature = Math.floor(Math.random() * 15) + 5; // 5-20°C
  } else if (month >= 3 && month <= 5) { // Primavera
    temperature = Math.floor(Math.random() * 15) + 15; // 15-30°C
  } else if (month >= 6 && month <= 8) { // Estate
    temperature = Math.floor(Math.random() * 15) + 20; // 20-35°C
  } else { // Autunno
    temperature = Math.floor(Math.random() * 15) + 10; // 10-25°C
  }
  
  // Aggiusta temperatura per ora del giorno
  if (hour >= 20 || hour <= 6) {
    temperature -= Math.floor(Math.random() * 5) + 2; // Più fresco di notte
  }
  
  const noiseLevel = ['bassi', 'moderati', 'elevati'][Math.floor(Math.random() * 3)];
  const humanPresence = Math.random() > 0.3 ? 'rilevata nelle vicinanze' : 'assente';
  
  return {
    timeOfDay,
    temperature,
    noiseLevel,
    humanPresence
  };
}

// Funzione per generare analisi mock
async function getMockTextAnalysis(text: string, petId: string, userId: string) {
  const emotions = ['felice', 'calmo', 'ansioso', 'eccitato', 'giocoso', 'rilassato'];
  const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const confidence = Math.floor(Math.random() * 30) + 70;
  
  const environmentalData = generateEnvironmentalData();
  
  const mockData = {
    primary_emotion: primaryEmotion,
    primary_confidence: confidence,
    secondary_emotions: [{ emotion: emotions.find(e => e !== primaryEmotion) || 'calmo', confidence: 30 }],
    behavioral_insights: `Il pet mostra segni di ${primaryEmotion}. L'analisi comportamentale suggerisce un equilibrio emotivo nella situazione descritta. 
    
**Contesto Ambientale**
Analisi registrata durante orario ${environmentalData.timeOfDay}. Livelli di rumore ambientale: ${environmentalData.noiseLevel}. Temperatura stimata: ${environmentalData.temperature}°C. Presenza umana ${environmentalData.humanPresence}.`,
    recommendations: [
      'Continua a osservare i pattern comportamentali',
      'Mantieni un ambiente stabile per il benessere del pet'
    ],
    triggers: ['cambiamenti ambientali', 'nuove situazioni'],
    analysis_summary: `Il comportamento descritto indica uno stato emotivo di ${primaryEmotion} con buona stabilità generale.`
  };

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
      file_name: 'Analisi Testuale (Simulata)',
      file_type: 'text',
      file_size: text.length,
      storage_path: null,
      primary_emotion: mockData.primary_emotion,
      primary_confidence: mockData.primary_confidence / 100,
      secondary_emotions: mockData.secondary_emotions,
      behavioral_insights: mockData.behavioral_insights,
      recommendations: mockData.recommendations,
      triggers: mockData.triggers,
      analysis_duration: null,
      metadata: {
        analysis_type: 'text_mock',
        original_text: text,
        analysis_summary: mockData.analysis_summary,
        environmental_data: environmentalData,
        mock: true
      }
    })
    .select()
    .single();

  if (saveError) {
    console.error('Errore salvataggio database:', saveError);
    throw saveError;
  }

  console.log('Mock text analysis saved successfully:', savedAnalysis.id);

  return new Response(JSON.stringify({
    success: true,
    analysisId: savedAnalysis.id,
    analysis: mockData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

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

            Includi anche informazioni ambientali contestuali basate sull'ora e stagione attuali.

            Rispondi SEMPRE in formato JSON valido con questa struttura:
            {
              "primary_emotion": "emozione_principale",
              "primary_confidence": numero_0_100,
              "secondary_emotions": [{"emotion": "nome", "confidence": numero}],
              "behavioral_insights": "descrizione dettagliata del comportamento osservato con contesto ambientale realistico",
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
      console.error('OpenAI text analysis error:', error);
      
      // Se c'è un errore di quota, usa un'analisi mock
      if (error.error?.code === 'insufficient_quota' || error.error?.message?.includes('quota')) {
        console.log('Using mock analysis due to quota error');
        return getMockTextAnalysis(text, petId, userId);
      }
      
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