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
  
  // Pattern Recognition Insights
  insights.push(...generatePatternInsights(data));
  
  // Behavioral Predictions
  insights.push(...generatePredictionInsights(data));
  
  // Intervention Suggestions
  insights.push(...generateInterventionInsights(data));
  
  // Correlation Discoveries
  insights.push(...generateCorrelationInsights(data));
  
  return insights.sort((a, b) => {
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
  const { analysisData, diaryData, healthData } = data;
  
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
  const { analysisData, diaryData, petData } = data;
  
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
  const { analysisData, diaryData } = data;
  
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