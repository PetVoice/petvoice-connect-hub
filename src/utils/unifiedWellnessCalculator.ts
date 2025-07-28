import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Interfacce unificate per tutti i dati
export interface UnifiedHealthData {
  healthMetrics: HealthMetric[];
  medicalRecords: MedicalRecord[];
  medications: Medication[];
  analyses: Analysis[];
  diaryEntries: DiaryEntry[];
  veterinaryVisits: VeterinaryVisit[];
  insurancePolicies: InsurancePolicy[];
}

export interface HealthMetric {
  id: string;
  metric_type: string;
  value: number;
  unit?: string;
  recorded_at: string;
  notes?: string;
  created_at: string;
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
  created_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
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

export interface InsurancePolicy {
  id: string;
  provider_name: string;
  policy_number: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  coverage_limit?: number;
  created_at: string;
}

export interface WellnessScore {
  score: number;
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
  timestamp: string;
}

// Configurazioni e punteggi
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
  'felice': 90, 'calmo': 85, 'giocoso': 88, 'rilassato': 82, 'affettuoso': 80,
  'curioso': 75, 'eccitato': 70, 'neutro': 50, 'ansioso': 35, 'agitato': 30,
  'triste': 25, 'spaventato': 20, 'aggressivo': 15,
  // English variants
  'happy': 90, 'calm': 85, 'playful': 88, 'relaxed': 82, 'excited': 70,
  'anxious': 35, 'sad': 25, 'aggressive': 15
};

/**
 * Calcola il punteggio di benessere unificato per un periodo specifico
 */
