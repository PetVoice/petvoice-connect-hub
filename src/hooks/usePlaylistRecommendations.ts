import { useState, useEffect, useCallback } from 'react';
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
  const [lastGeneratedFor, setLastGeneratedFor] = useState<string>('');

  const generateRecommendations = useCallback(async (weatherData?: WeatherData) => {
    if (!user || !petId) return;

    // Evita rigenerazioni multiple per lo stesso pet/weather
    const cacheKey = `${petId}-${weatherData?.temperature || 'no-weather'}`;
    if (cacheKey === lastGeneratedFor && recommendations.length > 0) {
      return;
    }

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
      setLastGeneratedFor(cacheKey);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, petId, lastGeneratedFor, recommendations.length]);

  const generateEmotionalPlaylist = (analysis: Analysis): Omit<PlaylistRecommendation, 'priority' | 'source'> | null => {
    const emotion = analysis.primary_emotion.toLowerCase();
    
    // Solo emozioni negative richiedono playlist terapeutiche
    switch (emotion) {
      case 'ansioso':
        return {
          name: "Calma Profonda",
          description: "Frequenze specifiche per ridurre ansia basate sull'analisi emotiva",
          frequency: "528Hz + 8Hz",
          duration: 25,
          tracks: ["Healing Waves", "Anxiety Relief", "Deep Calm"],
          reasoning: `Rilevato stato di ansia con confidenza ${(analysis.primary_confidence * 100).toFixed(0)}%`
        };

      case 'stressato':
        return {
          name: "Anti-Stress",
          description: "Terapia per stress cronico e tensione accumulata",
          frequency: "528Hz + 6Hz", 
          duration: 30,
          tracks: ["Stress Relief", "Tension Release", "Recovery Sounds"],
          reasoning: `Rilevato stress acuto con confidenza ${(analysis.primary_confidence * 100).toFixed(0)}%`
        };

      case 'agitato':
      case 'iperattivo':
        return {
          name: "Relax Guidato", 
          description: "Sequenze per calmare iperattivazione basate sul profilo emotivo",
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

      case 'aggressivo':
        return {
          name: "Calma e Controllo",
          description: "Frequenze per ridurre aggressività e irritabilità",
          frequency: "432Hz + 8Hz",
          duration: 20,
          tracks: ["Peaceful Control", "Anger Release", "Calm Strength"],
          reasoning: `Comportamento aggressivo rilevato - necessario calmare`
        };

      case 'pauroso':
      case 'spaventato':
        return {
          name: "Sicurezza Interiore",
          description: "Frequenze protettive per animali paurosi e insicuri",
          frequency: "111Hz + 8Hz",
          duration: 25,
          tracks: ["Security Shield", "Fear Relief", "Inner Strength"],
          reasoning: `Paura rilevata - necessario supporto emotivo e sicurezza`
        };

      // Non generiamo raccomandazioni per emozioni positive
      case 'felice':
      case 'giocoso':
      case 'calmo':
      case 'rilassato':
      default:
        return null; // Nessuna raccomandazione per emozioni positive
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

    // Solo combinazioni per emozioni negative e condizioni meteorologiche sfavorevoli
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

    if ((emotion === 'aggressivo') && temperature > 25) {
      return {
        name: "Controllo del Calore",
        description: "Gestione dell'aggressività intensificata dal caldo",
        frequency: "432Hz + 6Hz",
        duration: 25,
        tracks: ["Cool Temper", "Heat Anger Relief", "Calm Control"],
        reasoning: `Aggressività + caldo eccessivo - controllo dell'irritabilità`
      };
    }

    // Non generiamo raccomandazioni combinate per emozioni positive
    return null;
  };

  return {
    recommendations,
    loading,
    generateRecommendations
  };
};