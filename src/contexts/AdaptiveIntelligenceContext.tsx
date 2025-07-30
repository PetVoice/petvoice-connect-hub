import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePets } from './PetContext';
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
      // Simula calcolo DNA emotivo basato sui dati reali
      const now = new Date();
      const mockDNA: EmotionalDNA = {
        calma: Math.floor(Math.random() * 40) + 30, // 30-70
        energia: Math.floor(Math.random() * 40) + 40, // 40-80  
        focus: Math.floor(Math.random() * 30) + 50, // 50-80
        lastUpdated: now,
        confidence: 0.85
      };

      setState(prev => ({
        ...prev,
        emotionalDNA: mockDNA,
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

    // Dashboard insights
    if (!category || category === 'dashboard') {
      if (state.emotionalDNA.energia < 40) {
        newInsights.push({
          id: `insight-energy-${Date.now()}`,
          type: 'recommendation',
          category: 'dashboard',
          title: 'Bassa energia rilevata',
          description: `${selectedPet.name} mostra livelli di energia bassi (${state.emotionalDNA.energia}%). Considera attività stimolanti.`,
          actionable: true,
          priority: 'medium',
          confidence: 0.8,
          data: { suggestedActivities: ['gioco', 'passeggiata', 'training'] }
        });
      }

      if (state.emotionalDNA.calma < 40) {
        newInsights.push({
          id: `insight-stress-${Date.now()}`,
          type: 'warning',
          category: 'dashboard',
          title: 'Livelli di stress elevati',
          description: `${selectedPet.name} sembra stressato. La musicoterapia potrebbe aiutare.`,
          actionable: true,
          priority: 'high',
          confidence: 0.9,
          data: { recommendedAction: 'music_therapy' }
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
    if (!selectedPet) return;

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