import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Processa base64 in chunks per evitare problemi di memoria
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Funzione per generare analisi mock quando OpenAI non è disponibile
async function getMockVoiceAnalysis(petId: string, userId: string) {
  const emotions = ['felice', 'calmo', 'ansioso', 'eccitato', 'giocoso'];
  const ownerEmotions = ['calmo', 'preoccupato', 'affettuoso', 'entusiasta'];
  
  const petEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const ownerEmotion = ownerEmotions[Math.floor(Math.random() * ownerEmotions.length)];
  
  const mockData = {
    pet_emotion: {
      primary: petEmotion,
      confidence: Math.floor(Math.random() * 30) + 70,
      secondary: [{ emotion: emotions.find(e => e !== petEmotion) || 'calmo', confidence: 30 }]
    },
    owner_emotion: {
      primary: ownerEmotion,
      confidence: Math.floor(Math.random() * 25) + 75,
      secondary: [{ emotion: ownerEmotions.find(e => e !== ownerEmotion) || 'calmo', confidence: 25 }]
    },
    combined_insights: `Analisi della dinamica emotiva tra il pet (${petEmotion}) e il proprietario (${ownerEmotion}). L'interazione mostra una correlazione positiva tra gli stati emotivi.`,
    pet_behavioral_insights: `Il pet mostra segni di ${petEmotion}. Questo stato emotivo è tipico e suggerisce un buon equilibrio comportamentale.`,
    owner_emotional_insights: `Il proprietario appare ${ownerEmotion} nell'interazione con il pet, indicando un legame positivo.`,
    recommendations: [
      'Continua a monitorare il comportamento per identificare pattern',
      'Mantieni routine regolari per stabilità emotiva'
    ],
    personalized_advice: [
      'Osserva come le tue emozioni influenzano quelle del pet',
      'Crea momenti di qualità insieme per rafforzare il legame'
    ],
    triggers: ['cambiamenti ambientali', 'nuove persone'],
    transcription: 'Analisi mock generata per problemi di quota API'
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
      file_name: 'Analisi Vocale Combinata (Simulata)',
      file_type: 'voice_analysis',
      file_size: 1024,
      storage_path: null,
      primary_emotion: mockData.pet_emotion.primary,
      primary_confidence: mockData.pet_emotion.confidence / 100,
      secondary_emotions: mockData.pet_emotion.secondary,
      behavioral_insights: mockData.combined_insights,
      recommendations: mockData.recommendations.concat(mockData.personalized_advice),
      triggers: mockData.triggers,
      analysis_duration: null,
      metadata: {
        analysis_type: 'voice_combined_mock',
        transcription: mockData.transcription,
        pet_emotion: mockData.pet_emotion,
        owner_emotion: mockData.owner_emotion,
        pet_behavioral_insights: mockData.pet_behavioral_insights,
        owner_emotional_insights: mockData.owner_emotional_insights,
        combined_insights: mockData.combined_insights,
        mock: true
      }
    })
    .select()
    .single();

  if (saveError) {
    console.error('Errore salvataggio database:', saveError);
    throw saveError;
  }

  console.log('Mock analysis saved successfully:', savedAnalysis.id);

  return new Response(JSON.stringify({
    success: true,
    analysisId: savedAnalysis.id,
    analysis: mockData,
    transcription: mockData.transcription
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
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      throw new Error('Invalid JSON in request body');
    }
    
    console.log('Request body keys:', Object.keys(requestBody));
    
    const { audioData, petId, userId } = requestBody;

    if (!audioData || !petId || !userId) {
      console.error('Missing required fields:', { 
        hasAudioData: !!audioData, 
        hasPetId: !!petId, 
        hasUserId: !!userId 
      });
      throw new Error('Audio data, pet ID e user ID sono richiesti');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key non configurata');
    }

    console.log('Processing voice analysis for pet:', petId);

    // Step 1: Trascrivi l'audio con Whisper
    const binaryAudio = processBase64Chunks(audioData);
    
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'it');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.json();
      console.error('OpenAI transcription error:', error);
      throw new Error(`Errore trascrizione: ${error.error?.message || 'Errore sconosciuto'}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const transcription = transcriptionResult.text;
    
    console.log('Transcription completed:', transcription);

    // Step 2: Analizza le emozioni con GPT-4
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Sei un esperto veterinario comportamentale specializzato nell'analisi delle emozioni degli animali domestici e degli esseri umani.

            Analizza questa trascrizione di una nota vocale in cui il proprietario descrive il comportamento del suo pet.
            Determina:
            1. L'emozione primaria del PET basata sulla descrizione
            2. L'emozione primaria del PROPRIETARIO dall'analisi del tono e delle parole
            3. Le confidenze di entrambe le analisi (0-100%)
            4. Emozioni secondarie se presenti
            5. Insights comportamentali per il pet
            6. Insights emotivi per il proprietario
            7. Raccomandazioni che tengano conto di entrambe le emozioni
            8. Consigli personalizzati per migliorare il benessere di entrambi

            Emozioni disponibili per il pet: felice, calmo, ansioso, eccitato, triste, aggressivo, giocoso, spaventato, confuso, rilassato
            Emozioni disponibili per il proprietario: calmo, preoccupato, felice, frustrato, affettuoso, ansioso, entusiasta, triste, soddisfatto, stressato

            Rispondi SEMPRE in formato JSON valido con questa struttura:
            {
              "pet_emotion": {
                "primary": "emozione_principale",
                "confidence": numero_0_100,
                "secondary": [{"emotion": "nome", "confidence": numero}]
              },
              "owner_emotion": {
                "primary": "emozione_principale", 
                "confidence": numero_0_100,
                "secondary": [{"emotion": "nome", "confidence": numero}]
              },
              "combined_insights": "analisi della dinamica emotiva pet-proprietario",
              "pet_behavioral_insights": "insights specifici sul comportamento del pet",
              "owner_emotional_insights": "insights sullo stato emotivo del proprietario",
              "recommendations": ["raccomandazione1", "raccomandazione2"],
              "personalized_advice": ["consiglio1", "consiglio2"],
              "triggers": ["trigger1", "trigger2"],
              "transcription": "${transcription}"
            }`
          },
          {
            role: 'user',
            content: `Analizza questa trascrizione di una nota vocale del proprietario che descrive il suo pet: "${transcription}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json();
      console.error('OpenAI analysis error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Errore sconosciuto'}`);
    }

    const aiResponse = await analysisResponse.json();
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
        file_name: 'Analisi Vocale Combinata',
        file_type: 'voice_analysis',
        file_size: binaryAudio.length,
        storage_path: null,
        primary_emotion: analysisData.pet_emotion.primary,
        primary_confidence: analysisData.pet_emotion.confidence / 100,
        secondary_emotions: analysisData.pet_emotion.secondary,
        behavioral_insights: analysisData.combined_insights,
        recommendations: analysisData.recommendations.concat(analysisData.personalized_advice),
        triggers: analysisData.triggers || [],
        analysis_duration: null,
        metadata: {
          analysis_type: 'voice_combined',
          transcription: transcription,
          pet_emotion: analysisData.pet_emotion,
          owner_emotion: analysisData.owner_emotion,
          pet_behavioral_insights: analysisData.pet_behavioral_insights,
          owner_emotional_insights: analysisData.owner_emotional_insights,
          combined_insights: analysisData.combined_insights
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
      analysis: analysisData,
      transcription: transcription
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-voice-emotions function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});