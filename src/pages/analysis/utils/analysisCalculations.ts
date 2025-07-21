import { AnalysisData } from '../hooks/useAnalysisData';

interface PredictionsData {
  analyses: AnalysisData[];
  diaryData: any[];
  healthData: any[];
  wellnessData: any[];
}

interface TrendComponent {
  source: string;
  trend: number;
  weight: number;
}

interface PredictionResult {
  trend: string;
  confidence: number;
  components: TrendComponent[];
  prediction: any;
  emotionDistribution: Record<string, number>;
  confidenceTrend: number;
  riskFactors: string[];
  recommendations: string[];
}

export const calculatePredictions = (data: PredictionsData): PredictionResult => {
  const { analyses, diaryData, healthData, wellnessData } = data;
  
  if (analyses.length === 0) {
    return {
      trend: 'insufficient_data',
      confidence: 0,
      components: [],
      prediction: null,
      emotionDistribution: {},
      confidenceTrend: 0,
      riskFactors: [],
      recommendations: ['Effettua più analisi per ottenere previsioni accurate']
    };
  }

  const trendComponents: TrendComponent[] = [];
  let overallTrend = 0;

  // Calcoli trend emotivo
  if (analyses.length >= 3) {
    const emotionTrend = calculateEmotionTrend(analyses);
    overallTrend += emotionTrend * 0.4;
    trendComponents.push({ 
      source: 'Analisi Emotive', 
      trend: emotionTrend, 
      weight: 0.4 
    });
  }

  // Calcoli mood dal diario
  if (diaryData.length >= 3) {
    const moodTrend = calculateMoodTrend(diaryData);
    overallTrend += moodTrend * 0.3;
    trendComponents.push({ 
      source: 'Mood Diario', 
      trend: moodTrend, 
      weight: 0.3 
    });
  }

  // Calcoli salute
  if (healthData.length >= 2) {
    const healthTrend = calculateHealthTrend(healthData);
    overallTrend += healthTrend * 0.2;
    trendComponents.push({ 
      source: 'Dati Salute', 
      trend: healthTrend, 
      weight: 0.2 
    });
  }

  // Calcoli wellness
  if (wellnessData.length >= 2) {
    const wellnessTrend = calculateWellnessTrend(wellnessData);
    overallTrend += wellnessTrend * 0.1;
    trendComponents.push({ 
      source: 'Punteggi Wellness', 
      trend: wellnessTrend, 
      weight: 0.1 
    });
  }

  const emotionDistribution = calculateEmotionDistribution(analyses);
  const confidenceTrend = calculateConfidenceTrend(analyses);
  const riskFactors = identifyRiskFactors(analyses, diaryData);
  const recommendations = generateRecommendations(overallTrend, analyses, riskFactors);

  return {
    trend: classifyTrend(overallTrend),
    confidence: calculateConfidence(analyses.length, trendComponents.length),
    components: trendComponents,
    prediction: predictFutureWellness(overallTrend, analyses),
    emotionDistribution,
    confidenceTrend,
    riskFactors,
    recommendations
  };
};

const calculateEmotionTrend = (analyses: AnalysisData[]): number => {
  const sortedAnalyses = [...analyses].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const thirdSize = Math.floor(sortedAnalyses.length / 3);
  if (thirdSize === 0) return 0;
  
  const oldAnalyses = sortedAnalyses.slice(0, thirdSize);
  const recentAnalyses = sortedAnalyses.slice(sortedAnalyses.length - thirdSize);

  const oldAvg = oldAnalyses.reduce((sum, a) => sum + a.primary_confidence, 0) / oldAnalyses.length;
  const recentAvg = recentAnalyses.reduce((sum, a) => sum + a.primary_confidence, 0) / recentAnalyses.length;
  
  return recentAvg - oldAvg;
};

const calculateMoodTrend = (diaryData: any[]): number => {
  const sortedDiary = [...diaryData]
    .filter(entry => entry.mood_score !== null && entry.mood_score !== undefined)
    .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
  
  if (sortedDiary.length < 3) return 0;
  
  const thirdSize = Math.floor(sortedDiary.length / 3);
  const oldEntries = sortedDiary.slice(0, thirdSize);
  const recentEntries = sortedDiary.slice(sortedDiary.length - thirdSize);

  const oldAvg = oldEntries.reduce((sum, e) => sum + e.mood_score, 0) / oldEntries.length;
  const recentAvg = recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length;
  
  return (recentAvg - oldAvg) * 10; // Scale to match confidence range
};

const calculateHealthTrend = (healthData: any[]): number => {
  // Simplified health trend calculation
  if (healthData.length < 2) return 0;
  
  const recentHealth = healthData.slice(0, Math.ceil(healthData.length / 2));
  const olderHealth = healthData.slice(Math.ceil(healthData.length / 2));
  
  // Assume positive values are better
  const recentAvg = recentHealth.reduce((sum, h) => sum + (h.value || 0), 0) / recentHealth.length;
  const olderAvg = olderHealth.reduce((sum, h) => sum + (h.value || 0), 0) / olderHealth.length;
  
  return (recentAvg - olderAvg) * 5; // Scale appropriately
};

