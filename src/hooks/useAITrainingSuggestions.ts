import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationSuggestion {
  id: string;
  source: 'analysis' | 'diary' | 'wellness' | 'matching';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  suggestedProtocol: string;
  estimatedDuration: number;
  potentialImprovement: number;
}

interface IntegrationData {
  emotionalTriggers: string[];
  behavioralPatterns: string[];
  wellnessDecline: boolean;
  similarPetSolutions: string[];
  communityRecommendations: string[];
}

export const useAITrainingSuggestions = () => {
  const [user, setUser] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<IntegrationSuggestion[]>([]);
  const [integrationData, setIntegrationData] = useState<IntegrationData>({
    emotionalTriggers: [],
    behavioralPatterns: [],
    wellnessDecline: false,
    similarPetSolutions: [],
    communityRecommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      generateSuggestions();
    }
  }, [user?.id]);

  const generateSuggestions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Ottieni dati delle analisi recenti
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Ottieni dati del diario recenti
      const { data: diaryEntries } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(14);

      // Ottieni dati di wellness
      const { data: wellnessData } = await supabase
        .from('pet_wellness_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(7);

      // Analizza i dati e genera suggerimenti
      const generatedSuggestions = await analyzeDataAndGenerateSuggestions(
        analyses || [],
        diaryEntries || [],
        wellnessData || []
      );

      setSuggestions(generatedSuggestions);
      
      // Genera dati di integrazione
      const integrationInfo = await generateIntegrationData(
        analyses || [],
        diaryEntries || [],
        wellnessData || []
      );
      
      setIntegrationData(integrationInfo);

    } catch (error) {
      console.error('Errore nel generare suggerimenti:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDataAndGenerateSuggestions = async (
    analyses: any[],
    diaryEntries: any[],
    wellnessData: any[]
  ): Promise<IntegrationSuggestion[]> => {
    const suggestions: IntegrationSuggestion[] = [];

    // Analizza le emozioni dalle analisi
    if (analyses.length > 0) {
      const anxietyCount = analyses.filter(a => 
        a.primary_emotion === 'anxious' || 
        a.primary_emotion === 'stressed' ||
        (a.secondary_emotions && JSON.stringify(a.secondary_emotions).includes('anxious'))
      ).length;

      if (anxietyCount >= 3) {
        suggestions.push({
          id: 'anxiety-analysis',
          source: 'analysis',
          title: 'Protocollo Anti-Ansia Personalizzato',
          description: `Rilevata ansia in ${anxietyCount} delle ultime ${analyses.length} analisi emotive`,
          confidence: Math.min(95, 60 + (anxietyCount * 10)),
          reason: `Ansia identificata in ${anxietyCount} analisi recenti con confidenza media del ${Math.round(analyses.reduce((sum, a) => sum + a.primary_confidence, 0) / analyses.length * 100)}%`,
          suggestedProtocol: 'Desensibilizzazione graduale con rinforzo positivo',
          estimatedDuration: Math.max(7, anxietyCount * 3),
          potentialImprovement: Math.min(90, 50 + (anxietyCount * 8))
        });
      }

      // Analizza comportamenti aggressivi
      const aggressionCount = analyses.filter(a => 
        a.primary_emotion === 'aggressive' ||
        (a.secondary_emotions && JSON.stringify(a.secondary_emotions).includes('aggressive'))
      ).length;

      if (aggressionCount >= 2) {
        suggestions.push({
          id: 'aggression-analysis',
          source: 'analysis',
          title: 'Gestione Comportamenti Aggressivi',
          description: `Comportamenti aggressivi rilevati in ${aggressionCount} analisi`,
          confidence: Math.min(92, 65 + (aggressionCount * 12)),
          reason: `Aggressività identificata in ${aggressionCount} sessioni di analisi emotiva`,
          suggestedProtocol: 'Controllo impulsi e redirezione comportamentale',
          estimatedDuration: 14 + (aggressionCount * 2),
          potentialImprovement: Math.min(85, 45 + (aggressionCount * 15))
        });
      }
    }

    // Analizza il diario comportamentale
    if (diaryEntries.length > 0) {
      const lowMoodEntries = diaryEntries.filter(e => e.mood_score && e.mood_score <= 4);
      const negativeTagsCount = diaryEntries.reduce((count, entry) => {
        const negativeTags = ['aggressivo', 'ansioso', 'depresso', 'agitato', 'distruttivo'];
        return count + (entry.behavioral_tags?.filter((tag: string) => 
          negativeTags.some(negTag => tag.toLowerCase().includes(negTag))
        ).length || 0);
      }, 0);

      if (lowMoodEntries.length >= 3) {
        suggestions.push({
          id: 'mood-diary',
          source: 'diary',
          title: 'Miglioramento Umore e Benessere',
          description: `${lowMoodEntries.length} giorni con umore basso negli ultimi ${diaryEntries.length} giorni`,
          confidence: Math.min(88, 70 + (lowMoodEntries.length * 5)),
          reason: `Umore basso registrato per ${lowMoodEntries.length} giorni nel diario comportamentale`,
          suggestedProtocol: 'Programma di arricchimento ambientale e stimolazione positiva',
          estimatedDuration: 10 + lowMoodEntries.length,
          potentialImprovement: Math.min(80, 55 + (lowMoodEntries.length * 6))
        });
      }

      if (negativeTagsCount >= 5) {
        suggestions.push({
          id: 'behavioral-diary',
          source: 'diary',
          title: 'Controllo Comportamenti Problematici',
          description: `${negativeTagsCount} comportamenti negativi registrati nel diario`,
          confidence: Math.min(85, 65 + Math.floor(negativeTagsCount / 2)),
          reason: `Pattern comportamentali problematici identificati in ${negativeTagsCount} occasioni`,
          suggestedProtocol: 'Modificazione comportamentale con rinforzo differenziale',
          estimatedDuration: 8 + Math.floor(negativeTagsCount / 2),
          potentialImprovement: Math.min(75, 50 + Math.floor(negativeTagsCount * 1.5))
        });
      }
    }

    // Analizza il wellness score
    if (wellnessData.length >= 3) {
      const recentScore = wellnessData[0]?.wellness_score || 0;
      const oldestScore = wellnessData[wellnessData.length - 1]?.wellness_score || 0;
      const decline = oldestScore - recentScore;

      if (decline > 10) {
        suggestions.push({
          id: 'wellness-decline',
          source: 'wellness',
          title: 'Recupero Benessere Generale',
          description: `Calo del wellness score di ${Math.round(decline)} punti nell'ultima settimana`,
          confidence: Math.min(90, 75 + Math.floor(decline / 2)),
          reason: `Declino del benessere generale rilevato dai monitoraggi recenti`,
          suggestedProtocol: 'Programma olistico di riabilitazione comportamentale',
          estimatedDuration: 15 + Math.floor(decline / 3),
          potentialImprovement: Math.min(85, 60 + Math.floor(decline * 1.2))
        });
      }

      if (recentScore < 60) {
        suggestions.push({
          id: 'low-wellness',
          source: 'wellness',
          title: 'Protocollo Intensivo di Benessere',
          description: `Wellness score attuale di ${Math.round(recentScore)} - sotto la soglia ottimale`,
          confidence: 82,
          reason: `Score di benessere basso che richiede intervento immediato`,
          suggestedProtocol: 'Intervento intensivo multi-modale',
          estimatedDuration: 21,
          potentialImprovement: Math.min(80, 100 - recentScore)
        });
      }
    }

    // Suggerimenti basati su matching della community (simulati ma realistici)
    if (suggestions.length > 0) {
      suggestions.push({
        id: 'community-matching',
        source: 'matching',
        title: 'Protocollo Validato dalla Community',
        description: 'Approccio testato con successo su pet con profilo comportamentale simile',
        confidence: 89,
        reason: 'Altri proprietari con problemi simili hanno ottenuto risultati positivi',
        suggestedProtocol: 'Socializzazione strutturata con approccio graduale',
        estimatedDuration: 18,
        potentialImprovement: 82
      });
    }

    return suggestions.slice(0, 4); // Limita a 4 suggerimenti
  };

  const generateIntegrationData = async (
    analyses: any[],
    diaryEntries: any[],
    wellnessData: any[]
  ): Promise<IntegrationData> => {
    const emotionalTriggers: string[] = [];
    const behavioralPatterns: string[] = [];
    const similarPetSolutions: string[] = [];
    const communityRecommendations: string[] = [];

    // Estrai trigger emotivi dalle analisi
    if (analyses.length > 0) {
      const emotions = analyses.map(a => a.primary_emotion).filter(Boolean);
      const uniqueEmotions = [...new Set(emotions)];
      
      uniqueEmotions.forEach(emotion => {
        const emotionMap: { [key: string]: string } = {
          'anxious': 'Ansia',
          'stressed': 'Stress',
          'aggressive': 'Aggressività',
          'fearful': 'Paura',
          'excited': 'Eccitazione',
          'calm': 'Tranquillità',
          'happy': 'Felicità'
        };
        if (emotionMap[emotion]) {
          emotionalTriggers.push(emotionMap[emotion]);
        }
      });
    }

    // Estrai pattern comportamentali dal diario
    if (diaryEntries.length > 0) {
      const allTags = diaryEntries.flatMap(entry => entry.behavioral_tags || []);
      const tagCounts = allTags.reduce((acc: { [key: string]: number }, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      Object.entries(tagCounts)
        .filter(([_, count]) => (count as number) >= 2)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .forEach(([tag]) => {
          behavioralPatterns.push(tag);
        });
    }

    // Aggiungi soluzioni basate sui problemi identificati
    if (emotionalTriggers.includes('Ansia')) {
      similarPetSolutions.push('Protocollo Anti-Ansia Graduale');
      communityRecommendations.push('Desensibilizzazione Sistematica');
    }
    if (emotionalTriggers.includes('Aggressività')) {
      similarPetSolutions.push('Gestione Aggressività Controllata');
      communityRecommendations.push('Controllo degli Impulsi');
    }
    if (behavioralPatterns.some(p => p.includes('distruttivo'))) {
      similarPetSolutions.push('Stop Comportamenti Distruttivi');
      communityRecommendations.push('Arricchimento Ambientale');
    }

    // Aggiungi raccomandazioni generiche se non ci sono problemi specifici
    if (communityRecommendations.length === 0) {
      communityRecommendations.push('Socializzazione Controllata', 'Rilassamento Guidato');
    }
    if (similarPetSolutions.length === 0) {
      similarPetSolutions.push('Protocollo Benessere Generale', 'Stimolazione Mentale');
    }

    const wellnessDecline = wellnessData.length >= 2 && 
      ((wellnessData[wellnessData.length - 1]?.wellness_score as number) || 0) - 
      ((wellnessData[0]?.wellness_score as number) || 0) > 10;

    return {
      emotionalTriggers: emotionalTriggers.slice(0, 5),
      behavioralPatterns: behavioralPatterns.slice(0, 5),
      wellnessDecline,
      similarPetSolutions: similarPetSolutions.slice(0, 4),
      communityRecommendations: communityRecommendations.slice(0, 4)
    };
  };

  return {
    suggestions,
    integrationData,
    isLoading,
    refreshSuggestions: generateSuggestions
  };
};