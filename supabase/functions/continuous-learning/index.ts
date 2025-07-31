import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { action, ...params } = await req.json();

    switch (action) {
      case 'submit_feedback':
        return await submitFeedback(supabaseClient, params);
      case 'detect_patterns':
        return await detectPatterns(supabaseClient, params);
      case 'retrain_model':
        return await retrainModel(supabaseClient, params);
      case 'get_learning_insights':
        return await getLearningInsights(supabaseClient, params);
      default:
        throw new Error('Azione non supportata');
    }
  } catch (error) {
    console.error('Errore nel continuous learning:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function submitFeedback(supabase: any, params: any) {
  const { userId, petId, analysisId, predictionType, predictedValue, actualValue, feedbackType, contextData } = params;

  // Calcola accuracy score basato sulla correttezza
  const accuracyScore = predictedValue === actualValue ? 1.0 : 
    calculateSimilarityScore(predictedValue, actualValue);

  const { data, error } = await supabase
    .from('prediction_feedback')
    .insert({
      user_id: userId,
      pet_id: petId,
      analysis_id: analysisId,
      prediction_type: predictionType,
      predicted_value: predictedValue,
      actual_value: actualValue,
      accuracy_score: accuracyScore,
      feedback_type: feedbackType,
      context_data: contextData || {}
    });

  if (error) throw error;

  // Aggiorna metriche del modello
  await updateModelMetrics(supabase, predictionType, userId, accuracyScore);

  return new Response(
    JSON.stringify({ success: true, accuracy_score: accuracyScore }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function detectPatterns(supabase: any, params: any) {
  const { userId, petId } = params;

  // Chiama la funzione del database per rilevare pattern
  const { error } = await supabase.rpc('detect_behavior_patterns', {
    p_user_id: userId,
    p_pet_id: petId
  });

  if (error) throw error;

  // Recupera i pattern rilevati
  const { data: patterns } = await supabase
    .from('learning_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('pet_id', petId)
    .eq('is_active', true)
    .order('confidence_score', { ascending: false });

  return new Response(
    JSON.stringify({ patterns: patterns || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function retrainModel(supabase: any, params: any) {
  const { modelType, userId } = params;

  // Simula il training (in un'implementazione reale useresti un servizio ML)
  const performanceBefore = await calculateCurrentModelPerformance(supabase, modelType);
  
  // Recupera feedback per il training
  const { data: feedbackData } = await supabase
    .from('prediction_feedback')
    .select('*')
    .eq('prediction_type', modelType)
    .eq('user_id', userId)
    .not('actual_value', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!feedbackData || feedbackData.length < 5) {
    throw new Error('Dati insufficienti per il training (minimo 5 feedback)');
  }

  // Simula miglioramenti basati sui feedback
  const performanceAfter = {
    accuracy: Math.min(0.95, performanceBefore.accuracy + 0.05),
    precision: Math.min(0.95, performanceBefore.precision + 0.03),
    recall: Math.min(0.95, performanceBefore.recall + 0.04)
  };

  const improvements = {
    accuracy_improvement: performanceAfter.accuracy - performanceBefore.accuracy,
    precision_improvement: performanceAfter.precision - performanceBefore.precision,
    recall_improvement: performanceAfter.recall - performanceBefore.recall,
    training_samples: feedbackData.length
  };

  // Aggiorna metriche del modello con schema corretto
  const today = new Date().toISOString().split('T')[0];
  await Promise.all([
    supabase.from('ml_model_metrics').insert({
      user_id: userId,
      model_type: modelType,
      metric_type: 'accuracy',
      metric_value: performanceAfter.accuracy,
      sample_count: feedbackData.length,
      metric_date: today
    }),
    supabase.from('ml_model_metrics').insert({
      user_id: userId,
      model_type: modelType,
      metric_type: 'precision',
      metric_value: performanceAfter.precision,
      sample_count: feedbackData.length,
      metric_date: today
    }),
    supabase.from('ml_model_metrics').insert({
      user_id: userId,
      model_type: modelType,
      metric_type: 'recall',
      metric_value: performanceAfter.recall,
      sample_count: feedbackData.length,
      metric_date: today
    })
  ]);

  return new Response(
    JSON.stringify({ 
      improvements,
      training_data_count: feedbackData.length,
      performance_before: performanceBefore,
      performance_after: performanceAfter
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getLearningInsights(supabase: any, params: any) {
  const { userId, petId } = params;

  // Recupera metriche recenti
  const { data: metrics } = await supabase
    .from('ml_model_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Recupera pattern dell'utente
  const { data: patterns } = await supabase
    .from('learning_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('pet_id', petId)
    .eq('is_active', true);

  // Recupera feedback recente
  const { data: recentFeedback } = await supabase
    .from('prediction_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })
    .limit(50);

  // Calcola statistiche
  const avgAccuracy = recentFeedback?.length > 0 
    ? recentFeedback.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / recentFeedback.length
    : 0;

  const insights = {
    model_performance: metrics?.reduce((acc, m) => {
      acc[m.model_type] = acc[m.model_type] || {};
      acc[m.model_type][m.metric_type] = m.metric_value;
      return acc;
    }, {}),
    user_patterns: patterns,
    recent_accuracy: avgAccuracy,
    feedback_count: recentFeedback?.length || 0,
    learning_trends: calculateLearningTrends(recentFeedback || [])
  };

  return new Response(
    JSON.stringify({ insights }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateSimilarityScore(predicted: string, actual: string): number {
  if (!predicted || !actual) return 0;
  
  // Mappa emozioni simili
  const emotionGroups = {
    'positive': ['felice', 'giocoso', 'calmo', 'affettuoso'],
    'negative': ['triste', 'ansioso', 'spaventato', 'depresso'],
    'aggressive': ['aggressivo', 'agitato'],
    'neutral': ['curioso', 'normale']
  };

  // Trova il gruppo di ogni emozione
  const predictedGroup = Object.keys(emotionGroups).find(group => 
    emotionGroups[group].includes(predicted.toLowerCase()));
  const actualGroup = Object.keys(emotionGroups).find(group => 
    emotionGroups[group].includes(actual.toLowerCase()));

  if (predictedGroup === actualGroup) return 0.7;
  return 0.2;
}

async function updateModelMetrics(supabase: any, modelType: string, userId: string, accuracyScore: number) {
  const today = new Date().toISOString().split('T')[0];
  
  // Recupera o crea metrica giornaliera
  const { data: existingMetric } = await supabase
    .from('ml_model_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('model_type', modelType)
    .eq('metric_type', 'accuracy')
    .eq('metric_date', today)
    .maybeSingle();

  if (existingMetric) {
    // Aggiorna metrica esistente
    const newCount = existingMetric.sample_count + 1;
    const newValue = ((existingMetric.metric_value * existingMetric.sample_count) + accuracyScore) / newCount;
    
    await supabase
      .from('ml_model_metrics')
      .update({
        metric_value: newValue,
        sample_count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingMetric.id);
  } else {
    // Crea nuova metrica
    await supabase
      .from('ml_model_metrics')
      .insert({
        user_id: userId,
        model_type: modelType,
        metric_type: 'accuracy',
        metric_value: accuracyScore,
        sample_count: 1,
        metric_date: today
      });
  }
}

async function calculateCurrentModelPerformance(supabase: any, modelType: string) {
  const { data } = await supabase.rpc('calculate_prediction_accuracy', {
    p_model_type: modelType,
    p_days_back: 30
  });

  return {
    accuracy: data || 0.75,
    precision: (data || 0.75) * 0.95,
    recall: (data || 0.75) * 0.90
  };
}

function calculateLearningTrends(feedbackData: any[]): any {
  if (feedbackData.length < 5) return { trend: 'insufficient_data' };

  const sortedByDate = feedbackData.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const recentHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
  const olderHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));

  const recentAvg = recentHalf.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / recentHalf.length;
  const olderAvg = olderHalf.reduce((sum, f) => sum + (f.accuracy_score || 0), 0) / olderHalf.length;

  const improvement = recentAvg - olderAvg;

  return {
    trend: improvement > 0.05 ? 'improving' : improvement < -0.05 ? 'declining' : 'stable',
    improvement_rate: improvement,
    recent_accuracy: recentAvg,
    older_accuracy: olderAvg
  };
}