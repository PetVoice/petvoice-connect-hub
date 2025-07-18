import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessingTask {
  type: 'pattern_discovery' | 'trend_analysis' | 'anomaly_detection' | 'cross_species_transfer';
  species_filter?: string[];
  time_range?: { start: string; end: string };
  confidence_threshold?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { task }: { task: ProcessingTask } = await req.json();
    
    console.log('Processing community learning task:', task.type);

    switch (task.type) {
      case 'pattern_discovery':
        return await processPatternDiscovery(supabase, task);
      case 'trend_analysis':
        return await processTrendAnalysis(supabase, task);
      case 'anomaly_detection':
        return await processAnomalyDetection(supabase, task);
      case 'cross_species_transfer':
        return await processCrossSpeciesTransfer(supabase, task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

  } catch (error) {
    console.error('Error in community-learning-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Community learning processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processPatternDiscovery(supabase: any, task: ProcessingTask) {
  console.log('Starting pattern discovery...');
  
  // 1. Ottieni dati comportamentali aggregati
  const { data: diaryData, error: diaryError } = await supabase
    .from('diary_entries')
    .select(`
      pet_id,
      mood_score,
      behavioral_tags,
      entry_date,
      weather_condition,
      temperature,
      pets!inner(type, breed, age)
    `)
    .gte('entry_date', task.time_range?.start || '2024-01-01')
    .lte('entry_date', task.time_range?.end || new Date().toISOString());

  if (diaryError) throw diaryError;

  // 2. Ottieni dati delle analisi emozionali
  const { data: analysisData, error: analysisError } = await supabase
    .from('pet_analyses')
    .select(`
      pet_id,
      primary_emotion,
      primary_confidence,
      secondary_emotions,
      triggers,
      created_at,
      pets!inner(type, breed, age)
    `)
    .gte('created_at', task.time_range?.start || '2024-01-01')
    .lte('created_at', task.time_range?.end || new Date().toISOString());

  if (analysisError) throw analysisError;

  // 3. Analizza pattern comportamentali
  const patterns = await analyzePatterns(diaryData, analysisData, task);
  
  // 4. Salva pattern scoperti
  const savedPatterns = [];
  for (const pattern of patterns) {
    const { data, error } = await supabase
      .from('community_patterns')
      .insert({
        pattern_type: pattern.type,
        species_affected: pattern.species,
        pattern_data: pattern.data,
        confidence_score: pattern.confidence,
        sample_size: pattern.sampleSize,
        description: pattern.description,
        impact_level: pattern.impact,
        metadata: pattern.metadata
      })
      .select();

    if (!error && data) {
      savedPatterns.push(data[0]);
      
      // Crea notifiche per pattern ad alto impatto
      if (pattern.impact === 'high' || pattern.impact === 'critical') {
        await createPatternNotifications(supabase, data[0], pattern);
      }
    }
  }

  console.log(`Pattern discovery completed: ${savedPatterns.length} patterns found`);

  return new Response(JSON.stringify({
    success: true,
    patterns_discovered: savedPatterns.length,
    patterns: savedPatterns,
    processing_time: Date.now()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzePatterns(diaryData: any[], analysisData: any[], task: ProcessingTask) {
  const patterns = [];
  
  // Pattern 1: Correlazioni mood-weather
  const weatherMoodPattern = analyzeWeatherMoodCorrelation(diaryData);
  if (weatherMoodPattern.confidence > (task.confidence_threshold || 0.7)) {
    patterns.push(weatherMoodPattern);
  }

  // Pattern 2: Emozioni stagionali
  const seasonalPattern = analyzeSeasonalEmotions(analysisData);
  if (seasonalPattern.confidence > (task.confidence_threshold || 0.7)) {
    patterns.push(seasonalPattern);
  }

  // Pattern 3: Comportamenti ricorrenti per breed
  const breedBehaviorPattern = analyzeBreedBehaviors(diaryData);
  if (breedBehaviorPattern.confidence > (task.confidence_threshold || 0.7)) {
    patterns.push(breedBehaviorPattern);
  }

  // Pattern 4: Trigger comuni cross-species
  const triggerPattern = analyzeCrossTriggers(analysisData);
  if (triggerPattern.confidence > (task.confidence_threshold || 0.7)) {
    patterns.push(triggerPattern);
  }

  return patterns;
}

function analyzeWeatherMoodCorrelation(data: any[]) {
  const weatherMoodMap = new Map();
  
  data.forEach(entry => {
    if (entry.weather_condition && entry.mood_score) {
      const weather = entry.weather_condition;
      if (!weatherMoodMap.has(weather)) {
        weatherMoodMap.set(weather, { scores: [], count: 0 });
      }
      weatherMoodMap.get(weather).scores.push(entry.mood_score);
      weatherMoodMap.get(weather).count++;
    }
  });

  const correlations = [];
  for (const [weather, stats] of weatherMoodMap.entries()) {
    if (stats.count >= 10) { // Minimo 10 campioni
      const avgMood = stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length;
      correlations.push({ weather, avgMood, count: stats.count });
    }
  }

  // Ordina per mood score
  correlations.sort((a, b) => b.avgMood - a.avgMood);

  const confidence = calculateStatisticalSignificance(correlations);
  const species = [...new Set(data.map(d => d.pets.type))];

  return {
    type: 'behavioral',
    confidence,
    species,
    sampleSize: data.length,
    description: `Correlazione meteo-umore: tempo ${correlations[0]?.weather} associato a mood più alto (${correlations[0]?.avgMood.toFixed(1)})`,
    impact: confidence > 0.8 ? 'high' : 'medium',
    data: {
      correlations,
      analysis_type: 'weather_mood_correlation',
      strongest_correlation: correlations[0]
    },
    metadata: {
      analysis_date: new Date().toISOString(),
      method: 'statistical_correlation',
      min_sample_size: 10
    }
  };
}

function analyzeSeasonalEmotions(data: any[]) {
  const seasonalMap = new Map();
  
  data.forEach(analysis => {
    const date = new Date(analysis.created_at);
    const month = date.getMonth();
    const season = getSeason(month);
    
    if (!seasonalMap.has(season)) {
      seasonalMap.set(season, { emotions: [], count: 0 });
    }
    seasonalMap.get(season).emotions.push(analysis.primary_emotion);
    seasonalMap.get(season).count++;
  });

  const seasonalPatterns = [];
  for (const [season, stats] of seasonalMap.entries()) {
    if (stats.count >= 20) {
      const emotionCounts = stats.emotions.reduce((acc: any, emotion: string) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});
      
      const dominantEmotion = Object.entries(emotionCounts)
        .sort(([,a]: any, [,b]: any) => b - a)[0];
      
      seasonalPatterns.push({
        season,
        dominantEmotion: dominantEmotion[0],
        frequency: dominantEmotion[1] / stats.count,
        count: stats.count
      });
    }
  }

  const confidence = seasonalPatterns.length >= 3 ? 0.75 : 0.5;
  const species = [...new Set(data.map(d => d.pets.type))];

  return {
    type: 'seasonal',
    confidence,
    species,
    sampleSize: data.length,
    description: `Pattern stagionali identificati: ${seasonalPatterns.map(p => `${p.season}: ${p.dominantEmotion}`).join(', ')}`,
    impact: 'medium',
    data: {
      seasonal_patterns: seasonalPatterns,
      analysis_type: 'seasonal_emotion_analysis'
    },
    metadata: {
      analysis_date: new Date().toISOString(),
      method: 'temporal_clustering'
    }
  };
}

function analyzeBreedBehaviors(data: any[]) {
  const breedBehaviorMap = new Map();
  
  data.forEach(entry => {
    if (entry.pets.breed && entry.behavioral_tags?.length > 0) {
      const breed = entry.pets.breed;
      if (!breedBehaviorMap.has(breed)) {
        breedBehaviorMap.set(breed, { behaviors: [], count: 0 });
      }
      breedBehaviorMap.get(breed).behaviors.push(...entry.behavioral_tags);
      breedBehaviorMap.get(breed).count++;
    }
  });

  const breedPatterns = [];
  for (const [breed, stats] of breedBehaviorMap.entries()) {
    if (stats.count >= 15) {
      const behaviorCounts = stats.behaviors.reduce((acc: any, behavior: string) => {
        acc[behavior] = (acc[behavior] || 0) + 1;
        return acc;
      }, {});
      
      const topBehaviors = Object.entries(behaviorCounts)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 3);
      
      breedPatterns.push({
        breed,
        topBehaviors: topBehaviors.map(([behavior, count]: any) => ({
          behavior,
          frequency: count / stats.count
        })),
        sampleSize: stats.count
      });
    }
  }

  const confidence = breedPatterns.length >= 2 ? 0.8 : 0.6;
  const species = [...new Set(data.map(d => d.pets.type))];

  return {
    type: 'behavioral',
    confidence,
    species,
    sampleSize: data.length,
    description: `Comportamenti caratteristici per breed identificati per ${breedPatterns.length} razze`,
    impact: 'medium',
    data: {
      breed_patterns: breedPatterns,
      analysis_type: 'breed_behavior_clustering'
    },
    metadata: {
      analysis_date: new Date().toISOString(),
      method: 'behavior_frequency_analysis',
      min_breed_samples: 15
    }
  };
}

function analyzeCrossTriggers(data: any[]) {
  const speciesTriggerMap = new Map();
  
  data.forEach(analysis => {
    if (analysis.triggers?.length > 0) {
      const species = analysis.pets.type;
      if (!speciesTriggerMap.has(species)) {
        speciesTriggerMap.set(species, { triggers: [], count: 0 });
      }
      speciesTriggerMap.get(species).triggers.push(...analysis.triggers);
      speciesTriggerMap.get(species).count++;
    }
  });

  // Trova trigger comuni tra specie
  const commonTriggers = new Map();
  const speciesArray = Array.from(speciesTriggerMap.keys());
  
  for (const species of speciesArray) {
    const triggers = speciesTriggerMap.get(species).triggers;
    const triggerCounts = triggers.reduce((acc: any, trigger: string) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {});
    
    for (const [trigger, count] of Object.entries(triggerCounts)) {
      if (!commonTriggers.has(trigger)) {
        commonTriggers.set(trigger, { species: [], totalCount: 0 });
      }
      commonTriggers.get(trigger).species.push({ species, count });
      commonTriggers.get(trigger).totalCount += count as number;
    }
  }

  // Filtra trigger comuni a più specie
  const crossSpeciesTriggers = [];
  for (const [trigger, stats] of commonTriggers.entries()) {
    if (stats.species.length >= 2 && stats.totalCount >= 10) {
      crossSpeciesTriggers.push({
        trigger,
        speciesCount: stats.species.length,
        totalOccurrences: stats.totalCount,
        speciesDistribution: stats.species
      });
    }
  }

  const confidence = crossSpeciesTriggers.length >= 3 ? 0.75 : 0.5;

  return {
    type: 'cross_species',
    confidence,
    species: speciesArray,
    sampleSize: data.length,
    description: `${crossSpeciesTriggers.length} trigger comuni identificati tra multiple specie`,
    impact: crossSpeciesTriggers.length >= 5 ? 'high' : 'medium',
    data: {
      cross_triggers: crossSpeciesTriggers,
      analysis_type: 'cross_species_trigger_analysis'
    },
    metadata: {
      analysis_date: new Date().toISOString(),
      method: 'cross_species_clustering',
      min_species_count: 2,
      min_occurrences: 10
    }
  };
}

async function createPatternNotifications(supabase: any, pattern: any, patternData: any) {
  // Trova utenti interessati alle specie coinvolte
  const { data: users, error } = await supabase
    .from('pets')
    .select('user_id, type')
    .in('type', patternData.species);

  if (error) {
    console.error('Error finding users for notifications:', error);
    return;
  }

  const uniqueUsers = [...new Set(users.map((u: any) => u.user_id))];

  // Crea notifiche per ogni utente
  for (const userId of uniqueUsers) {
    await supabase
      .from('ai_insights_notifications')
      .insert({
        user_id: userId,
        insight_type: 'pattern',
        related_id: pattern.id,
        priority: patternData.impact === 'critical' ? 'urgent' : 'high',
        title: 'Nuovo Pattern Comportamentale Scoperto',
        message: `La AI ha identificato un nuovo pattern: ${patternData.description}`,
        action_required: false,
        action_data: {
          pattern_type: patternData.type,
          confidence: patternData.confidence,
          species: patternData.species
        }
      });
  }
}

async function processTrendAnalysis(supabase: any, task: ProcessingTask) {
  console.log('Processing trend analysis...');
  // TODO: Implementare analisi trend
  return new Response(JSON.stringify({
    success: true,
    message: 'Trend analysis not yet implemented',
    processing_time: Date.now()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processAnomalyDetection(supabase: any, task: ProcessingTask) {
  console.log('Processing anomaly detection...');
  // TODO: Implementare detection anomalie
  return new Response(JSON.stringify({
    success: true,
    message: 'Anomaly detection not yet implemented',
    processing_time: Date.now()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processCrossSpeciesTransfer(supabase: any, task: ProcessingTask) {
  console.log('Processing cross-species knowledge transfer...');
  // TODO: Implementare knowledge transfer
  return new Response(JSON.stringify({
    success: true,
    message: 'Cross-species transfer not yet implemented',
    processing_time: Date.now()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Utility functions
function calculateStatisticalSignificance(data: any[]): number {
  if (data.length < 2) return 0.3;
  
  // Semplice calcolo basato su varianza e sample size
  const values = data.map(d => d.avgMood || d.frequency || 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalizza tra 0.3 e 0.95
  const significance = Math.min(0.95, Math.max(0.3, 0.5 + (1 / (1 + stdDev)) * 0.4));
  
  return Math.round(significance * 100) / 100;
}

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}