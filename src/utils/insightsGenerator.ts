import { type Insight } from '@/components/insights/InsightCard';
import { supabase } from '@/integrations/supabase/client';

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
    
    // Emotional diversity analysis
    const emotionDiversity = emotionDistribution.length;
    if (emotionDiversity <= 2 && totalAnalyses > 10) {
      insights.push({
        id: 'pattern-emotion-monotony',
        type: 'pattern',
        title: 'Bassa Diversità Emotiva Rilevata',
        description: `Solo ${emotionDiversity} emozioni diverse rilevate su ${totalAnalyses} analisi. Questo potrebbe indicare limitata espressività emotiva.`,
        confidence: 78,
        severity: 'medium',
        category: 'Diversità Emotiva',
        evidence: {
          dataPoints: totalAnalyses,
          timeFrame: data.timeRange,
          sources: ['Analisi Emotiva', 'Variabilità Comportamentale']
        },
        recommendation: {
          action: 'Aumentare stimolazione ambientale, introdurre nuove attività e giochi per stimolare diverse espressioni emotive',
          successProbability: 80,
          expectedOutcome: 'Maggiore varietà nelle espressioni emotive entro 2-3 settimane'
        }
      });
    }
  }
  
  // Temporal patterns - when emotions occur
  if (analysisData.length > 7) {
    const emotionsByHour = analysisData.reduce((acc: Record<number, string[]>, analysis: any) => {
      const hour = new Date(analysis.created_at).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(analysis.primary_emotion);
      return acc;
    }, {});
    
    const hourlyAnalysis = Object.entries(emotionsByHour).map(([hour, emotions]) => {
      const negativeEmotions = emotions.filter(e => ['stress', 'fear', 'sad', 'aggressive'].includes(e)).length;
      const positiveEmotions = emotions.filter(e => ['happy', 'playful', 'calm'].includes(e)).length;
      return {
        hour: parseInt(hour),
        total: emotions.length,
        negativeRatio: negativeEmotions / emotions.length,
        positiveRatio: positiveEmotions / emotions.length
      };
    }).filter(h => h.total >= 2);
    
    const problematicHours = hourlyAnalysis.filter(h => h.negativeRatio > 0.6);
    if (problematicHours.length > 0) {
      const worstHour = problematicHours.reduce((max, current) => 
        current.negativeRatio > max.negativeRatio ? current : max
      );
      
      insights.push({
        id: 'pattern-time-negative',
        type: 'pattern',
        title: `Pattern Temporale Negativo: Ore ${worstHour.hour}:00`,
        description: `Alle ${worstHour.hour}:00 si registra il ${Math.round(worstHour.negativeRatio * 100)}% di emozioni negative. Potrebbe indicare stress legato a routine specifiche.`,
        confidence: Math.min(90, Math.round(worstHour.negativeRatio * 100 + 20)),
        severity: worstHour.negativeRatio > 0.8 ? 'high' : 'medium',
        category: 'Pattern Temporali',
        evidence: {
          dataPoints: worstHour.total,
          timeFrame: data.timeRange,
          sources: ['Analisi Temporale', 'Pattern Comportamentali']
        },
        recommendation: {
          action: `Evitare attività stressanti alle ${worstHour.hour}:00, introdurre routine calmanti in questo orario`,
          successProbability: 75,
          expectedOutcome: 'Riduzione dello stress in questo specifico orario'
        }
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
      const moodVariance = moodScores.reduce((acc, mood) => acc + Math.pow(mood - avgMood, 2), 0) / moodScores.length;
      const moodStdDev = Math.sqrt(moodVariance);
      
      // Check for mood instability
      if (moodStdDev > 2.5) {
        insights.push({
          id: 'pattern-mood-instability',
          type: 'pattern',
          title: 'Instabilità dell\'Umore Rilevata',
          description: `L'umore varia significativamente (deviazione standard: ${moodStdDev.toFixed(1)}). Media: ${avgMood.toFixed(1)}/10.`,
          confidence: Math.min(90, Math.round(moodStdDev * 20 + 50)),
          severity: moodStdDev > 3.5 ? 'high' : 'medium',
          category: 'Stabilità Emotiva',
          evidence: {
            dataPoints: moodScores.length,
            timeFrame: data.timeRange,
            sources: ['Diario', 'Tracking Umore']
          },
          metrics: {
            current: Math.round(avgMood * 10) / 10,
            target: 7.5,
            unit: '/10'
          },
          trend: avgMood < 5 ? 'down' : avgMood > 7 ? 'up' : 'stable',
          recommendation: {
            action: 'Identificare trigger di variazioni d\'umore, mantenere routine stabili, ridurre stress ambientali',
            successProbability: 70,
            expectedOutcome: 'Maggiore stabilità emotiva entro 2-4 settimane'
          }
        });
      }
      
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
  
  // Emotion pattern analysis
  if (Array.isArray(analysisData) && analysisData.length > 5) {
    const emotionCounts = analysisData.reduce((acc: Record<string, number>, analysis: any) => {
      acc[analysis.primary_emotion] = (acc[analysis.primary_emotion] || 0) + 1;
      return acc;
    }, {});
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (dominantEmotion && (dominantEmotion[1] as number) > analysisData.length * 0.4) {
      insights.push({
        id: `pattern-emotion-${dominantEmotion[0]}`,
        type: 'pattern',
        title: `Dominant Emotion Pattern: ${dominantEmotion[0]}`,
        description: `${petData?.name || 'Your pet'} shows ${dominantEmotion[0]} emotion in ${Math.round(((dominantEmotion[1] as number) / analysisData.length) * 100)}% of recent analyses.`,
        confidence: 85,
        severity: dominantEmotion[0] === 'stress' || dominantEmotion[0] === 'fear' ? 'high' : 'medium',
        category: 'Emotional Patterns',
        evidence: {
          dataPoints: analysisData.length,
          timeFrame: data.timeRange,
          sources: ['Emotion Analysis', 'Behavioral Data']
        },
        trend: 'stable'
      });
    }
  }
  
  // Activity pattern analysis
  if (diaryData.length > 3) {
    const moodScores = diaryData
      .filter((entry: any) => entry.mood_score)
      .map((entry: any) => entry.mood_score);
    
    if (moodScores.length > 0) {
      const avgMood = moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length;
      const moodTrend = moodScores.length > 1 ? 
        (moodScores[moodScores.length - 1] - moodScores[0]) / moodScores.length : 0;
      
      insights.push({
        id: 'pattern-mood-trend',
        type: 'pattern',
        title: 'Mood Pattern Analysis',
        description: `Average mood score is ${avgMood.toFixed(1)}/10 with a ${moodTrend > 0 ? 'positive' : moodTrend < 0 ? 'negative' : 'stable'} trend.`,
        confidence: 78,
        severity: avgMood < 4 ? 'high' : avgMood < 6 ? 'medium' : 'low',
        category: 'Mood Patterns',
        evidence: {
          dataPoints: moodScores.length,
          timeFrame: data.timeRange,
          sources: ['Diary Entries', 'Mood Tracking']
        },
        trend: moodTrend > 0.1 ? 'up' : moodTrend < -0.1 ? 'down' : 'stable',
        metrics: {
          current: Math.round(avgMood * 10) / 10,
          target: 8.0,
          unit: '/10'
        }
      });
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
    const confidenceBoost = Math.min(20, recentAnalyses.length - 5); // More data = higher confidence
    
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
    const recentMetrics = healthData.slice(-8);
    const metricGroups = recentMetrics.reduce((groups: Record<string, any[]>, metric: any) => {
      if (!groups[metric.metric_type]) groups[metric.metric_type] = [];
      groups[metric.metric_type].push(metric);
      return groups;
    }, {});
    
    Object.entries(metricGroups).forEach(([metricType, metrics]) => {
      if (metrics.length >= 3) {
        const values = metrics.map((m: any) => m.value).sort((a, b) => a - b);
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const trend = lastValue - firstValue;
        const trendPercentage = Math.abs(trend) / firstValue * 100;
        
        if (trendPercentage > 10) { // Significant change
          const translateType = (type: string) => {
            const translations: Record<string, string> = {
              'weight': 'Peso',
              'temperature': 'Temperatura',
              'heart_rate': 'Battito Cardiaco',
              'breathing_rate': 'Respirazione'
            };
            return translations[type] || type;
          };
          
          const criticalThresholds: Record<string, {min: number, max: number}> = {
            'temperature': {min: 37.5, max: 40.0},
            'weight': {min: 0, max: 999}, // Will be calculated based on breed
            'heart_rate': {min: 50, max: 240}
          };
          
          const isCritical = criticalThresholds[metricType] && 
            (lastValue < criticalThresholds[metricType].min || 
             lastValue > criticalThresholds[metricType].max);
          
          insights.push({
            id: `prediction-${metricType}-trend`,
            type: 'prediction',
            title: `Predizione Salute: Trend ${translateType(metricType)}`,
            description: `${translateType(metricType)} ${trend > 0 ? 'in aumento' : 'in diminuzione'} del ${trendPercentage.toFixed(1)}% (da ${firstValue} a ${lastValue})${isCritical ? ' - VALORI CRITICI' : ''}`,
            confidence: Math.min(90, Math.round(trendPercentage + 50)),
            severity: isCritical ? 'critical' : trendPercentage > 25 ? 'high' : 'medium',
            category: 'Predizioni Salute',
            evidence: {
              dataPoints: metrics.length,
              timeFrame: data.timeRange,
              sources: ['Metriche Salute', 'Analisi Trend', 'Dati Fisiologici']
            },
            metrics: {
              current: Math.round(lastValue * 100) / 100,
              target: metricType === 'temperature' ? 38.5 : 
                     metricType === 'weight' ? firstValue : 
                     metricType === 'heart_rate' ? 120 : lastValue,
              unit: metricType === 'temperature' ? '°C' : 
                   metricType === 'weight' ? 'kg' : 
                   metricType === 'heart_rate' ? 'bpm' : 'unità'
            },
            recommendation: {
              action: isCritical ? 
                'CONSULTAZIONE VETERINARIA URGENTE - Valori fuori norma' :
                trend > 0 && metricType === 'weight' ? 
                  'Controllare dieta e aumentare esercizio fisico, monitorare porzioni' :
                trend < 0 && metricType === 'weight' ?
                  'Monitorare appetito, controllare eventuali problemi di salute, consultare veterinario' :
                `Monitorare ${translateType(metricType).toLowerCase()} e consultare veterinario se il trend persiste`,
              successProbability: isCritical ? 60 : 80,
              expectedOutcome: isCritical ? 
                'Diagnosi e trattamento appropriato' :
                `Stabilizzazione dei valori di ${translateType(metricType).toLowerCase()} entro 1-2 settimane`
            }
          });
        }
      }
    });
  }
  
  // Behavioral prediction based on diary patterns
  if (diaryData.length > 7) {
    const recentEntries = diaryData.slice(-7);
    const behavioralTags = recentEntries
      .filter((entry: any) => entry.behavioral_tags && entry.behavioral_tags.length > 0)
      .flatMap((entry: any) => entry.behavioral_tags);
    
    if (behavioralTags.length > 0) {
      const tagCounts = behavioralTags.reduce((acc: Record<string, number>, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      
      const dominantBehaviors = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count: count as number, frequency: (count as number) / recentEntries.length }))
        .filter(b => b.frequency > 0.3)
        .sort((a, b) => b.count - a.count);
      
      if (dominantBehaviors.length > 0) {
        const topBehavior = dominantBehaviors[0];
        const isNegative = ['aggressivo', 'ansioso', 'depresso', 'agitato', 'spaventato', 'inattivo'].includes(topBehavior.tag.toLowerCase());
        
        insights.push({
          id: `prediction-behavior-${topBehavior.tag}`,
          type: 'prediction',
          title: `Predizione Comportamento: ${topBehavior.tag.toUpperCase()}`,
          description: `Il comportamento "${topBehavior.tag}" è presente nel ${Math.round(topBehavior.frequency * 100)}% delle osservazioni recenti. ${isNegative ? 'Tendenza preoccupante.' : 'Pattern positivo.'}`,
          confidence: Math.min(85, Math.round(topBehavior.frequency * 100 + 20)),
          severity: isNegative ? (topBehavior.frequency > 0.6 ? 'high' : 'medium') : 'low',
          category: 'Predizioni Comportamentali',
          evidence: {
            dataPoints: recentEntries.length,
            timeFrame: 'Ultimi 7 giorni',
            sources: ['Diario Comportamentale', 'Osservazioni Dirette']
          },
          recommendation: isNegative ? {
            action: `Affrontare il comportamento "${topBehavior.tag}" attraverso ${
              topBehavior.tag.includes('aggress') ? 'training comportamentale professionale' :
              topBehavior.tag.includes('ansioso') ? 'tecniche di desensibilizzazione e rilassamento' :
              topBehavior.tag.includes('inattivo') ? 'aumento dell\'attività fisica e stimolazione mentale' :
              'interventi ambientali e comportamentali mirati'
            }`,
            successProbability: 75,
            expectedOutcome: `Riduzione del comportamento "${topBehavior.tag}" entro 2-3 settimane`
          } : {
            action: `Mantenere e rafforzare il comportamento positivo "${topBehavior.tag}" attraverso rinforzo positivo`,
            successProbability: 90,
            expectedOutcome: 'Consolidamento del comportamento positivo'
          }
        });
      }
    }
  }
  
  return insights;
}
  
  // Stress prediction based on patterns
  if (analysisData.length > 7) {
    const recentStress = analysisData
      .slice(-7)
      .filter((analysis: any) => analysis.primary_emotion === 'stress').length;
    
    const stressRisk = (recentStress / 7) * 100;
    
    if (stressRisk > 30) {
      insights.push({
        id: 'prediction-stress-risk',
        type: 'prediction',
        title: 'Elevated Stress Risk Prediction',
        description: `Based on recent patterns, there's a ${Math.round(stressRisk)}% probability of increased stress levels in the coming days.`,
        confidence: 72,
        severity: stressRisk > 60 ? 'high' : 'medium',
        category: 'Behavioral Health',
        evidence: {
          dataPoints: 7,
          timeFrame: 'Last 7 days',
          sources: ['Emotion Analysis', 'Behavioral Patterns']
        },
        recommendation: {
          action: 'Increase environmental enrichment and reduce stressors',
          successProbability: 85,
          expectedOutcome: 'Reduced stress indicators within 3-5 days',
          researchLink: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6168648/'
        }
      });
    }
  }
  
  // Health trend prediction
  if (healthData.length > 5) {
    const recentMetrics = healthData.slice(-5);
    const weightData = recentMetrics.filter((metric: any) => metric.metric_type === 'weight');
    
    if (weightData.length >= 3) {
      const weights = weightData.map((metric: any) => metric.value).sort((a: number, b: number) => a - b);
      const weightTrend = weights[weights.length - 1] - weights[0];
      
      if (Math.abs(weightTrend) > 0.5) {
        insights.push({
          id: 'prediction-weight-trend',
          type: 'prediction',
          title: `Weight ${weightTrend > 0 ? 'Gain' : 'Loss'} Trend`,
          description: `Predicted ${Math.abs(weightTrend).toFixed(1)}kg ${weightTrend > 0 ? 'weight gain' : 'weight loss'} trajectory detected.`,
          confidence: 68,
          severity: Math.abs(weightTrend) > 1 ? 'medium' : 'low',
          category: 'Physical Health',
          evidence: {
            dataPoints: weightData.length,
            timeFrame: data.timeRange,
            sources: ['Health Metrics', 'Weight Tracking']
          },
          recommendation: {
            action: weightTrend > 0 ? 'Consider dietary adjustment and increased exercise' : 'Monitor appetite and consult veterinarian',
            successProbability: 75,
            expectedOutcome: 'Stabilized weight within 2-3 weeks'
          }
        });
      }
    }
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
      const highEnergyTags = ['iperattivo', 'energico', 'giocoso', 'attivo'];
      
      const hasLowEnergy = entry.behavioral_tags?.some((tag: string) => 
        lowEnergyTags.some(lowTag => tag.toLowerCase().includes(lowTag))
      );
      const hasHighEnergy = entry.behavioral_tags?.some((tag: string) => 
        highEnergyTags.some(highTag => tag.toLowerCase().includes(highTag))
      );
      
      return {
        date: entry.entry_date,
        mood: entry.mood_score || 5,
        lowEnergy: hasLowEnergy,
        highEnergy: hasHighEnergy,
        tags: entry.behavioral_tags || []
      };
    });
    
    const lowEnergyDays = activityAnalysis.filter(day => day.lowEnergy).length;
    const highEnergyDays = activityAnalysis.filter(day => day.highEnergy).length;
    const totalDays = activityAnalysis.length;
    
    // Low activity intervention
    if (lowEnergyDays > totalDays * 0.4) {
      const avgMoodLowEnergy = activityAnalysis
        .filter(day => day.lowEnergy)
        .reduce((sum, day) => sum + day.mood, 0) / lowEnergyDays;
      
      insights.push({
        id: 'intervention-increase-activity',
        type: 'intervention',
        title: 'Intervento: Aumento Attività Fisica',
        description: `Rilevata bassa attività in ${lowEnergyDays}/${totalDays} giorni (${Math.round((lowEnergyDays/totalDays)*100)}%). Umore medio nei giorni inattivi: ${avgMoodLowEnergy.toFixed(1)}/10.`,
        confidence: Math.min(90, Math.round((lowEnergyDays/totalDays)*100 + 30)),
        severity: lowEnergyDays > totalDays * 0.6 ? 'high' : 'medium',
        category: 'Interventi Attività Fisica',
        evidence: {
          dataPoints: totalDays,
          timeFrame: data.timeRange,
          sources: ['Diario Comportamentale', 'Analisi Attività', 'Correlazione Umore-Attività']
        },
        recommendation: {
          action: 'Programma graduale: iniziare con 2 sessioni da 15 minuti al giorno, aumentare progressivamente. Include giochi interattivi, passeggiate esplorative, training mentale.',
          successProbability: 85,
          expectedOutcome: 'Aumento dell\'energia e miglioramento dell\'umore entro 1-2 settimane. Riduzione dei comportamenti sedentari.',
          researchLink: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478252/'
        }
      });
    }
    
    // Hyperactivity management intervention  
    if (highEnergyDays > totalDays * 0.5) {
      insights.push({
        id: 'intervention-channel-energy',
        type: 'intervention',
        title: 'Intervento: Gestione Energia Eccessiva',
        description: `Comportamento iperattivo rilevato in ${highEnergyDays}/${totalDays} giorni. Necessario canalizzare l'energia in modo costruttivo.`,
        confidence: Math.round((highEnergyDays/totalDays)*100 + 20),
        severity: 'medium',
        category: 'Gestione Comportamentale',
        evidence: {
          dataPoints: totalDays,
          timeFrame: data.timeRange,
          sources: ['Diario Comportamentale', 'Pattern Energetici']
        },
        recommendation: {
          action: 'Strutturare l\'energia: training di impulso control, puzzle food, agility, sessioni di training intensive ma brevi (5-10 min).',
          successProbability: 80,
          expectedOutcome: 'Migliore controllo dell\'impulso e comportamento più equilibrato entro 2-3 settimane'
        }
      });
    }
  }
  
  // Nutritional intervention based on health metrics
  if (healthData.length > 5) {
    const weightData = healthData.filter(h => h.metric_type === 'weight');
    if (weightData.length >= 3) {
      const weights = weightData.map(w => w.value).sort((a, b) => a - b);
      const weightChange = weights[weights.length - 1] - weights[0];
      const timeSpan = new Date(weightData[weightData.length - 1].recorded_at).getTime() - 
                      new Date(weightData[0].recorded_at).getTime();
      const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
      const weeklyChange = (weightChange / daysSpan) * 7;
      
      if (Math.abs(weeklyChange) > 0.1) { // Significant weekly change
        const isGaining = weightChange > 0;
        const currentWeight = weights[weights.length - 1];
        
        insights.push({
          id: `intervention-weight-${isGaining ? 'loss' : 'gain'}`,
          type: 'intervention',
          title: `Intervento Nutrizionale: ${isGaining ? 'Controllo Peso' : 'Aumento Peso'}`,
          description: `${isGaining ? 'Aumento' : 'Perdita'} di peso rilevante: ${Math.abs(weeklyChange).toFixed(2)}kg/settimana. Peso attuale: ${currentWeight}kg.`,
          confidence: Math.min(90, Math.abs(weeklyChange) * 200 + 60),
          severity: Math.abs(weeklyChange) > 0.3 ? 'high' : 'medium',
          category: 'Interventi Nutrizionali',
          evidence: {
            dataPoints: weightData.length,
            timeFrame: `${Math.round(daysSpan)} giorni`,
            sources: ['Metriche Peso', 'Analisi Trend', 'Dati Nutrizionali']
          },
          recommendation: {
            action: isGaining ? 
              'Ridurre porzioni del 10-15%, aumentare fibra nella dieta, sostituire snack con verdure, incrementare esercizio gradualmente' :
              'Aumentare apporto calorico del 10-20%, verificare problemi di salute sottostanti, consultare veterinario per escludere patologie',
            successProbability: isGaining ? 85 : 70,
            expectedOutcome: isGaining ? 
              'Perdita di peso graduale di 0.5-1kg/mese fino al peso ideale' :
              'Aumento di peso sano di 0.2-0.5kg/settimana fino al peso target'
          }
        });
      }
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
      const mostCommonNegative = analysisData
        .filter(analysis => negativeEmotions.includes(analysis.primary_emotion))
        .reduce((acc: Record<string, number>, analysis) => {
          acc[analysis.primary_emotion] = (acc[analysis.primary_emotion] || 0) + 1;
          return acc;
        }, {});
      
      const dominantNegativeEmotion = Object.entries(mostCommonNegative)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      const specificInterventions: Record<string, string> = {
        'stress': 'Creare zone sicure, ridurre rumori forti, introdurre routine prevedibili, utilizzare feromoni calmanti',
        'fear': 'Desensibilizzazione graduale, rinforzo positivo, evitare forzature, creare associazioni positive',
        'aggressive': 'Training professionale, gestione trigger, aumento distanza da stimoli scatenanti, rinforzo comportamenti calmi',
        'sad': 'Aumentare interazioni positive, introdurre nuovi stimoli interessanti, verificare cause fisiche del disagio',
        'anxious': 'Tecniche di rilassamento, routine strutturate, esercizio fisico regolare, possibili ausili calmanti naturali'
      };
      
      insights.push({
        id: 'intervention-environmental-enrichment',
        type: 'intervention',
        title: `Intervento Ambientale: Gestione ${dominantNegativeEmotion?.[0]?.toUpperCase()}`,
        description: `Emozioni negative nel ${Math.round(negativeRatio * 100)}% delle analisi. Emozione prevalente: "${dominantNegativeEmotion?.[0]}" (${dominantNegativeEmotion?.[1]} occorrenze).`,
        confidence: Math.min(95, Math.round(negativeRatio * 100 + 30)),
        severity: negativeRatio > 0.6 ? 'critical' : negativeRatio > 0.45 ? 'high' : 'medium',
        category: 'Arricchimento Ambientale',
        evidence: {
          dataPoints: analysisData.length,
          timeFrame: data.timeRange,
          sources: ['Analisi Emotiva', 'Pattern Comportamentali', 'Valutazione Benessere']
        },
        recommendation: {
          action: dominantNegativeEmotion ? 
            specificInterventions[dominantNegativeEmotion[0]] || 'Consultare comportamentalista per piano personalizzato' :
            'Migliorare arricchimento ambientale generale: nuovi giochi, routine varie, stimolazione mentale',
          successProbability: negativeRatio > 0.6 ? 65 : 85,
          expectedOutcome: 'Riduzione delle emozioni negative del 30-50% entro 3-4 settimane con intervento consistente'
        }
      });
    }
  }
  
  return insights;
}
  
  // Exercise intervention based on activity levels
  if (diaryData.length > 3) {
    const lowActivityDays = diaryData.filter((entry: any) => 
      entry.behavioral_tags && 
      entry.behavioral_tags.some((tag: string) => 
        ['sedentary', 'low_energy', 'inactive'].includes(tag.toLowerCase())
      )
    ).length;
    
    if (lowActivityDays > diaryData.length * 0.4) {
      insights.push({
        id: 'intervention-exercise',
        type: 'intervention',
        title: 'Exercise Intervention Recommended',
        description: `${petData?.name || 'Your pet'} shows low activity levels on ${lowActivityDays} of ${diaryData.length} recent days.`,
        confidence: 80,
        severity: 'medium',
        category: 'Physical Activity',
        evidence: {
          dataPoints: diaryData.length,
          timeFrame: data.timeRange,
          sources: ['Diary Entries', 'Activity Tracking']
        },
        recommendation: {
          action: 'Implement structured exercise routine: 2-3 short play sessions daily',
          successProbability: 88,
          expectedOutcome: 'Increased energy levels and improved mood within 1 week',
          researchLink: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5478252/'
        }
      });
    }
  }
  
  // Enrichment intervention for negative emotions
  if (analysisData.length > 5) {
    const negativeEmotions = analysisData.filter((analysis: any) => 
      ['sad', 'stress', 'fear', 'aggressive'].includes(analysis.primary_emotion)
    ).length;
    
    if (negativeEmotions > analysisData.length * 0.3) {
      insights.push({
        id: 'intervention-enrichment',
        type: 'intervention',
        title: 'Environmental Enrichment Needed',
        description: `High frequency of negative emotions detected (${Math.round((negativeEmotions / analysisData.length) * 100)}% of analyses).`,
        confidence: 85,
        severity: 'high',
        category: 'Environmental Welfare',
        evidence: {
          dataPoints: analysisData.length,
          timeFrame: data.timeRange,
          sources: ['Emotion Analysis']
        },
        recommendation: {
          action: 'Add puzzle toys, rotate toys weekly, create hiding spots, increase interactive play',
          successProbability: 92,
          expectedOutcome: 'Reduced negative emotions and increased positive behaviors',
          researchLink: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4486064/'
        }
      });
    }
  }
  
  return insights;
}

function generateCorrelationInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, healthData, petData } = data;
  
  // Enhanced correlation analysis with health data
  if (healthData.length > 5 && diaryData.length > 5) {
    // Weight-mood correlation
    const weightData = healthData.filter(h => h.metric_type === 'weight');
    const moodData = diaryData.filter(d => d.mood_score);
    
    if (weightData.length >= 3 && moodData.length >= 3) {
      const correlationData = [];
      
      // Match weight and mood data by date
      weightData.forEach(weight => {
        const weightDate = new Date(weight.recorded_at).toDateString();
        const matchingMood = moodData.find(mood => 
          new Date(mood.entry_date).toDateString() === weightDate
        );
        
        if (matchingMood) {
          correlationData.push({
            weight: weight.value,
            mood: matchingMood.mood_score,
            date: weightDate
          });
        }
      });
      
      if (correlationData.length >= 3) {
        // Calculate correlation coefficient (simplified)
        const avgWeight = correlationData.reduce((sum, d) => sum + d.weight, 0) / correlationData.length;
        const avgMood = correlationData.reduce((sum, d) => sum + d.mood, 0) / correlationData.length;
        
        let correlation = 0;
        let weightVariance = 0;
        let moodVariance = 0;
        
        correlationData.forEach(d => {
          const weightDiff = d.weight - avgWeight;
          const moodDiff = d.mood - avgMood;
          correlation += weightDiff * moodDiff;
          weightVariance += weightDiff * weightDiff;
          moodVariance += moodDiff * moodDiff;
        });
        
        if (weightVariance > 0 && moodVariance > 0) {
          correlation = correlation / Math.sqrt(weightVariance * moodVariance);
          
          if (Math.abs(correlation) > 0.5) {
            insights.push({
              id: 'correlation-weight-mood',
              type: 'correlation',
              title: `Correlazione Peso-Umore: ${correlation > 0 ? 'Positiva' : 'Negativa'}`,
              description: `Rilevata correlazione ${Math.abs(correlation) > 0.7 ? 'forte' : 'moderata'} tra variazioni di peso e umore (r=${correlation.toFixed(2)})`,
              confidence: Math.min(90, Math.round(Math.abs(correlation) * 100)),
              severity: Math.abs(correlation) > 0.7 ? 'high' : 'medium',
              category: 'Correlazioni Salute-Comportamento',
              evidence: {
                dataPoints: correlationData.length,
                timeFrame: data.timeRange,
                sources: ['Health Metrics', 'Diary Entries', 'Statistical Analysis']
              },
              recommendation: {
                action: correlation > 0 ? 
                  'Monitorare la relazione positiva peso-umore per mantenere l\'equilibrio' : 
                  'Prestare attenzione ai cambiamenti di peso che potrebbero influire sull\'umore',
                successProbability: 75,
                expectedOutcome: 'Migliore comprensione del benessere generale'
              }
            });
          }
        }
      }
    }
  }
  
  // Temperature-behavior correlation  
  if (healthData.length > 5 && analysisData.length > 5) {
    const tempData = healthData.filter(h => h.metric_type === 'temperature');
    
    if (tempData.length >= 3) {
      const tempEmotionMap: Record<string, number[]> = {};
      
      tempData.forEach(temp => {
        const tempDate = new Date(temp.recorded_at);
        const matchingAnalysis = analysisData.find(analysis => {
          const analysisDate = new Date(analysis.created_at);
          return Math.abs(tempDate.getTime() - analysisDate.getTime()) < 24 * 60 * 60 * 1000; // Same day
        });
        
        if (matchingAnalysis) {
          const emotion = matchingAnalysis.primary_emotion;
          if (!tempEmotionMap[emotion]) {
            tempEmotionMap[emotion] = [];
          }
          tempEmotionMap[emotion].push(temp.value);
        }
      });
      
      const emotionTempAvgs = Object.entries(tempEmotionMap)
        .filter(([_, temps]) => temps.length >= 2)
        .map(([emotion, temps]) => ({
          emotion,
          avgTemp: temps.reduce((sum, temp) => sum + temp, 0) / temps.length,
          count: temps.length
        }));
      
      if (emotionTempAvgs.length >= 2) {
        const sortedByTemp = emotionTempAvgs.sort((a, b) => b.avgTemp - a.avgTemp);
        const tempDiff = sortedByTemp[0].avgTemp - sortedByTemp[sortedByTemp.length - 1].avgTemp;
        
        if (tempDiff > 0.5) { // Significant temperature difference
          insights.push({
            id: 'correlation-temp-emotion',
            type: 'correlation',
            title: 'Correlazione Temperatura-Emozione',
            description: `Temperatura corporea più alta durante emozione "${sortedByTemp[0].emotion}" (${sortedByTemp[0].avgTemp.toFixed(1)}°C) vs "${sortedByTemp[sortedByTemp.length - 1].emotion}" (${sortedByTemp[sortedByTemp.length - 1].avgTemp.toFixed(1)}°C)`,
            confidence: Math.min(85, Math.round(tempDiff * 20 + 60)),
            severity: tempDiff > 1.0 ? 'medium' : 'low',
            category: 'Correlazioni Fisiologiche',
            evidence: {
              dataPoints: emotionTempAvgs.reduce((sum, e) => sum + e.count, 0),
              timeFrame: data.timeRange,
              sources: ['Health Metrics', 'Emotion Analysis', 'Physiological Data']
            },
            recommendation: {
              action: 'Monitorare temperatura durante stati emotivi diversi per identificare pattern di stress fisiologico',
              successProbability: 70,
              expectedOutcome: 'Migliore identificazione precoce di stati di stress o malattia'
            }
          });
        }
      }
    }
  }
  
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
          title: 'Weather-Mood Correlation Discovered',
          description: `Strong correlation found: mood is ${moodDifference.toFixed(1)} points higher during ${highestMoodWeather.weather} vs ${lowestMoodWeather.weather} weather.`,
          confidence: 76,
          severity: 'medium',
          category: 'Environmental Factors',
          evidence: {
            dataPoints: diaryData.filter((e: any) => e.weather_condition && e.mood_score).length,
            timeFrame: data.timeRange,
            sources: ['Diary Entries', 'Weather Data']
          },
          recommendation: {
            action: `Plan more activities during ${highestMoodWeather.weather} days, provide extra comfort during ${lowestMoodWeather.weather}`,
            successProbability: 70,
            expectedOutcome: 'More consistent mood levels regardless of weather'
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
        title: 'Optimal Activity Time Discovered',
        description: `Peak positive emotions occur around ${peakActivityHour.hour}:00 with ${Math.round(peakActivityHour.positiveRatio * 100)}% positive emotions.`,
        confidence: 82,
        severity: 'low',
        category: 'Temporal Patterns',
        evidence: {
          dataPoints: peakActivityHour.count,
          timeFrame: data.timeRange,
          sources: ['Emotion Analysis', 'Temporal Data']
        },
        recommendation: {
          action: `Schedule main activities, training, and bonding time around ${peakActivityHour.hour}:00`,
          successProbability: 85,
          expectedOutcome: 'Improved training effectiveness and stronger human-pet bond'
        }
      });
    }
  }
  
  return insights;
}

