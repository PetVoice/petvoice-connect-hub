import { supabase } from '@/integrations/supabase/client';

// Tipi per i dati di salute
export interface HealthData {
  healthMetrics: HealthMetric[];
  medicalRecords: MedicalRecord[];
  medications: Medication[];
  analyses: Analysis[];
  diaryEntries: DiaryEntry[];
  wellnessScores: WellnessScore[];
  veterinaryVisits: VeterinaryVisit[];
}

export interface VeterinaryVisit {
  id: string;
  category: string;
  status: string;
  start_time: string;
  end_time?: string;
  location?: string;
  notes?: string;
  cost?: number;
  created_at: string;
}

export interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit?: string;
  recorded_at: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  record_type: string;
  record_date: string;
  title: string;
  description?: string;
  cost?: number;
  veterinarian?: {
    name: string;
    clinic_name?: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export interface Analysis {
  id: string;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions?: any;
  behavioral_insights?: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  entry_date: string;
  mood_score?: number;
  behavioral_tags?: string[];
  temperature?: number;
  content?: string;
  created_at: string;
}

export interface WellnessScore {
  id: string;
  wellness_score: number;
  factors?: any;
  score_date: string;
  created_at: string;
}

// Configurazioni per valutazioni di salute
const VITAL_PARAMETERS_RANGES = {
  temperature: {
    dogs: { min: 38.0, max: 39.2, unit: '°C' },
    cats: { min: 38.1, max: 39.2, unit: '°C' },
    critical_low: 37.5,
    critical_high: 40.0
  },
  heart_rate: {
    dogs: { min: 60, max: 120, unit: 'bpm' },
    cats: { min: 120, max: 200, unit: 'bpm' },
    critical_low: 40,
    critical_high: 250
  },
  respiration: {
    dogs: { min: 15, max: 30, unit: 'rpm' },
    cats: { min: 20, max: 30, unit: 'rpm' },
    critical_low: 10,
    critical_high: 40
  }
};

const EMOTION_SCORES: Record<string, number> = {
  'felice': 90,
  'calmo': 85,
  'giocoso': 88,
  'rilassato': 82,
  'affettuoso': 80,
  'curioso': 75,
  'eccitato': 70,
  'neutro': 50,
  'ansioso': 35,
  'agitato': 30,
  'triste': 25,
  'spaventato': 20,
  'aggressivo': 15,
  // English variants
  'happy': 90,
  'calm': 85,
  'playful': 88,
  'relaxed': 82,
  'excited': 70,
  'anxious': 35,
  'sad': 25,
  'aggressive': 15
};

/**
 * Calcola il punteggio di salute unificato basato su tutti i fattori disponibili
 */
export const calculateUnifiedHealthScore = async (
  petId: string, 
  userId: string, 
  healthData: HealthData
): Promise<{
  overallScore: number;
  components: {
    vitalParameters: number;
    emotionalWellness: number;
    medicalCare: number;
    behavioralHealth: number;
    activity: number;
  };
  factors: {
    dataCompleteness: number;
    recentDataAvailability: number;
    trendAnalysis: string;
    visitFrequency: string;
  };
  recommendations: string[];
}> => {
  const { healthMetrics, medicalRecords, medications, analyses, diaryEntries, wellnessScores, veterinaryVisits } = healthData;
  
  let totalScore = 0;
  const maxScore = 100;
  
  // Componenti del punteggio (peso percentuale)
  const components = {
    vitalParameters: 0,    // 25%
    emotionalWellness: 0,  // 30%
    medicalCare: 0,        // 20%
    behavioralHealth: 0,   // 15%
    activity: 0            // 10%
  };
  
  const recommendations: string[] = [];
  
  // 1. PARAMETRI VITALI (25 punti max)
  let vitalScore = 0;
  const recentVitals = healthMetrics.filter(m => 
    new Date(m.recorded_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  
  if (recentVitals.length === 0) {
    recommendations.push("Aggiungi parametri vitali recenti (temperatura, battito cardiaco, respirazione)");
  } else {
    // Temperatura
    const tempMetrics = recentVitals.filter(m => m.metric_type === 'temperature');
    if (tempMetrics.length > 0) {
      const lastTemp = tempMetrics[0].value;
      if (lastTemp >= 38 && lastTemp <= 39.2) {
        vitalScore += 8;
      } else if (lastTemp >= 37.5 && lastTemp <= 40) {
        vitalScore += 4;
        recommendations.push("Temperatura fuori norma - monitora attentamente");
      } else {
        recommendations.push("Temperatura critica - consulta urgentemente il veterinario");
      }
    }
    
    // Battito cardiaco
    const heartMetrics = recentVitals.filter(m => m.metric_type === 'heart_rate');
    if (heartMetrics.length > 0) {
      const lastHeart = heartMetrics[0].value;
      if (lastHeart >= 60 && lastHeart <= 120) {
        vitalScore += 8;
      } else if (lastHeart >= 40 && lastHeart <= 150) {
        vitalScore += 4;
        recommendations.push("Frequenza cardiaca da monitorare");
      } else {
        recommendations.push("Frequenza cardiaca anomala - consulta il veterinario");
      }
    }
    
    // Respirazione
    const respirationMetrics = recentVitals.filter(m => m.metric_type === 'respiration');
    if (respirationMetrics.length > 0) {
      const lastRespiration = respirationMetrics[0].value;
      if (lastRespiration >= 15 && lastRespiration <= 30) {
        vitalScore += 9;
      } else if (lastRespiration >= 10 && lastRespiration <= 40) {
        vitalScore += 5;
        recommendations.push("Respirazione irregolare - osserva comportamento");
      } else {
        recommendations.push("Difficoltà respiratorie - consulta urgentemente il veterinario");
      }
    }
  }
  
  components.vitalParameters = Math.min(25, vitalScore);
  
  // 2. BENESSERE EMOTIVO (30 punti max)
  let emotionalScore = 0;
  const recentAnalyses = analyses.filter(a => 
    new Date(a.created_at) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  );
  
  if (recentAnalyses.length === 0) {
    recommendations.push("Effettua analisi comportamentali per monitorare lo stato emotivo");
  } else {
    const emotionScoreSum = recentAnalyses.reduce((sum, analysis) => {
      const emotionScore = EMOTION_SCORES[analysis.primary_emotion] || 50;
      const confidenceBonus = (analysis.primary_confidence - 0.5) * 20; // Bonus/malus per confidenza
      return sum + emotionScore + confidenceBonus;
    }, 0);
    
    const avgEmotionScore = emotionScoreSum / recentAnalyses.length;
    emotionalScore = (avgEmotionScore / 100) * 30; // Scala a 30 punti
    
    if (avgEmotionScore < 40) {
      recommendations.push("Stato emotivo preoccupante - considera interventi comportamentali");
    } else if (avgEmotionScore < 60) {
      recommendations.push("Monitora attentamente lo stato emotivo del pet");
    }
  }
  
  components.emotionalWellness = Math.min(30, Math.max(0, emotionalScore));
  
  // 3. CURE MEDICHE (20 punti max)
  let medicalScore = 0;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
  
  // Controlli veterinari recenti da medical_records
  const recentCheckups = medicalRecords.filter(r => 
    r.record_type === 'checkup' && new Date(r.record_date) >= sixMonthsAgo
  );
  
  // Visite veterinarie recenti dal calendario
  const recentVetVisits = healthData.veterinaryVisits.filter(v => 
    (v.category === 'veterinary' || v.category === 'checkup') && 
    v.status === 'completed' &&
    new Date(v.start_time) >= sixMonthsAgo
  );
  
  // Combina visite da entrambe le fonti
  const totalRecentVisits = recentCheckups.length + recentVetVisits.length;
  
  if (totalRecentVisits > 0) {
    medicalScore += 8;
    // Bonus per visite multiple (cura costante)
    if (totalRecentVisits >= 2) {
      medicalScore += 2;
    }
  } else {
    const oldCheckups = medicalRecords.filter(r => 
      r.record_type === 'checkup' && new Date(r.record_date) >= oneYearAgo
    );
    const oldVetVisits = healthData.veterinaryVisits.filter(v => 
      (v.category === 'veterinary' || v.category === 'checkup') && 
      v.status === 'completed' &&
      new Date(v.start_time) >= oneYearAgo && 
      new Date(v.start_time) < sixMonthsAgo
    );
    
    if (oldCheckups.length > 0 || oldVetVisits.length > 0) {
      medicalScore += 4;
      recommendations.push("Programma un controllo veterinario - ultimo controllo oltre 6 mesi fa");
    } else {
      recommendations.push("Prenota urgentemente un controllo veterinario");
    }
  }
  
  // Vaccinazioni
  const recentVaccinations = medicalRecords.filter(r => 
    r.record_type === 'vaccination' && new Date(r.record_date) >= oneYearAgo
  );
  
  if (recentVaccinations.length > 0) {
    medicalScore += 6;
  } else {
    recommendations.push("Verifica lo stato delle vaccinazioni");
  }
  
  // Farmaci attivi
  const activeMedications = medications.filter(m => m.is_active);
  if (activeMedications.length > 0) {
    medicalScore += 6;
    
    // Controlla farmaci scaduti
    const expiredMeds = activeMedications.filter(m => 
      m.end_date && new Date(m.end_date) < now
    );
    if (expiredMeds.length > 0) {
      recommendations.push("Aggiorna lo stato dei farmaci scaduti");
    }
  }
  
  components.medicalCare = Math.min(20, medicalScore);
  
  // 4. SALUTE COMPORTAMENTALE (15 punti max)
  let behavioralScore = 0;
  const recentDiary = diaryEntries.filter(d => 
    new Date(d.entry_date) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  );
  
  if (recentDiary.length === 0) {
    recommendations.push("Mantieni un diario regolare per monitorare comportamento e umore");
  } else {
    // Mood score medio
    const moodEntries = recentDiary.filter(d => d.mood_score !== null);
    if (moodEntries.length > 0) {
      const avgMood = moodEntries.reduce((sum, d) => sum + (d.mood_score || 0), 0) / moodEntries.length;
      behavioralScore += (avgMood / 10) * 10; // Scala a 10 punti
      
      if (avgMood < 4) {
        recommendations.push("Umore persistentemente basso - considera consulto comportamentale");
      }
    }
    
    // Frequenza aggiornamenti
    if (recentDiary.length >= 7) {
      behavioralScore += 5; // Bonus per regolarità
    } else if (recentDiary.length >= 3) {
      behavioralScore += 3;
    }
  }
  
  components.behavioralHealth = Math.min(15, behavioralScore);
  
  // 5. ATTIVITÀ E MOVIMENTO (10 punti max)
  let activityScore = 0;
  const activityEntries = diaryEntries.filter(d => 
    d.behavioral_tags && d.behavioral_tags.some(tag => 
      ['attivo', 'giocoso', 'energico', 'passeggiata', 'gioco'].includes(tag.toLowerCase())
    )
  );
  
  if (activityEntries.length >= 5) {
    activityScore = 10;
  } else if (activityEntries.length >= 3) {
    activityScore = 7;
  } else if (activityEntries.length >= 1) {
    activityScore = 4;
    recommendations.push("Incrementa l'attività fisica del tuo pet");
  } else {
    recommendations.push("Registra le attività fisiche del tuo pet nel diario");
  }
  
  components.activity = activityScore;
  
  // Calcolo punteggio finale
  totalScore = components.vitalParameters + components.emotionalWellness + 
               components.medicalCare + components.behavioralHealth + components.activity;
  
  // Fattori di qualità dei dati
  const dataCompleteness = Math.min(100, (
    (recentVitals.length > 0 ? 25 : 0) +
    (recentAnalyses.length > 0 ? 30 : 0) +
    (medicalRecords.length > 0 ? 20 : 0) +
    (recentDiary.length > 0 ? 15 : 0) +
    (activityEntries.length > 0 ? 10 : 0)
  ));
  
  const recentDataAvailability = Math.min(100, (
    (recentVitals.length > 0 ? 33 : 0) +
    (recentAnalyses.length > 0 ? 33 : 0) +
    (recentDiary.length > 0 ? 34 : 0)
  ));
  
  // Analisi trend
  let trendAnalysis = "Dati insufficienti";
  if (analyses.length >= 5) {
    const recent = analyses.slice(0, 5);
    const older = analyses.slice(5, 10);
    
    if (older.length > 0) {
      const recentAvg = recent.reduce((sum, a) => sum + (EMOTION_SCORES[a.primary_emotion] || 50), 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + (EMOTION_SCORES[a.primary_emotion] || 50), 0) / older.length;
      const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      if (improvement > 10) {
        trendAnalysis = "Miglioramento significativo";
      } else if (improvement > 5) {
        trendAnalysis = "Lieve miglioramento";
      } else if (improvement > -5) {
        trendAnalysis = "Stabile";
      } else if (improvement > -10) {
        trendAnalysis = "Lieve peggioramento";
      } else {
        trendAnalysis = "Peggioramento significativo";
      }
    }
  }
  
  // Analisi frequenza visite veterinarie
  let visitFrequency = "Mai registrate";
  const completedVisits = healthData.veterinaryVisits.filter(v => v.status === 'completed');
  const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
  
  if (completedVisits.length > 0) {
    const recentVisitsCount = completedVisits.filter(v => 
      new Date(v.start_time) >= threeMonthsAgo
    ).length;
    const sixMonthVisitsCount = completedVisits.filter(v => 
      new Date(v.start_time) >= sixMonthsAgo
    ).length;
    
    if (recentVisitsCount >= 2) {
      visitFrequency = "Molto regolare";
    } else if (recentVisitsCount >= 1) {
      visitFrequency = "Regolare";
    } else if (sixMonthVisitsCount >= 1) {
      visitFrequency = "Poco frequente";
    } else {
      visitFrequency = "Assente";
    }
  }
  
  return {
    overallScore: Math.round(totalScore),
    components,
    factors: {
      dataCompleteness,
      recentDataAvailability,
      trendAnalysis,
      visitFrequency
    },
    recommendations
  };
};

/**
 * Recupera tutti i dati necessari per il calcolo del punteggio di salute
 */
export const fetchHealthData = async (petId: string, userId: string): Promise<HealthData> => {
  try {
    // Fetch tutti i dati in parallelo
    const [
      { data: healthMetrics },
      { data: medicalRecords },
      { data: medications },
      { data: analyses },
      { data: diaryEntries },
      { data: wellnessScores },
      { data: veterinaryVisits }
    ] = await Promise.all([
      supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(50),
      
      supabase
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('record_date', { ascending: false })
        .limit(20),
        
      supabase
        .from('medications')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('start_date', { ascending: false }),
        
      supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
        
      supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(30),
        
      supabase
        .from('pet_wellness_scores')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('score_date', { ascending: false })
        .limit(20),
        
      supabase
        .from('calendar_events')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .in('category', ['veterinary', 'checkup', 'vaccination', 'treatment'])
        .order('start_time', { ascending: false })
        .limit(50)
    ]);
    
    return {
      healthMetrics: healthMetrics || [],
      medicalRecords: medicalRecords || [],
      medications: medications || [],
      analyses: analyses || [],
      diaryEntries: diaryEntries || [],
      wellnessScores: wellnessScores || [],
      veterinaryVisits: veterinaryVisits || []
    };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return {
      healthMetrics: [],
      medicalRecords: [],
      medications: [],
      analyses: [],
      diaryEntries: [],
      wellnessScores: [],
      veterinaryVisits: []
    };
  }
};

/**
 * Salva il punteggio calcolato nel database
 */
export const saveHealthScore = async (
  petId: string, 
  userId: string, 
  scoreData: {
    overallScore: number;
    components: any;
    factors: any;
    recommendations: string[];
  }
): Promise<void> => {
  try {
    await supabase
      .from('pet_wellness_scores')
      .insert({
        pet_id: petId,
        user_id: userId,
        wellness_score: scoreData.overallScore,
        factors: {
          components: scoreData.components,
          factors: scoreData.factors,
          recommendations: scoreData.recommendations,
          calculation_date: new Date().toISOString()
        },
        score_date: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving health score:', error);
  }
};