const calculateWellnessTrend = (wellnessData: any[]): number => {
  if (wellnessData.length < 2) return 0;
  
  const sortedWellness = [...wellnessData].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const recent = sortedWellness[sortedWellness.length - 1];
  const older = sortedWellness[0];
  
  return ((recent.overall_score || 0) - (older.overall_score || 0)) * 2;
};

const classifyTrend = (trendValue: number): string => {
  if (trendValue > 15) return 'significant_improvement';
  if (trendValue > 5) return 'slight_improvement';
  if (trendValue < -15) return 'significant_decline';
  if (trendValue < -5) return 'slight_decline';
  return 'stable';
};

const calculateConfidence = (analysisCount: number, componentCount: number): number => {
  // Base confidence on amount of data
  let confidence = Math.min(analysisCount * 10, 70);
  
  // Bonus for multiple data sources
  confidence += componentCount * 7.5;
  
  return Math.min(confidence, 100);
};

const calculateEmotionDistribution = (analyses: AnalysisData[]): Record<string, number> => {
  const distribution: Record<string, number> = {};
  
  analyses.forEach(analysis => {
    const emotion = analysis.primary_emotion;
    distribution[emotion] = (distribution[emotion] || 0) + 1;
  });
  
  // Convert to percentages
  const total = analyses.length;
  Object.keys(distribution).forEach(emotion => {
    distribution[emotion] = Math.round((distribution[emotion] / total) * 100);
  });
  
  return distribution;
};

const calculateConfidenceTrend = (analyses: AnalysisData[]): number => {
  if (analyses.length < 3) return 0;
  
  const sortedAnalyses = [...analyses].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const recentAvg = sortedAnalyses.slice(-3).reduce((sum, a) => sum + a.primary_confidence, 0) / 3;
  const olderAvg = sortedAnalyses.slice(0, 3).reduce((sum, a) => sum + a.primary_confidence, 0) / 3;
  
  return recentAvg - olderAvg;
};

const identifyRiskFactors = (analyses: AnalysisData[], diaryData: any[]): string[] => {
  const riskFactors: string[] = [];
  
  // Check for concerning emotions
  const recentAnalyses = analyses.slice(0, 5);
  const negativeEmotions = recentAnalyses.filter(a => 
    ['ansioso', 'triste', 'aggressivo'].includes(a.primary_emotion)
  );
  
  if (negativeEmotions.length > 2) {
    riskFactors.push('Frequenti emozioni negative recenti');
  }
  
  // Check confidence levels
  const lowConfidenceAnalyses = recentAnalyses.filter(a => a.primary_confidence < 60);
  if (lowConfidenceAnalyses.length > 2) {
    riskFactors.push('Bassa affidabilità nelle analisi recenti');
  }
  
  // Check diary mood patterns
  const recentDiary = diaryData.slice(0, 7).filter(entry => entry.mood_score !== null);
  if (recentDiary.length > 3) {
    const avgMood = recentDiary.reduce((sum, e) => sum + e.mood_score, 0) / recentDiary.length;
    if (avgMood < 3) {
      riskFactors.push('Mood bassi registrati nel diario');
    }
  }
  
  return riskFactors;
};

const generateRecommendations = (
  trend: number, 
  analyses: AnalysisData[], 
  riskFactors: string[]
): string[] => {
  const recommendations: string[] = [];
  
  if (trend > 10) {
    recommendations.push('Continua con le routine attuali che stanno funzionando bene');
    recommendations.push('Documenta le attività che portano risultati positivi');
  } else if (trend < -10) {
    recommendations.push('Considera una valutazione veterinaria comportamentale');
    recommendations.push('Implementa attività calmanti e rassicuranti');
  } else {
    recommendations.push('Mantieni una routine equilibrata di attività e riposo');
  }
  
  if (riskFactors.length > 0) {
    recommendations.push('Monitora attentamente i comportamenti nelle prossime settimane');
    recommendations.push('Considera il supporto di un esperto comportamentale');
  }
  
  // Emotion-specific recommendations
  const recentEmotions = analyses.slice(0, 3).map(a => a.primary_emotion);
  if (recentEmotions.includes('ansioso')) {
    recommendations.push('Implementa tecniche di rilassamento e riduzione dello stress');
  }
  if (recentEmotions.includes('giocoso')) {
    recommendations.push('Mantieni alti livelli di stimolazione mentale e fisica');
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
};

const predictFutureWellness = (trend: number, analyses: AnalysisData[]) => {
  const currentAvgConfidence = analyses.slice(0, 5).reduce((sum, a) => sum + a.primary_confidence, 0) / Math.min(5, analyses.length);
  
  // Simple linear prediction for next week
  const predictedConfidence = Math.max(0, Math.min(100, currentAvgConfidence + (trend * 0.5)));
  
  let predictionText = '';
  if (predictedConfidence > currentAvgConfidence + 5) {
    predictionText = 'Miglioramento del benessere emotivo previsto';
  } else if (predictedConfidence < currentAvgConfidence - 5) {
    predictionText = 'Possibile calo del benessere emotivo';
  } else {
    predictionText = 'Stabilità emotiva prevista';
  }
  
  return {
    confidence: Math.round(predictedConfidence),
    description: predictionText,
    timeframe: '7 giorni',
    reliability: Math.min(90, analyses.length * 10)
  };
};