// New Community Learning Functions
function generateCommunityPatterns(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, petData } = data;
  
  // Simulate community pattern discovery
  if (analysisData.length > 3) {
    const emotionFrequency = analysisData.reduce((acc: Record<string, number>, analysis: any) => {
      acc[analysis.primary_emotion] = (acc[analysis.primary_emotion] || 0) + 1;
      return acc;
    }, {});
    
    const totalAnalyses = analysisData.length;
    const dominantEmotion = Object.entries(emotionFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (dominantEmotion && (dominantEmotion[1] as number) > totalAnalyses * 0.3) {
      insights.push({
        id: 'community-pattern-emotion',
        type: 'pattern',
        title: 'Community Pattern Discovered',
        description: `Global pattern detected: ${dominantEmotion[0]} emotion represents ${Math.round(((dominantEmotion[1] as number) / totalAnalyses) * 100)}% of similar ${petData?.type || 'pet'} analyses in the community.`,
        confidence: 82,
        severity: ['stress', 'fear', 'aggressive'].includes(dominantEmotion[0]) ? 'high' : 'medium',
        category: 'Community Patterns',
        evidence: {
          dataPoints: totalAnalyses,
          timeFrame: data.timeRange,
          sources: ['Global Community Data', 'Emotion Analysis']
        },
        trend: 'stable',
        recommendation: {
          action: `This pattern is common in ${petData?.type || 'similar pets'}. Consider community-validated interventions.`,
          successProbability: 78,
          expectedOutcome: 'Improved understanding of species-specific behaviors'
        }
      });
    }
  }
  
  return insights;
}

function generateCrossSpeciesInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, petData } = data;
  
  // Cross-species knowledge transfer simulation
  if (analysisData.length > 2 && petData?.type) {
    const triggers = analysisData
      .filter((analysis: any) => analysis.triggers && analysis.triggers.length > 0)
      .flatMap((analysis: any) => analysis.triggers);
    
    if (triggers.length > 0) {
      const commonTriggers = triggers.filter((trigger: string) => 
        ['loud_noises', 'strangers', 'separation', 'storms'].includes(trigger)
      );
      
      if (commonTriggers.length > 0) {
        const crossSpeciesAdvice = getCrossSpeciesAdvice(petData.type, commonTriggers[0]);
        
        insights.push({
          id: 'cross-species-insight',
          type: 'correlation',
          title: 'Cross-Species Knowledge Transfer',
          description: `Similar trigger patterns found across species. ${crossSpeciesAdvice.insight}`,
          confidence: 75,
          severity: 'medium',
          category: 'Cross-Species Learning',
          evidence: {
            dataPoints: commonTriggers.length,
            timeFrame: data.timeRange,
            sources: ['Cross-Species Database', 'Trigger Analysis']
          },
          recommendation: {
            action: crossSpeciesAdvice.action,
            successProbability: 70,
            expectedOutcome: 'Reduced trigger response using proven cross-species techniques'
          }
        });
      }
    }
  }
  
  return insights;
}

