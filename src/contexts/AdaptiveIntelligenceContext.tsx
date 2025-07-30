import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePets } from './PetContext';
import { supabase } from '@/integrations/supabase/client';
import { AdaptiveIntelligenceState, EmotionalDNA, AdaptiveInsight, AdaptationContext, AdaptiveRecommendation, BehaviorPattern } from '@/types/adaptiveIntelligence';

export interface AdaptiveIntelligenceContextType extends AdaptiveIntelligenceState {
  updateEmotionalDNA: () => Promise<void>;
  generateInsights: (category?: string) => Promise<void>;
  dismissInsight: (insightId: string) => void;
  getRecommendationsForComponent: (component: string) => AdaptiveRecommendation[];
  getInsightsForCategory: (category: string) => AdaptiveInsight[];
  refreshIntelligence: () => Promise<void>;
}

const AdaptiveIntelligenceContext = createContext<AdaptiveIntelligenceContextType | undefined>(undefined);

export const useAdaptiveIntelligence = () => {
  const context = useContext(AdaptiveIntelligenceContext);
  if (!context) {
    throw new Error('useAdaptiveIntelligence must be used within an AdaptiveIntelligenceProvider');
  }
  return context;
};

export const AdaptiveIntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedPet } = usePets();
  
  const [state, setState] = useState<AdaptiveIntelligenceState>({
    emotionalDNA: null,
    insights: [],
    recommendations: [],
    context: null,
    patterns: [],
    isLoading: false,
    lastUpdate: null,
  });

  const updateEmotionalDNA = async () => {
    if (!selectedPet) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const now = new Date();
      
      // Recupera analisi comportamentali recenti (ultimi 7 giorni)
      const { data: recentAnalyses } = await supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .eq('user_id', selectedPet.user_id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Recupera voci del diario recenti (ultimi 7 giorni)
      const { data: recentDiary } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .eq('user_id', selectedPet.user_id)
        .gte('entry_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      // Calcola DNA emotivo dai dati reali
      let calma = 50, energia = 50, focus = 50;
      let confidence = 0.3; // Base bassa se pochi dati

      if (recentAnalyses && recentAnalyses.length > 0) {
        // Analizza le emozioni dalle analisi comportamentali
        const emotionCounts = {
          calmo: 0, aggressivo: 0, ansioso: 0, felice: 0, 
          triste: 0, eccitato: 0, spaventato: 0
        };

        recentAnalyses.forEach(analysis => {
          if (analysis.primary_emotion && emotionCounts.hasOwnProperty(analysis.primary_emotion)) {
            emotionCounts[analysis.primary_emotion as keyof typeof emotionCounts]++;
          }
          // Aggiungi emozioni secondarie
          if (analysis.secondary_emotions) {
            Object.keys(analysis.secondary_emotions).forEach(emotion => {
              if (emotionCounts.hasOwnProperty(emotion)) {
                emotionCounts[emotion as keyof typeof emotionCounts] += 0.3;
              }
            });
          }
        });

        // Calcola calma (opposto di aggressivo/ansioso/spaventato)
        const negativeEmotions = emotionCounts.aggressivo + emotionCounts.ansioso + emotionCounts.spaventato;
        const positiveEmotions = emotionCounts.calmo + emotionCounts.felice;
        calma = Math.max(10, Math.min(90, 50 + (positiveEmotions - negativeEmotions) * 10));

        // Calcola energia (eccitato = alta energia, triste = bassa energia)
        energia = Math.max(10, Math.min(90, 50 + (emotionCounts.eccitato - emotionCounts.triste) * 15));

        confidence += recentAnalyses.length * 0.1; // Più analisi = più confidenza
      }

      if (recentDiary && recentDiary.length > 0) {
        // Usa mood_score dal diario per raffinare i calcoli
        const avgMoodScore = recentDiary.reduce((sum, entry) => 
          sum + (entry.mood_score || 5), 0) / recentDiary.length;
        
        // Influenza calma e energia dal mood score
        const moodInfluence = (avgMoodScore - 5) * 8; // mood 1-10 -> influenza -32 a +40
        calma = Math.max(10, Math.min(90, calma + moodInfluence));
        energia = Math.max(10, Math.min(90, energia + moodInfluence * 0.7));

        // Analizza behavioral_tags per il focus
        const allTags = recentDiary.flatMap(entry => entry.behavioral_tags || []);
        const focusImpactingTags = {
          'distratto': -15, 'agitato': -10, 'ansioso': -12,
          'calmo': +10, 'concentrato': +15, 'attento': +12
        };
        
        let focusAdjustment = 0;
        allTags.forEach(tag => {
          if (focusImpactingTags[tag as keyof typeof focusImpactingTags]) {
            focusAdjustment += focusImpactingTags[tag as keyof typeof focusImpactingTags];
          }
        });
        focus = Math.max(10, Math.min(90, focus + focusAdjustment / Math.max(1, allTags.length) * 20));

        confidence += recentDiary.length * 0.05; // Contributo del diario
      }

      // Limita confidence tra 0.1 e 0.95
      confidence = Math.max(0.1, Math.min(0.95, confidence));

      const realDNA: EmotionalDNA = {
        calma: Math.round(calma),
        energia: Math.round(energia),
        focus: Math.round(focus),
        lastUpdated: now,
        confidence: Math.round(confidence * 100) / 100
      };

      console.log('DNA Emotivo calcolato dai dati reali:', realDNA, {
        analysesCount: recentAnalyses?.length || 0,
        diaryCount: recentDiary?.length || 0
      });

      setState(prev => ({
        ...prev,
        emotionalDNA: realDNA,
        lastUpdate: now,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating emotional DNA:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const generateAdaptationContext = (): AdaptationContext => {
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else if (hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      currentMood: state.emotionalDNA?.calma > 60 ? 'calm' : 'agitated',
      stressLevel: 100 - (state.emotionalDNA?.calma || 50),
      activityLevel: state.emotionalDNA?.energia || 50,
      timeOfDay,
      recentPatterns: ['eating_regularly', 'sleeping_well'],
      environmentalFactors: {
        season: 'winter',
        dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
      }
    };
  };

  const generateInsights = async (category?: string) => {
    if (!selectedPet || !state.emotionalDNA) return;

    const context = generateAdaptationContext();
    const newInsights: AdaptiveInsight[] = [];

    // Dashboard insights - SOGLIE MODIFICATE per mostrare più insights
    if (!category || category === 'dashboard') {
      if (state.emotionalDNA.energia < 60) { // Era 40, ora 60
        newInsights.push({
          id: `insight-energy-${Date.now()}`,
          type: 'recommendation',
          category: 'dashboard',
          title: 'Energia moderata rilevata',
          description: `${selectedPet.name} mostra livelli di energia moderati (${state.emotionalDNA.energia}%). Considera attività stimolanti.`,
          actionable: true,
          priority: 'medium',
          confidence: 0.8,
          data: { suggestedActivities: ['gioco', 'passeggiata', 'training'] }
        });
      } else if (state.emotionalDNA.energia > 80) { // NUOVO: Alta energia
        newInsights.push({
          id: `insight-high-energy-${Date.now()}`,
          type: 'suggestion',
          category: 'dashboard',
          title: 'Alta energia rilevata',
          description: `${selectedPet.name} ha molta energia (${state.emotionalDNA.energia}%). Ottimo momento per attività intense!`,
          actionable: true,
          priority: 'low',
          confidence: 0.9,
          data: { suggestedActivities: ['corsa', 'giochi intensi', 'addestramento avanzato'] }
        });
      }

      if (state.emotionalDNA.calma < 60) { // Era 40, ora 60
        newInsights.push({
          id: `insight-stress-${Date.now()}`,
          type: 'warning',
          category: 'dashboard',
          title: 'Livelli di stress moderati',
          description: `${selectedPet.name} potrebbe beneficiare di attività rilassanti. La musicoterapia potrebbe aiutare.`,
          actionable: true,
          priority: 'medium',
          confidence: 0.8,
          data: { recommendedAction: 'music_therapy' }
        });
      } else if (state.emotionalDNA.calma > 85) { // NUOVO: Alta calma
        newInsights.push({
          id: `insight-very-calm-${Date.now()}`,
          type: 'optimization',
          category: 'dashboard',
          title: 'Ottimo stato di calma',
          description: `${selectedPet.name} è molto sereno (${state.emotionalDNA.calma}%). Perfetto per nuovi apprendimenti!`,
          actionable: true,
          priority: 'low',
          confidence: 0.9,
          data: { recommendedAction: 'new_training' }
        });
      }

      if (state.emotionalDNA.focus > 85) { // NUOVO: Alto focus
        newInsights.push({
          id: `insight-high-focus-${Date.now()}`,
          type: 'optimization',
          category: 'dashboard',
          title: 'Focus eccellente',
          description: `${selectedPet.name} è molto concentrato (${state.emotionalDNA.focus}%). Momento ideale per training complessi!`,
          actionable: true,
          priority: 'low',
          confidence: 0.9,
          data: { recommendedAction: 'advanced_training' }
        });
      } else if (state.emotionalDNA.focus < 60) { // Era 50, ora 60
        newInsights.push({
          id: `insight-low-focus-${Date.now()}`,
          type: 'suggestion',
          category: 'dashboard',
          title: 'Focus da migliorare',
          description: `${selectedPet.name} potrebbe essere distratto. Prova sessioni brevi e frequenti.`,
          actionable: true,
          priority: 'medium',
          confidence: 0.7,
        });
      }

      // Insight basato sui dati disponibili
      if (state.emotionalDNA.confidence > 0.7) {
        newInsights.push({
          id: `insight-data-quality-${Date.now()}`,
          type: 'optimization',
          category: 'dashboard',
          title: 'Profilo comportamentale completo',
          description: `Abbiamo dati sufficienti per analisi accurate (${Math.round(state.emotionalDNA.confidence * 100)}% confidenza).`,
          actionable: false,
          priority: 'low',
          confidence: state.emotionalDNA.confidence,
        });
      }
    }

    // Calendar insights
    if (!category || category === 'calendar') {
      if (context.timeOfDay === 'morning' && state.emotionalDNA.energia > 60) {
        newInsights.push({
          id: `insight-calendar-${Date.now()}`,
          type: 'suggestion',
          category: 'calendar',
          title: 'Momento ottimale per training',
          description: 'Energia alta al mattino - ideale per sessioni di addestramento',
          actionable: true,
          priority: 'medium',
          confidence: 0.7,
        });
      }
    }

    // Training insights
    if (!category || category === 'training') {
      if (state.emotionalDNA.focus < 50) {
        newInsights.push({
          id: `insight-training-${Date.now()}`,
          type: 'optimization',
          category: 'training',
          title: 'Riduci intensità training',
          description: 'Focus basso rilevato - sessioni più brevi e frequenti',
          actionable: true,
          priority: 'medium',
          confidence: 0.75,
        });
      }
    }

    setState(prev => ({
      ...prev,
      insights: [...prev.insights.filter(i => !i.expiresAt || i.expiresAt > new Date()), ...newInsights],
      context,
    }));
  };

  const dismissInsight = (insightId: string) => {
    setState(prev => ({
      ...prev,
      insights: prev.insights.filter(insight => insight.id !== insightId)
    }));
  };

  const getRecommendationsForComponent = (component: string): AdaptiveRecommendation[] => {
    return state.recommendations.filter(rec => rec.component === component);
  };

  const getInsightsForCategory = (category: string): AdaptiveInsight[] => {
    return state.insights.filter(insight => insight.category === category);
  };

  const refreshIntelligence = async () => {
    await updateEmotionalDNA();
    await generateInsights();
  };

  // Auto-refresh ogni 5 minuti se c'è un pet selezionato
  useEffect(() => {
    if (!selectedPet) {
      // Pulisce i dati quando non c'è pet selezionato
      setState(prev => ({
        ...prev,
        emotionalDNA: null,
        insights: [],
        recommendations: [],
        context: null,
        patterns: [],
        lastUpdate: null,
      }));
      return;
    }

    // Reset degli insights quando cambia pet per evitare dati misti
    setState(prev => ({
      ...prev,
      insights: [],
      isLoading: true
    }));

    console.log('Pet cambiato, aggiornamento insights per:', selectedPet.name);
    refreshIntelligence();
    
    const interval = setInterval(() => {
      refreshIntelligence();
    }, 5 * 60 * 1000); // 5 minuti

    return () => clearInterval(interval);
  }, [selectedPet]);

  // Genera insights quando il DNA emotivo cambia
  useEffect(() => {
    if (state.emotionalDNA) {
      generateInsights();
    }
  }, [state.emotionalDNA]);

  return (
    <AdaptiveIntelligenceContext.Provider value={{
      ...state,
      updateEmotionalDNA,
      generateInsights,
      dismissInsight,
      getRecommendationsForComponent,
      getInsightsForCategory,
      refreshIntelligence,
    }}>
      {children}
    </AdaptiveIntelligenceContext.Provider>
  );
};