export const calculateUnifiedWellnessScore = (
  data: UnifiedHealthData,
  periodStart: Date,
  periodEnd: Date,
  petType?: string
): WellnessScore => {
  // Filtra dati per il periodo
  const periodData = {
    healthMetrics: data.healthMetrics.filter(m => {
      const date = new Date(m.recorded_at);
      return date >= periodStart && date <= periodEnd;
    }),
    medicalRecords: data.medicalRecords.filter(m => {
      const date = new Date(m.record_date);
      return date >= periodStart && date <= periodEnd;
    }),
    medications: data.medications.filter(m => {
      const startDate = new Date(m.start_date);
      const endDate = m.end_date ? new Date(m.end_date) : new Date();
      return startDate <= periodEnd && endDate >= periodStart;
    }),
    analyses: data.analyses.filter(a => {
      const date = new Date(a.created_at);
      return date >= periodStart && date <= periodEnd;
    }),
    diaryEntries: data.diaryEntries.filter(d => {
      const date = new Date(d.entry_date);
      return date >= periodStart && date <= periodEnd;
    }),
    veterinaryVisits: data.veterinaryVisits.filter(v => {
      const date = new Date(v.start_time);
      return date >= periodStart && date <= periodEnd && v.status === 'completed';
    }),
    insurancePolicies: data.insurancePolicies.filter(i => {
      const startDate = new Date(i.start_date);
      const endDate = i.end_date ? new Date(i.end_date) : new Date();
      return i.is_active && startDate <= periodEnd && endDate >= periodStart;
    })
  };

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
  if (periodData.healthMetrics.length === 0) {
    recommendations.push("Aggiungi parametri vitali recenti");
  } else {
    const tempMetrics = periodData.healthMetrics.filter(m => m.metric_type === 'temperature');
    const heartMetrics = periodData.healthMetrics.filter(m => m.metric_type === 'heart_rate');
    const respirationMetrics = periodData.healthMetrics.filter(m => m.metric_type === 'respiration');

    if (tempMetrics.length > 0) {
      const avgTemp = tempMetrics.reduce((sum, m) => sum + m.value, 0) / tempMetrics.length;
      if (avgTemp >= 38 && avgTemp <= 39.2) {
        vitalScore += 8;
      } else if (avgTemp >= 37.5 && avgTemp <= 40) {
        vitalScore += 4;
        recommendations.push("Temperatura fuori norma - monitora attentamente");
      } else {
        recommendations.push("Temperatura critica - consulta urgentemente il veterinario");
      }
    }

    if (heartMetrics.length > 0) {
      const avgHeart = heartMetrics.reduce((sum, m) => sum + m.value, 0) / heartMetrics.length;
      const range = petType?.toLowerCase().includes('gatto') ? { min: 120, max: 200 } : { min: 60, max: 120 };
      if (avgHeart >= range.min && avgHeart <= range.max) {
        vitalScore += 8;
      } else if (avgHeart >= 40 && avgHeart <= 250) {
        vitalScore += 4;
        recommendations.push("Frequenza cardiaca da monitorare");
      } else {
        recommendations.push("Frequenza cardiaca anomala - consulta il veterinario");
      }
    }

    if (respirationMetrics.length > 0) {
      const avgResp = respirationMetrics.reduce((sum, m) => sum + m.value, 0) / respirationMetrics.length;
      if (avgResp >= 15 && avgResp <= 30) {
        vitalScore += 9;
      } else if (avgResp >= 10 && avgResp <= 40) {
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
  if (periodData.analyses.length === 0) {
    recommendations.push("Effettua analisi comportamentali per monitorare lo stato emotivo");
  } else {
    const emotionScoreSum = periodData.analyses.reduce((sum, analysis) => {
      const emotionScore = EMOTION_SCORES[analysis.primary_emotion] || 50;
      const confidenceBonus = (analysis.primary_confidence - 0.5) * 20;
      return sum + emotionScore + confidenceBonus;
    }, 0);
    
    const avgEmotionScore = emotionScoreSum / periodData.analyses.length;
    emotionalScore = (avgEmotionScore / 100) * 30;
    
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

  // Controlli veterinari da record medici
  const recentCheckups = data.medicalRecords.filter(r => 
    r.record_type === 'checkup' && new Date(r.record_date) >= sixMonthsAgo
  );

  // Visite veterinarie dal calendario
  const recentVetVisits = data.veterinaryVisits.filter(v => 
    ['veterinary', 'checkup', 'vaccination', 'treatment'].includes(v.category) && 
    v.status === 'completed' &&
    new Date(v.start_time) >= sixMonthsAgo
  );

  const totalRecentVisits = recentCheckups.length + recentVetVisits.length;
  
  if (totalRecentVisits > 0) {
    medicalScore += 8;
    if (totalRecentVisits >= 2) medicalScore += 2;
  } else {
    const oldVisits = data.medicalRecords.filter(r => 
      r.record_type === 'checkup' && new Date(r.record_date) >= oneYearAgo
    ).length + data.veterinaryVisits.filter(v => 
      ['veterinary', 'checkup'].includes(v.category) && 
      v.status === 'completed' &&
      new Date(v.start_time) >= oneYearAgo && 
      new Date(v.start_time) < sixMonthsAgo
    ).length;
    
    if (oldVisits > 0) {
      medicalScore += 4;
      recommendations.push("Programma un controllo veterinario - ultimo controllo oltre 6 mesi fa");
    } else {
      recommendations.push("Prenota urgentemente un controllo veterinario");
    }
  }

  // Vaccinazioni
  const recentVaccinations = data.medicalRecords.filter(r => 
    r.record_type === 'vaccination' && new Date(r.record_date) >= oneYearAgo
  ).length + data.veterinaryVisits.filter(v => 
    v.category === 'vaccination' && v.status === 'completed' &&
    new Date(v.start_time) >= oneYearAgo
  ).length;

  if (recentVaccinations > 0) {
    medicalScore += 6;
  } else {
    recommendations.push("Verifica lo stato delle vaccinazioni");
  }

  // Farmaci attivi
  const activeMedications = periodData.medications.filter(m => m.is_active);
  if (activeMedications.length > 0) {
    medicalScore += 4;
    
    const expiredMeds = activeMedications.filter(m => 
      m.end_date && new Date(m.end_date) < now
    );
    if (expiredMeds.length > 0) {
      recommendations.push("Aggiorna lo stato dei farmaci scaduti");
    }
  }

  // Assicurazione attiva
  if (periodData.insurancePolicies.length > 0) {
    medicalScore += 2; // Bonus per copertura assicurativa
  }

  components.medicalCare = Math.min(20, medicalScore);

  // 4. SALUTE COMPORTAMENTALE (15 punti max)
  let behavioralScore = 0;
  if (periodData.diaryEntries.length === 0) {
    recommendations.push("Mantieni un diario regolare per monitorare comportamento e umore");
  } else {
    const moodEntries = periodData.diaryEntries.filter(d => d.mood_score !== null);
    if (moodEntries.length > 0) {
      const avgMood = moodEntries.reduce((sum, d) => sum + (d.mood_score || 0), 0) / moodEntries.length;
      behavioralScore += (avgMood / 10) * 10;
      
      if (avgMood < 4) {
        recommendations.push("Umore persistentemente basso - considera consulto comportamentale");
      }
    }
    
    if (periodData.diaryEntries.length >= 7) {
      behavioralScore += 5;
    } else if (periodData.diaryEntries.length >= 3) {
      behavioralScore += 3;
    }
  }
  components.behavioralHealth = Math.min(15, behavioralScore);

  // 5. ATTIVITÀ E MOVIMENTO (10 punti max)
  let activityScore = 0;
  const activityEntries = periodData.diaryEntries.filter(d => 
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
  const totalScore = components.vitalParameters + components.emotionalWellness + 
                    components.medicalCare + components.behavioralHealth + components.activity;

  // Fattori di qualità
  const dataCompleteness = Math.min(100, (
    (periodData.healthMetrics.length > 0 ? 25 : 0) +
    (periodData.analyses.length > 0 ? 30 : 0) +
    (data.medicalRecords.length > 0 ? 20 : 0) +
    (periodData.diaryEntries.length > 0 ? 15 : 0) +
    (activityEntries.length > 0 ? 10 : 0)
  ));

  const recentDataAvailability = Math.min(100, (
    (periodData.healthMetrics.length > 0 ? 33 : 0) +
    (periodData.analyses.length > 0 ? 33 : 0) +
    (periodData.diaryEntries.length > 0 ? 34 : 0)
  ));

  // Analisi trend
  let trendAnalysis = "Dati insufficienti";
  if (data.analyses.length >= 5) {
    const recent = data.analyses.slice(0, 5);
    const older = data.analyses.slice(5, 10);
    
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

  // Frequenza visite
  let visitFrequency = "Mai registrate";
  const completedVisits = data.veterinaryVisits.filter(v => v.status === 'completed');
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
    score: Math.round(totalScore),
    components,
    factors: {
      dataCompleteness,
      recentDataAvailability,
      trendAnalysis,
      visitFrequency
    },
    recommendations,
    timestamp: new Date().toISOString()
  };
};

/**
 * Recupera tutti i dati necessari per il calcolo unificato
 */
export const fetchUnifiedHealthData = async (petId: string, userId: string): Promise<UnifiedHealthData> => {
  try {
    const [
      { data: healthMetrics },
      { data: medicalRecords },
      { data: medications },
      { data: analyses },
      { data: diaryEntries },
      { data: veterinaryVisits },
      { data: insurancePolicies }
    ] = await Promise.all([
      supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false }),
      
      supabase
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('record_date', { ascending: false }),
        
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
        .order('created_at', { ascending: false }),
        
      supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('entry_date', { ascending: false }),
        
      supabase
        .from('calendar_events')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .in('category', ['veterinary', 'checkup', 'vaccination', 'treatment'])
        .order('start_time', { ascending: false }),

      supabase
        .from('insurance_policies')
        .select('*')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
    ]);
    
    return {
      healthMetrics: healthMetrics || [],
      medicalRecords: medicalRecords || [],
      medications: medications || [],
      analyses: analyses || [],
      diaryEntries: diaryEntries || [],
      veterinaryVisits: veterinaryVisits || [],
      insurancePolicies: insurancePolicies || []
    };
  } catch (error) {
    console.error('Error fetching unified health data:', error);
    return {
      healthMetrics: [],
      medicalRecords: [],
      medications: [],
      analyses: [],
      diaryEntries: [],
      veterinaryVisits: [],
      insurancePolicies: []
    };
  }
};

/**
 * Genera i dati per il trend chart usando periodi specifici
 */
export const generateTrendData = (data: UnifiedHealthData, period: string, petType?: string) => {
  const now = new Date();
  let periods = [];

  switch (period) {
    case 'oggi':
      periods = Array.from({ length: 24 }, (_, i) => ({
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), i + 1),
        label: `${i}:00`
      }));
      break;
    case 'settimana':
      periods = Array.from({ length: 7 }, (_, i) => {
        const dayDate = subDays(now, 6 - i);
        return {
          start: startOfDay(dayDate),
          end: endOfDay(dayDate),
          label: dayDate.toLocaleDateString('it-IT', { weekday: 'short' })
        };
      });
      break;
    case 'anno':
      periods = Array.from({ length: 12 }, (_, i) => {
        const monthDate = subMonths(now, 11 - i);
        return {
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate),
          label: monthDate.toLocaleDateString('it-IT', { month: 'short' })
        };
      });
      break;
    case 'tutto':
      periods = Array.from({ length: 12 }, (_, i) => {
        const monthDate = subMonths(now, 11 - i);
        return {
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate),
          label: monthDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })
        };
      });
      break;
    default: // 'mese'
      periods = Array.from({ length: 6 }, (_, i) => {
        const monthDate = subMonths(now, 5 - i);
        return {
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate),
          label: monthDate.toLocaleDateString('it-IT', { month: 'short' })
        };
      });
  }

  return periods.map(period => {
    const wellnessData = calculateUnifiedWellnessScore(data, period.start, period.end, petType);
    return {
      date: period.label,
      wellness: wellnessData.score
    };
  });
};