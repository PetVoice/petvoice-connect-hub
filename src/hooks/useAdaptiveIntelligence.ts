import { useAdaptiveIntelligence } from '@/contexts/AdaptiveIntelligenceContext';

// Re-export the main hook from context for convenience
export { useAdaptiveIntelligence } from '@/contexts/AdaptiveIntelligenceContext';

// Additional utility hooks for specific use cases
export const useAdaptiveRecommendations = (component: string) => {
  const context = useAdaptiveIntelligence();
  
  return {
    recommendations: context.getRecommendationsForComponent(component),
    refresh: () => context.generateInsights(),
  };
};

export const useAdaptiveInsights = (category: string) => {
  const context = useAdaptiveIntelligence();
  
  return {
    insights: context.getInsightsForCategory(category),
    dismiss: context.dismissInsight,
    refresh: () => context.generateInsights(category),
  };
};

export const useEmotionalDNA = () => {
  const context = useAdaptiveIntelligence();
  
  return {
    emotionalDNA: context.emotionalDNA,
    isLoading: context.isLoading,
    lastUpdate: context.lastUpdate,
    refresh: context.updateEmotionalDNA,
  };
};