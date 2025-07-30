export interface EmotionalDNA {
  calma: number;
  energia: number;
  focus: number;
  lastUpdated: Date;
  confidence: number;
}

export interface AdaptiveInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'suggestion' | 'optimization';
  category: 'dashboard' | 'calendar' | 'diary' | 'training' | 'analysis' | 'music';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  expiresAt?: Date;
  data?: any;
}

export interface AdaptationContext {
  currentMood: string;
  stressLevel: number;
  activityLevel: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  recentPatterns: string[];
  environmentalFactors: {
    weather?: string;
    season: string;
    dayOfWeek: string;
  };
}

export interface AdaptiveRecommendation {
  id: string;
  component: string;
  recommendation: string;
  reasoning: string;
  confidence: number;
  estimatedImpact: 'low' | 'medium' | 'high';
  implementationComplexity: 'easy' | 'medium' | 'complex';
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  lastOccurrence: Date;
  triggers: string[];
  outcomes: string[];
  predictiveValue: number;
}

export interface AdaptiveIntelligenceState {
  emotionalDNA: EmotionalDNA | null;
  insights: AdaptiveInsight[];
  recommendations: AdaptiveRecommendation[];
  context: AdaptationContext | null;
  patterns: BehaviorPattern[];
  isLoading: boolean;
  lastUpdate: Date | null;
}