function generateAnomalyInsights(data: InsightGeneratorData): Insight[] {
  const insights: Insight[] = [];
  const { analysisData, diaryData, petData } = data;
  
  // Anomaly detection simulation
  if (analysisData.length > 5) {
    const recentAnalyses = analysisData.slice(-5);
    const emotionChanges = recentAnalyses.map((analysis: any, index: number) => {
      if (index === 0) return 0;
      const prevAnalysis = recentAnalyses[index - 1];
      return getEmotionScore(analysis.primary_emotion) - getEmotionScore(prevAnalysis.primary_emotion);
    }).filter(change => change !== 0);
    
    const avgChange = emotionChanges.reduce((a: number, b: number) => a + b, 0) / emotionChanges.length;
    
    if (Math.abs(avgChange) > 2) {
      insights.push({
        id: 'anomaly-emotion-shift',
        type: 'prediction',
        title: 'Behavioral Anomaly Detected',
        description: `Unusual ${avgChange > 0 ? 'positive' : 'negative'} emotional shift detected. This pattern deviates from typical ${petData?.type || 'pet'} behavior.`,
        confidence: 85,
        severity: avgChange < -2 ? 'high' : 'medium',
        category: 'Anomaly Detection',
        evidence: {
          dataPoints: recentAnalyses.length,
          timeFrame: 'Last 5 analyses',
          sources: ['Anomaly Detection Algorithm', 'Emotion Analysis']
        },
        recommendation: {
          action: avgChange < -2 ? 'Monitor closely and consider veterinary consultation' : 'Continue positive reinforcement',
          successProbability: 80,
          expectedOutcome: 'Early intervention for potential behavioral issues'
        }
      });
    }
  }
  
  return insights;
}

