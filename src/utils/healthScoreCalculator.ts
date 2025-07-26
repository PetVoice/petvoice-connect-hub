import { supabase } from '@/integrations/supabase/client';

// Tipi per i dati di salute
export interface HealthData {
  healthMetrics: HealthMetric[];
  medicalRecords: MedicalRecord[];
  medications: Medication[];
  analyses: Analysis[];
  diaryEntries: DiaryEntry[];
  wellnessScores: WellnessScore[];
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
  medication_name: string;
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
    medicationEffect: number;
  };
  factors: {
    dataCompleteness: number;
    recentDataAvailability: number;
    trendAnalysis: string;
  };
  recommendations: string[];
}> => {
  const { healthMetrics, medicalRecords, medications, analyses, diaryEntries, wellnessScores } = healthData;
  
  let totalScore = 0;
  const maxScore = 100;
  
  // Componenti del punteggio (peso percentuale)
  const components = {
    vitalParameters: 0,    // 20%
    emotionalWellness: 0,  // 25%
    medicalCare: 0,        // 15%
    behavioralHealth: 0,   // 15%
    activity: 0,           // 10%
    medicationEffect: 0    // 15%
  };
  
  const recommendations: string[] = [];
  
  // 1. PARAMETRI VITALI (20 punti max)
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
  
  components.vitalParameters = Math.min(20, vitalScore);
  
  // 2. BENESSERE EMOTIVO (25 punti max)
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
    emotionalScore = (avgEmotionScore / 100) * 25; // Scala a 25 punti
    
    if (avgEmotionScore < 40) {
      recommendations.push("Stato emotivo preoccupante - considera interventi comportamentali");
    } else if (avgEmotionScore < 60) {
      recommendations.push("Monitora attentamente lo stato emotivo del pet");
    }
  }
  
  components.emotionalWellness = Math.min(25, Math.max(0, emotionalScore));
  
  // 3. CURE MEDICHE (15 punti max)
  let medicalScore = 0;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
  
  // Controlli veterinari recenti
  const recentCheckups = medicalRecords.filter(r => 
    r.record_type === 'checkup' && new Date(r.record_date) >= sixMonthsAgo
  );
  
  if (recentCheckups.length > 0) {
    medicalScore += 6;
  } else {
    const oldCheckups = medicalRecords.filter(r => 
      r.record_type === 'checkup' && new Date(r.record_date) >= oneYearAgo
    );
    if (oldCheckups.length > 0) {
      medicalScore += 3;
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
    medicalScore += 5;
  } else {
    recommendations.push("Verifica lo stato delle vaccinazioni");
  }
  
  // Basic medical care scoring (without detailed medication analysis here)
  const activeMedications = medications.filter(m => m.is_active);
  if (activeMedications.length > 0) {
    medicalScore += 4;
    
    // Controlla farmaci scaduti
    const expiredMeds = activeMedications.filter(m => 
      m.end_date && new Date(m.end_date) < now
    );
    if (expiredMeds.length > 0) {
      recommendations.push("Aggiorna lo stato dei farmaci scaduti");
    }
  }
  
  components.medicalCare = Math.min(15, medicalScore);
  
  // 6. EFFETTO FARMACI (15 punti max)
  let medicationEffectScore = 0;
  const now_timestamp = Date.now();
  const activeMedications_detailed = medications.filter(m => {
    if (!m.is_active) return false;
    const startDate = new Date(m.start_date).getTime();
    const endDate = m.end_date ? new Date(m.end_date).getTime() : now_timestamp + 365 * 24 * 60 * 60 * 1000;
    return startDate <= now_timestamp && endDate >= now_timestamp;
  });
  
  if (activeMedications_detailed.length === 0) {
    medicationEffectScore = 7.5; // Neutral score quando non ci sono farmaci
  } else {
    // Analisi dettagliata dell'effetto dei farmaci
    const medicationEffects = activeMedications_detailed.map(med => {
      const name = med.medication_name.toLowerCase();
      
      // Farmaci per dolore/infiammazione (effetto molto positivo)
      if (name.includes('antinfiammatorio') || name.includes('antidolorifico') || 
          name.includes('analgesico') || name.includes('carprofen') || 
          name.includes('rimadyl') || name.includes('metacam') || name.includes('meloxicam')) {
        return { score: 13, reason: 'Controllo del dolore migliora significativamente il benessere' };
      }
      
      // Farmaci per ansia/comportamento (effetto positivo su benessere emotivo)
      if (name.includes('ansiolitico') || name.includes('calmante') || 
          name.includes('sileo') || name.includes('zylkene') || name.includes('alprazolam')) {
        return { score: 14, reason: 'Riduzione ansia migliora qualità della vita' };
      }
      
      // Antibiotici (necessari ma neutrali a breve termine)
      if (name.includes('antibiotico') || name.includes('amoxicillina') || 
          name.includes('enrofloxacina') || name.includes('doxiciclina') || name.includes('cefalexina')) {
        return { score: 10, reason: 'Trattamento infezioni necessario' };
      }
      
      // Farmaci cardiaci (effetto positivo per problemi cardiaci)
      if (name.includes('cardiaco') || name.includes('enalapril') || 
          name.includes('pimobendan') || name.includes('vetmedin') || name.includes('furosemide')) {
        return { score: 12, reason: 'Supporto cardiovascolare migliora funzione cardiaca' };
      }
      
      // Chemioterapici/cortisonici (effetti collaterali negativi)
      if (name.includes('chemioterapia') || name.includes('cortisone') || 
          name.includes('prednisone') || name.includes('prednisolone') || name.includes('desametasone')) {
        return { score: 4, reason: 'Effetti collaterali temporanei ma trattamento necessario' };
      }
      
      // Integratori (leggero effetto positivo)
      if (name.includes('integratore') || name.includes('vitamina') || 
          name.includes('omega') || name.includes('glucosamina') || name.includes('condroitina')) {
        return { score: 9, reason: 'Supporto nutrizionale benefico' };
      }
      
      // Antiparassitari (preventivi, effetto neutro-positivo)
      if (name.includes('antiparassitario') || name.includes('frontline') || 
          name.includes('advantix') || name.includes('bravecto') || name.includes('scalibor')) {
        return { score: 8, reason: 'Prevenzione parassiti importante per salute' };
      }
      
      // Default per farmaci non riconosciuti
      return { score: 7.5, reason: 'Effetto farmaco non specificato' };
    });
    
    // Calcola score medio con possibile bonus per combinazioni terapeutiche appropriate
    const avgMedicationScore = medicationEffects.reduce((sum, effect) => sum + effect.score, 0) / medicationEffects.length;
    
    // Bonus per combinazioni terapeutiche ben bilanciate
    const hasMultipleCategories = medicationEffects.some(e => e.score >= 12) && medicationEffects.some(e => e.score <= 10);
    const balanceBonus = hasMultipleCategories ? 1 : 0;
    
    medicationEffectScore = Math.min(15, avgMedicationScore + balanceBonus);
    
    // Aggiungi raccomandazioni specifiche
    if (avgMedicationScore < 6) {
      recommendations.push("I farmaci attuali potrebbero causare effetti collaterali - discuti con il veterinario");
    } else if (avgMedicationScore > 12) {
      recommendations.push("Terapia farmacologica ben bilanciata - continua monitoraggio");
    }
  }
  
  components.medicationEffect = medicationEffectScore;
  
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
               components.medicalCare + components.behavioralHealth + components.activity + components.medicationEffect;
  
  // Fattori di qualità dei dati
  const dataCompleteness = Math.min(100, (
    (recentVitals.length > 0 ? 20 : 0) +
    (recentAnalyses.length > 0 ? 25 : 0) +
    (medicalRecords.length > 0 ? 15 : 0) +
    (recentDiary.length > 0 ? 15 : 0) +
    (activityEntries.length > 0 ? 10 : 0) +
    (activeMedications_detailed.length > 0 ? 15 : 0)
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
  
  return {
    overallScore: Math.round(totalScore),
    components,
    factors: {
      dataCompleteness,
      recentDataAvailability,
      trendAnalysis
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
      { data: wellnessScores }
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
        .from('pet_medications')
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
        .limit(20)
    ]);
    
    return {
      healthMetrics: healthMetrics || [],
      medicalRecords: medicalRecords || [],
      medications: medications || [],
      analyses: analyses || [],
      diaryEntries: diaryEntries || [],
      wellnessScores: wellnessScores || []
    };
  } catch (error) {
    console.error('Error fetching health data:', error);
    return {
      healthMetrics: [],
      medicalRecords: [],
      medications: [],
      analyses: [],
      diaryEntries: [],
      wellnessScores: []
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