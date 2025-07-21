import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisData {
  diaryEntries: any[];
  healthMetrics: any[];
  wellnessScores: any[];
  petInfo: any;
  recentActivity: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petId, userId } = await req.json();
    
    if (!petId || !userId) {
      throw new Error('Pet ID and User ID are required');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log(`Starting predictive analysis for pet ${petId}, user ${userId}`);

    // Raccoglie tutti i dati disponibili
    const analysisData = await gatherAllPetData(supabase, petId, userId);
    
    if (!analysisData.diaryEntries.length && !analysisData.healthMetrics.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Dati insufficienti per generare previsioni. Aggiungi più voci al diario del pet.' 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Genera analisi AI dei pattern comportamentali
    const aiAnalysis = await generateAIAnalysis(analysisData);
    console.log('AI Analysis completed:', aiAnalysis);

    // Crea previsioni comportamentali
    const predictions = await createBehaviorPredictions(supabase, petId, userId, aiAnalysis);
    
    // Genera early warnings se necessario
    const warnings = await generateEarlyWarnings(supabase, petId, userId, aiAnalysis);
    
    // Crea raccomandazioni di intervento
    const interventions = await generateInterventions(supabase, petId, userId, aiAnalysis);
    
    // Aggiorna health risk assessment
    const riskAssessment = await updateRiskAssessment(supabase, petId, userId, aiAnalysis);

    console.log(`Generated: ${predictions.length} predictions, ${warnings.length} warnings, ${interventions.length} interventions`);

    return new Response(
      JSON.stringify({
        success: true,
        generated: {
          predictions: predictions.length,
          warnings: warnings.length,
          interventions: interventions.length,
          riskScore: riskAssessment?.overall_risk_score
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predictive analysis:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function gatherAllPetData(supabase: any, petId: string, userId: string): Promise<AnalysisData> {
  const [
    { data: diaryEntries },
    { data: healthMetrics },
    { data: wellnessScores },
    { data: petInfo },
    { data: activityLog }
  ] = await Promise.all([
    // Ultimi 30 giorni di diary entries
    supabase
      .from('diary_entries')
      .select('*')
      .eq('pet_id', petId)
      .eq('user_id', userId)
      .gte('entry_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('entry_date', { ascending: false }),
      
    // Ultimi 30 giorni di metriche di salute
    supabase
      .from('health_metrics')
      .select('*')
      .eq('pet_id', petId)
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false }),
      
    // Ultimi wellness scores
    supabase
      .from('pet_wellness_scores')
      .select('*')
      .eq('pet_id', petId)
      .eq('user_id', userId)
      .gte('recorded_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_date', { ascending: false }),
      
    // Info del pet
    supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('user_id', userId)
      .single(),
      
    // Log delle attività recenti
    supabase
      .from('activity_log')
      .select('*')
      .eq('pet_id', petId)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  return {
    diaryEntries: diaryEntries || [],
    healthMetrics: healthMetrics || [],
    wellnessScores: wellnessScores || [],
    petInfo,
    recentActivity: activityLog || []
  };
}

async function generateAIAnalysis(data: AnalysisData) {
  const prompt = `
Analizza questi dati di un ${data.petInfo?.type || 'pet'} di nome ${data.petInfo?.name || 'sconosciuto'}:

INFORMAZIONI PET:
- Età: ${data.petInfo?.age || 'N/A'} anni
- Razza: ${data.petInfo?.breed || 'N/A'}
- Peso: ${data.petInfo?.weight || 'N/A'} kg
- Condizioni salute: ${data.petInfo?.health_conditions || 'Nessuna nota'}

DIARY ENTRIES (ultimi 30 giorni - ${data.diaryEntries.length} entries):
${data.diaryEntries.map(entry => 
  `Data: ${entry.entry_date} | Mood: ${entry.mood_score}/10 | Tags: ${entry.behavioral_tags?.join(', ') || 'N/A'} | Note: ${entry.content?.substring(0, 100) || 'N/A'}`
).join('\n')}

METRICHE SALUTE (${data.healthMetrics.length} metriche):
${data.healthMetrics.map(metric => 
  `${metric.metric_type}: ${metric.value} ${metric.unit || ''} (${metric.recorded_at})`
).join('\n')}

WELLNESS SCORES (${data.wellnessScores.length} valutazioni):
${data.wellnessScores.map(score => 
  `${score.recorded_date}: ${score.wellness_score}/100 - Fattori: ${JSON.stringify(score.factors)}`
).join('\n')}

ATTIVITÀ RECENTI:
${data.recentActivity.map(activity => 
  `${activity.activity_type}: ${activity.activity_description}`
).join('\n')}

Fornisci un'analisi JSON strutturata con:
1. behavioral_patterns: array di pattern identificati con confidence (0-1)
2. health_trends: tendenze nella salute (improving/declining/stable) con dettagli
3. risk_factors: fattori di rischio identificati con severity (low/medium/high)
4. predicted_behaviors: comportamenti probabili nei prossimi 7 giorni
5. early_warnings: avvisi da generare (se necessari)
6. interventions: interventi raccomandati con priority (low/medium/high)
7. overall_risk_score: punteggio rischio 0-100
8. confidence_level: livello fiducia analisi (0-1)

Rispondi SOLO con JSON valido, senza altro testo.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sei un veterinario esperto in analisi comportamentale dei pet. Analizza i dati forniti e rispondi sempre e solo con JSON valido.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    }),
  });

  const data_ai = await response.json();
  const analysisText = data_ai.choices[0].message.content;
  
  try {
    return JSON.parse(analysisText);
  } catch (e) {
    console.error('Failed to parse AI response:', analysisText);
    // Fallback analysis
    return {
      behavioral_patterns: [],
      health_trends: 'stable',
      risk_factors: [],
      predicted_behaviors: [],
      early_warnings: [],
      interventions: [],
      overall_risk_score: 50,
      confidence_level: 0.3
    };
  }
}

async function createBehaviorPredictions(supabase: any, petId: string, userId: string, analysis: any) {
  const predictions = [];
  
  for (const behavior of analysis.predicted_behaviors || []) {
    const prediction = {
      user_id: userId,
      pet_id: petId,
      prediction_date: new Date().toISOString().split('T')[0],
      prediction_window: 'next_7_days',
      predicted_behaviors: { [behavior.type || 'general']: behavior },
      confidence_scores: { [behavior.type || 'general']: behavior.confidence || 0.7 },
      contributing_factors: {
        diary_entries_analyzed: analysis.diary_entries_count || 0,
        health_metrics_analyzed: analysis.health_metrics_count || 0,
        patterns_identified: analysis.behavioral_patterns?.length || 0
      }
    };
    
    const { data, error } = await supabase
      .from('behavior_predictions')
      .insert([prediction])
      .select()
      .single();
      
    if (!error && data) predictions.push(data);
  }
  
  return predictions;
}

async function generateEarlyWarnings(supabase: any, petId: string, userId: string, analysis: any) {
  const warnings = [];
  
  for (const warning of analysis.early_warnings || []) {
    const warningData = {
      user_id: userId,
      pet_id: petId,
      warning_type: warning.type || 'behavioral_concern',
      severity_level: warning.severity || 'medium',
      alert_message: warning.message || 'Pattern di comportamento anomalo rilevato',
      pattern_detected: {
        pattern: warning.pattern || 'unknown',
        confidence: warning.confidence || 0.7,
        contributing_factors: warning.factors || []
      },
      suggested_actions: warning.actions || ['Monitora il comportamento', 'Considera una visita veterinaria'],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data, error } = await supabase
      .from('early_warnings')
      .insert([warningData])
      .select()
      .single();
      
    if (!error && data) warnings.push(data);
  }
  
  return warnings;
}

async function generateInterventions(supabase: any, petId: string, userId: string, analysis: any) {
  const interventions = [];
  
  for (const intervention of analysis.interventions || []) {
    const interventionData = {
      user_id: userId,
      pet_id: petId,
      intervention_type: intervention.type || 'behavioral_training',
      priority_level: intervention.priority || 'medium',
      reasoning: intervention.reasoning || 'Basato sui pattern comportamentali identificati',
      recommended_timing: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      success_probability: intervention.success_probability || 0.75,
      estimated_cost: intervention.estimated_cost || null,
      expected_outcomes: {
        behavioral_improvement: intervention.expected_improvement || 'moderate',
        timeline: intervention.timeline || '2-4 weeks',
        success_indicators: intervention.success_indicators || []
      }
    };
    
    const { data, error } = await supabase
      .from('intervention_recommendations')
      .insert([interventionData])
      .select()
      .single();
      
    if (!error && data) interventions.push(data);
  }
  
  return interventions;
}

async function updateRiskAssessment(supabase: any, petId: string, userId: string, analysis: any) {
  const assessmentData = {
    user_id: userId,
    pet_id: petId,
    assessment_date: new Date().toISOString().split('T')[0],
    overall_risk_score: Math.round(analysis.overall_risk_score || 50),
    risk_categories: {
      behavioral: analysis.risk_factors?.filter((r: any) => r.category === 'behavioral').length || 0,
      physical: analysis.risk_factors?.filter((r: any) => r.category === 'physical').length || 0,
      environmental: analysis.risk_factors?.filter((r: any) => r.category === 'environmental').length || 0
    },
    risk_factors: {
      identified_patterns: analysis.behavioral_patterns || [],
      health_trends: analysis.health_trends || 'stable',
      confidence_level: analysis.confidence_level || 0.7
    },
    recommendations: analysis.interventions?.map((i: any) => i.type) || [],
    trend_direction: analysis.health_trends === 'improving' ? 'decreasing' : 
                     analysis.health_trends === 'declining' ? 'increasing' : 'stable'
  };
  
  const { data, error } = await supabase
    .from('health_risk_assessments')
    .upsert(assessmentData, { 
      onConflict: 'user_id,pet_id,assessment_date',
      ignoreDuplicates: false 
    })
    .select()
    .single();
    
  return data;
}