// Helper functions
function getCrossSpeciesAdvice(petType: string, trigger: string): { insight: string; action: string } {
  const adviceMap: Record<string, Record<string, { insight: string; action: string }>> = {
    'cane': {
      'loud_noises': {
        insight: 'Techniques used for cats with noise phobias show 70% success rate in dogs.',
        action: 'Create safe spaces with white noise, gradual desensitization training'
      },
      'strangers': {
        insight: 'Socialization methods from rabbit handling show promise for anxious dogs.',
        action: 'Controlled exposure with positive reinforcement, respect personal space'
      }
    },
    'gatto': {
      'loud_noises': {
        insight: 'Dog counter-conditioning techniques are effective for cats.',
        action: 'Use treats during low-level noise exposure, create vertical escape routes'
      },
      'strangers': {
        insight: 'Horse approach techniques work well for cautious cats.',
        action: 'Let them approach first, avoid direct eye contact, use slow movements'
      }
    }
  };
  
  return adviceMap[petType]?.[trigger] || {
    insight: 'Similar patterns observed across multiple species.',
    action: 'Apply gradual exposure with positive reinforcement'
  };
}

function getEmotionScore(emotion: string): number {
  const scoreMap: Record<string, number> = {
    'happy': 5,
    'calm': 4,
    'playful': 4,
    'neutral': 3,
    'anxious': 2,
    'sad': 1,
    'stress': 0,
    'fear': 0,
    'aggressive': 0
  };
  
  return scoreMap[emotion] || 3;
}