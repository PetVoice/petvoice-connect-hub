import { type Insight } from '@/components/insights/InsightCard';

interface InsightGeneratorData {
  analysisData: any[];
  diaryData: any[];
  healthData: any[];
  wellnessData: any[];
  petData: any;
  timeRange: string;
}

export function generateInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  
  // Pattern Recognition Insights (using real data)
  insights.push(...generatePatternInsights(data));
  
  // Behavioral Predictions (enhanced analysis)
  insights.push(...generatePredictionInsights(data));
  
  // Intervention Suggestions (smart recommendations)
  insights.push(...generateInterventionInsights(data));
  
  // Correlation Discoveries (enhanced analysis)
  insights.push(...generateCorrelationInsights(data));
  
  // Remove duplicates based on ID
  const uniqueInsights = insights.filter((insight, index, self) => 
    index === self.findIndex(i => i.id === insight.id)
  );
  
  return uniqueInsights.sort((a, b) => {
    // Sort by severity first, then by confidence
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aSeverity = severityOrder[a.severity as keyof typeof severityOrder];
    const bSeverity = severityOrder[b.severity as keyof typeof severityOrder];
    
    if (aSeverity !== bSeverity) {
      return bSeverity - aSeverity;
    }
    
    return b.confidence - a.confidence;
  });
}

function generatePatternInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, petData } = data;
  
  // Emotion patterns analysis - Enhanced
  if (Array.isArray(analysisData) && analysisData.length > 5) {
    const emotionCounts = analysisData.reduce((acc: Record<string, number>, analysis: any) => {
      acc[analysis.primary_emotion] = (acc[analysis.primary_emotion] || 0) + 1;
      return acc;
    }, {});
    
    const totalAnalyses = analysisData.length;
    const emotionDistribution = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count: count as number, percentage: ((count as number) / totalAnalyses) * 100 }))
      .sort((a, b) => b.count - a.count);
    
    // Dominant emotion pattern
    const dominantEmotion = emotionDistribution[0];
    if (dominantEmotion && dominantEmotion.percentage > 40) {
      insights.push({
        id: `pattern-dominant-emotion-${dominantEmotion.emotion}`,
        type: 'pattern',
        title: `Pattern Emotivo Dominante: ${dominantEmotion.emotion.toUpperCase()}`,
        description: `${petData?.name || 'Il pet'} mostra l'emozione "${dominantEmotion.emotion}" nel ${Math.round(dominantEmotion.percentage)}% delle analisi recenti.`,
        confidence: Math.min(95, Math.round(dominantEmotion.percentage + 20)),
        severity: ['stress', 'fear', 'aggressive', 'anxious'].includes(dominantEmotion.emotion) ? 'high' : 
                 ['sad'].includes(dominantEmotion.emotion) ? 'medium' : 'low',
        category: 'Pattern Emotivi',
        evidence: {
          dataPoints: totalAnalyses,
          timeFrame: data.timeRange,
          sources: ['Analisi Emotiva', 'Dati Comportamentali']
        },
        trend: 'stable',
        recommendation: ['stress', 'fear', 'aggressive'].includes(dominantEmotion.emotion) ? {
          action: 'Ridurre fattori di stress ambientali, introdurre attività calmanti e consultare veterinario se persiste',
          successProbability: 85,
          expectedOutcome: 'Riduzione degli stati emotivi negativi entro 1-2 settimane'
        } : undefined
      });
    }
  }
  
  // Activity level patterns from diary
  if (diaryData.length > 5) {
    const moodScores = diaryData
      .filter((entry: any) => entry.mood_score !== null && entry.mood_score !== undefined)
      .map((entry: any) => entry.mood_score);
    
    if (moodScores.length >= 5) {
      const avgMood = moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length;
      
      // Check for consistently low mood
      const lowMoodDays = moodScores.filter(score => score <= 4).length;
      if (lowMoodDays > moodScores.length * 0.4) {
        insights.push({
          id: 'pattern-persistent-low-mood',
          type: 'pattern',
          title: 'Pattern di Umore Costantemente Basso',
          description: `${lowMoodDays} giorni su ${moodScores.length} con umore ≤4/10 (${Math.round((lowMoodDays / moodScores.length) * 100)}%)`,
          confidence: 85,
          severity: lowMoodDays > moodScores.length * 0.6 ? 'critical' : 'high',
          category: 'Benessere Emotivo',
          evidence: {
            dataPoints: moodScores.length,
            timeFrame: data.timeRange,
            sources: ['Diario', 'Monitoraggio Benessere']
          },
          metrics: {
            current: Math.round(avgMood * 10) / 10,
            target: 7.0,
            unit: '/10'
          },
          recommendation: {
            action: 'Consultazione veterinaria urgente, valutare cambiamenti ambientali e alimentari, aumentare attività fisica',
            successProbability: 75,
            expectedOutcome: 'Miglioramento graduale dell\'umore con intervento appropriato'
          }
        });
      }
    }
  }
  
  return insights;
}

function generatePredictionInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, healthData, petData } = data;
  
  // Advanced stress prediction based on multiple factors
  if (analysisData.length > 10) {
    const recentAnalyses = analysisData.slice(-10);
    const stressIndicators = recentAnalyses.filter(analysis => 
      ['stress', 'fear', 'anxious', 'aggressive'].includes(analysis.primary_emotion)
    ).length;
    
    const stressRisk = (stressIndicators / recentAnalyses.length) * 100;
    const confidenceBoost = Math.min(20, recentAnalyses.length - 5);
    
    if (stressRisk > 25) {
      insights.push({
        id: 'prediction-stress-escalation',
        type: 'prediction',
        title: `Predizione Stress: Rischio ${stressRisk > 60 ? 'ALTO' : stressRisk > 40 ? 'MEDIO' : 'BASSO'}`,
        description: `Basato sui pattern recenti, c'è una probabilità del ${Math.round(stressRisk)}% di aumento dei livelli di stress nei prossimi giorni.`,
        confidence: Math.min(95, Math.round(stressRisk + confidenceBoost + 30)),
        severity: stressRisk > 60 ? 'critical' : stressRisk > 40 ? 'high' : 'medium',
        category: 'Predizioni Comportamentali',
        evidence: {
          dataPoints: recentAnalyses.length,
          timeFrame: 'Ultimi 10 analisi',
          sources: ['Analisi Emotiva', 'Pattern Comportamentali', 'Algoritmo Predittivo']
        },
        recommendation: {
          action: stressRisk > 60 ? 
            'AZIONE IMMEDIATA: Rimuovere stressor ambientali, consultare veterinario, introdurre routine calmanti' :
            'Monitorare attentamente, ridurre stimoli stressanti, aumentare attività rilassanti',
          successProbability: stressRisk > 60 ? 70 : 85,
          expectedOutcome: stressRisk > 60 ? 
            'Stabilizzazione entro 3-5 giorni con intervento appropriato' :
            'Prevenzione dell\'escalation di stress entro 2-3 giorni'
        }
      });
    }
  }
  
  // Health trend predictions based on metrics
  if (healthData.length > 8) {
    const metricGroups = healthData.reduce((groups: Record<string, any[]>, metric: any) => {
      if (!groups[metric.metric_type]) groups[metric.metric_type] = [];
      groups[metric.metric_type].push(metric);
      return groups;
    }, {});
    
    Object.entries(metricGroups).forEach(([metricType, metrics]: [string, any[]]) => {
      if (metrics && Array.isArray(metrics) && metrics.length >= 3) {
        const values = metrics.map((m: any) => m.value).sort((a, b) => a - b);
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const trend = lastValue - firstValue;
        const trendPercentage = Math.abs(trend) / firstValue * 100;
        
        if (trendPercentage > 10) {
          insights.push({
            id: `prediction-${metricType}-trend`,
            type: 'prediction',
            title: `Predizione Salute: Trend ${metricType}`,
            description: `${metricType} ${trend > 0 ? 'in aumento' : 'in diminuzione'} del ${trendPercentage.toFixed(1)}% (da ${firstValue} a ${lastValue})`,
            confidence: Math.min(90, Math.round(trendPercentage + 50)),
            severity: trendPercentage > 25 ? 'high' : 'medium',
            category: 'Predizioni Salute',
            evidence: {
              dataPoints: metrics.length,
              timeFrame: data.timeRange,
              sources: ['Metriche Salute', 'Analisi Trend', 'Dati Fisiologici']
            },
            recommendation: {
              action: `Monitorare ${metricType} e consultare veterinario se il trend persiste`,
              successProbability: 80,
              expectedOutcome: `Stabilizzazione dei valori entro 1-2 settimane`
            }
          });
        }
      }
    });
  }
  
  return insights;
}

function generateInterventionInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, healthData, petData } = data;
  
  // Smart exercise intervention based on activity analysis
  if (diaryData.length > 5) {
    const activityAnalysis = diaryData.map((entry: any) => {
      const lowEnergyTags = ['sedentario', 'inattivo', 'bassa_energia', 'pigro', 'stanco'];
      const hasLowEnergy = entry.behavioral_tags?.some((tag: string) => 
        lowEnergyTags.some(lowTag => tag.toLowerCase().includes(lowTag))
      );
      
      return {
        date: entry.entry_date,
        mood: entry.mood_score || 5,
        lowEnergy: hasLowEnergy,
        tags: entry.behavioral_tags || []
      };
    });
    
    const lowEnergyDays = activityAnalysis.filter(day => day.lowEnergy).length;
    const totalDays = activityAnalysis.length;
    
    if (lowEnergyDays > totalDays * 0.4) {
      insights.push({
        id: 'intervention-increase-activity',
        type: 'intervention',
        title: 'Intervento: Aumento Attività Fisica',
        description: `Rilevata bassa attività in ${lowEnergyDays}/${totalDays} giorni (${Math.round((lowEnergyDays/totalDays)*100)}%).`,
        confidence: Math.min(90, Math.round((lowEnergyDays/totalDays)*100 + 30)),
        severity: lowEnergyDays > totalDays * 0.6 ? 'high' : 'medium',
        category: 'Interventi Attività Fisica',
        evidence: {
          dataPoints: totalDays,
          timeFrame: data.timeRange,
          sources: ['Diario Comportamentale', 'Analisi Attività']
        },
        recommendation: {
          action: 'Programma graduale: iniziare con 2 sessioni da 15 minuti al giorno, aumentare progressivamente. Include giochi interattivi, passeggiate esplorative, training mentale.',
          successProbability: 85,
          expectedOutcome: 'Aumento dell\'energia e miglioramento dell\'umore entro 1-2 settimane.'
        }
      });
    }
  }
  
  // Environmental enrichment intervention based on emotional analysis
  if (analysisData.length > 8) {
    const negativeEmotions = ['stress', 'fear', 'sad', 'aggressive', 'anxious'];
    const negativeCount = analysisData.filter(analysis => 
      negativeEmotions.includes(analysis.primary_emotion)
    ).length;
    
    const negativeRatio = negativeCount / analysisData.length;
    
    if (negativeRatio > 0.3) {
      insights.push({
        id: 'intervention-environmental-enrichment',
        type: 'intervention',
        title: 'Intervento Ambientale: Riduzione Stress',
        description: `Emozioni negative nel ${Math.round(negativeRatio * 100)}% delle analisi. Necessario migliorare ambiente.`,
        confidence: Math.min(95, Math.round(negativeRatio * 100 + 30)),
        severity: negativeRatio > 0.6 ? 'critical' : negativeRatio > 0.45 ? 'high' : 'medium',
        category: 'Arricchimento Ambientale',
        evidence: {
          dataPoints: analysisData.length,
          timeFrame: data.timeRange,
          sources: ['Analisi Emotiva', 'Pattern Comportamentali']
        },
        recommendation: {
          action: 'Migliorare arricchimento ambientale: nuovi giochi, routine varie, stimolazione mentale, zone sicure',
          successProbability: 85,
          expectedOutcome: 'Riduzione delle emozioni negative del 30-50% entro 3-4 settimane'
        }
      });
    }
  }
  
  return insights;
}

function generateCorrelationInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, healthData, petData } = data;
  
  // Weather-mood correlation
  if (diaryData.length > 5) {
    const weatherMoodData = diaryData
      .filter((entry: any) => entry.weather_condition && entry.mood_score)
      .reduce((acc: Record<string, number[]>, entry: any) => {
        if (!acc[entry.weather_condition]) {
          acc[entry.weather_condition] = [];
        }
        acc[entry.weather_condition].push(entry.mood_score);
        return acc;
      }, {});
    
    const weatherCorrelations = Object.entries(weatherMoodData).map(([weather, moods]) => ({
      weather,
      avgMood: (moods as number[]).reduce((a: number, b: number) => a + b, 0) / (moods as number[]).length,
      count: (moods as number[]).length
    }));
    
    if (weatherCorrelations.length > 1) {
      const highestMoodWeather = weatherCorrelations.reduce((max, current) => 
        current.avgMood > max.avgMood ? current : max
      );
      
      const lowestMoodWeather = weatherCorrelations.reduce((min, current) => 
        current.avgMood < min.avgMood ? current : min
      );
      
      const moodDifference = highestMoodWeather.avgMood - lowestMoodWeather.avgMood;
      
      if (moodDifference > 1.5) {
        insights.push({
          id: 'correlation-weather-mood',
          type: 'correlation',
          title: 'Correlazione Meteo-Umore Scoperta',
          description: `L'umore è ${moodDifference.toFixed(1)} punti più alto con ${highestMoodWeather.weather} vs ${lowestMoodWeather.weather}.`,
          confidence: 76,
          severity: 'medium',
          category: 'Fattori Ambientali',
          evidence: {
            dataPoints: diaryData.filter((e: any) => e.weather_condition && e.mood_score).length,
            timeFrame: data.timeRange,
            sources: ['Diario', 'Dati Meteo']
          },
          recommendation: {
            action: `Pianificare più attività durante ${highestMoodWeather.weather}, fornire comfort extra durante ${lowestMoodWeather.weather}`,
            successProbability: 70,
            expectedOutcome: 'Umore più consistente indipendentemente dal meteo'
          }
        });
      }
    }
  }
  
  // Time-based emotion correlation
  if (analysisData.length > 10) {
    const hourlyEmotions = analysisData.reduce((acc: Record<number, string[]>, analysis: any) => {
      const hour = new Date(analysis.created_at).getHours();
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(analysis.primary_emotion);
      return acc;
    }, {});
    
    const peakActivityHour = Object.entries(hourlyEmotions)
      .map(([hour, emotions]) => ({
        hour: parseInt(hour),
        count: (emotions as string[]).length,
        positiveRatio: (emotions as string[]).filter(e => ['happy', 'calm', 'playful'].includes(e)).length / (emotions as string[]).length
      }))
      .filter(data => data.count >= 3)
      .sort((a, b) => b.positiveRatio - a.positiveRatio)[0];
    
    if (peakActivityHour && peakActivityHour.positiveRatio > 0.7) {
      insights.push({
        id: 'correlation-time-emotion',
        type: 'correlation',
        title: 'Orario Ottimale Attività Scoperto',
        description: `Emozioni positive massime intorno alle ${peakActivityHour.hour}:00 con ${Math.round(peakActivityHour.positiveRatio * 100)}% di positività.`,
        confidence: 82,
        severity: 'low',
        category: 'Pattern Temporali',
        evidence: {
          dataPoints: peakActivityHour.count,
          timeFrame: data.timeRange,
          sources: ['Analisi Emotiva', 'Dati Temporali']
        },
        recommendation: {
          action: `Programmare attività principali, training e tempo di qualità intorno alle ${peakActivityHour.hour}:00`,
          successProbability: 85,
          expectedOutcome: 'Migliore efficacia del training e legame più forte'
        }
      });
    }
  }
  
  return insights;
}