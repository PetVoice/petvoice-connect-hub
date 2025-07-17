import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface Analysis {
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: any;
  created_at: string;
}

export interface PlaylistRecommendation {
  name: string;
  description: string;
  frequency: string;
  duration: number;
  tracks: string[];
  priority: 'high' | 'medium' | 'low';
  source: 'emotional_analysis' | 'weather' | 'combined';
  reasoning: string;
}

export const usePlaylistRecommendations = (petId?: string) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<PlaylistRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async (weatherData?: WeatherData) => {
    if (!user || !petId) return;

    setLoading(true);
    try {
      // Fetch recent emotional analyses
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('primary_emotion, primary_confidence, secondary_emotions, created_at')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(5);

      const newRecommendations: PlaylistRecommendation[] = [];

      // 1. Raccomandazioni basate sull'analisi emotiva (priorità alta)
      if (analyses && analyses.length > 0) {
        const latestAnalysis = analyses[0];
        const emotionalPlaylist = generateEmotionalPlaylist(latestAnalysis);
        if (emotionalPlaylist) {
          newRecommendations.push({
            ...emotionalPlaylist,
            priority: 'high',
            source: 'emotional_analysis'
          });
        }
      }

      // 2. Raccomandazioni basate sul meteo (priorità media)
      if (weatherData) {
        const weatherPlaylist = generateWeatherPlaylist(weatherData);
        if (weatherPlaylist) {
          newRecommendations.push({
            ...weatherPlaylist,
            priority: 'medium',
            source: 'weather'
          });
        }
      }

      // 3. Raccomandazioni combinate (priorità alta se entrambi i dati sono disponibili)
      if (analyses && analyses.length > 0 && weatherData) {
        const combinedPlaylist = generateCombinedPlaylist(analyses[0], weatherData);
        if (combinedPlaylist) {
          newRecommendations.push({
            ...combinedPlaylist,
            priority: 'high',
            source: 'combined'
          });
        }
      }

      // Ordina per priorità e rimuovi duplicati
      const sortedRecommendations = newRecommendations
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 3); // Massimo 3 raccomandazioni

      setRecommendations(sortedRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmotionalPlaylist = (analysis: Analysis): Omit<PlaylistRecommendation, 'priority' | 'source'> | null => {
    const emotion = analysis.primary_emotion.toLowerCase();
    
    switch (emotion) {
      case 'ansioso':
      case 'stressato':
        return {
          name: "Calma Profonda",
          description: "Frequenze specifiche per ridurre ansia e stress basate sull'analisi emotiva",
          frequency: "528Hz + 8Hz",
          duration: 25,
          tracks: ["Healing Waves", "Stress Relief", "Deep Calm"],
          reasoning: `Rilevato stato di ${emotion} con confidenza ${(analysis.primary_confidence * 100).toFixed(0)}%`
        };

      case 'agitato':
      case 'iperattivo':
        return {
          name: "Relax Guidato", 
          description: "Sequenze per calmare l'iperattivazione basate sul profilo emotivo",
          frequency: "10-13Hz",
          duration: 20,
          tracks: ["Gentle Waves", "Calming Nature", "Peaceful Mind"],
          reasoning: `Stato di agitazione rilevato - necessario rilassamento graduale`
        };

      case 'triste':
      case 'depresso':
        return {
          name: "Energia Positiva",
          description: "Stimolazione dolce per migliorare l'umore",
          frequency: "40Hz + 10Hz", 
          duration: 15,
          tracks: ["Uplifting Vibes", "Positive Energy", "Mood Boost"],
          reasoning: `Umore basso rilevato - stimolazione energetica necessaria`
        };

      case 'felice':
      case 'giocoso':
        return {
          name: "Mantenimento Benessere",
          description: "Frequenze per mantenere lo stato positivo",
          frequency: "40Hz",
          duration: 10,
          tracks: ["Happy Harmonics", "Joyful Rhythms", "Wellness Maintain"],
          reasoning: `Stato emotivo positivo - consolidamento del benessere`
        };

      default:
        return {
          name: "Equilibrio Generale",
          description: "Sessione bilanciata per stabilità emotiva",
          frequency: "528Hz + 10Hz",
          duration: 15,
          tracks: ["Balanced Mind", "Emotional Harmony", "Stable Vibes"],
          reasoning: `Stato emotivo neutro - mantenimento equilibrio`
        };
    }
  };

  const generateWeatherPlaylist = (weather: WeatherData): Omit<PlaylistRecommendation, 'priority' | 'source'> | null => {
    const { temperature, condition, humidity } = weather;

    if (temperature > 28) {
      return {
        name: "Refrigerio Sonoro",
        description: "Frequenze rinfrescanti per giornate calde",
        frequency: "528Hz + 6Hz",
        duration: 20,
        tracks: ["Cool Breeze", "Summer Relief", "Fresh Air"],
        reasoning: `Temperatura elevata (${temperature}°C) - necessario effetto rinfrescante`
      };
    }

    if (temperature < 10) {
      return {
        name: "Calore Interno",
        description: "Vibrazioni calde per contrastare il freddo",
        frequency: "40Hz + 12Hz",
        duration: 25,
        tracks: ["Warm Embrace", "Cozy Vibes", "Inner Heat"],
        reasoning: `Bassa temperatura (${temperature}°C) - stimolazione del calore interno`
      };
    }

    if (condition.includes('rain') || humidity > 80) {
      return {
        name: "Serenità Piovosa",
        description: "Armonie per giornate umide e piovose",
        frequency: "10-13Hz",
        duration: 30,
        tracks: ["Rain Meditation", "Humid Calm", "Stormy Peace"],
        reasoning: `Condizioni umide/piovose - promozione della calma interiore`
      };
    }

    return null;
  };

  const generateCombinedPlaylist = (analysis: Analysis, weather: WeatherData): Omit<PlaylistRecommendation, 'priority' | 'source'> | null => {
    const emotion = analysis.primary_emotion.toLowerCase();
    const { temperature, condition } = weather;

    // Combinazioni specifiche
    if ((emotion === 'ansioso' || emotion === 'stressato') && temperature > 25) {
      return {
        name: "Calma Estiva",
        description: "Trattamento combinato per ansia e caldo eccessivo",
        frequency: "528Hz + 4Hz",
        duration: 30,
        tracks: ["Summer Zen", "Cool Anxiety Relief", "Heat Stress Therapy"],
        reasoning: `Ansia rilevata + alta temperatura (${temperature}°C) - doppio effetto calmante`
      };
    }

    if ((emotion === 'triste' || emotion === 'depresso') && (condition.includes('rain') || temperature < 15)) {
      return {
        name: "Luce nell'Ombra",
        description: "Energia positiva per contrastare tristezza e tempo grigio",
        frequency: "40Hz + 15Hz",
        duration: 25,
        tracks: ["Sunshine Therapy", "Mood Weather Shield", "Inner Light"],
        reasoning: `Umore basso + condizioni climatiche sfavorevoli - stimolazione energetica potenziata`
      };
    }

    if ((emotion === 'felice' || emotion === 'giocoso') && temperature > 20 && temperature < 26) {
      return {
        name: "Perfetto Equilibrio",
        description: "Consolidamento del benessere in condizioni climatiche ideali",
        frequency: "528Hz + 8Hz",
        duration: 15,
        tracks: ["Perfect Day", "Optimal Harmony", "Peak Wellness"],
        reasoning: `Stato emotivo positivo + clima ideale - massimizzazione del benessere`
      };
    }

    return null;
  };

  return {
    recommendations,
    loading,
    generateRecommendations
  };
};