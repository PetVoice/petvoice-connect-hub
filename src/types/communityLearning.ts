export interface CommunityPattern {
  id: string;
  pattern_type: 'behavioral' | 'health' | 'seasonal' | 'cross_species';
  species_affected: string[];
  pattern_data: Record<string, any>;
  confidence_score: number;
  sample_size: number;
  discovery_date: string;
  validation_status: 'pending' | 'validated' | 'rejected';
  validation_count: number;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CrossSpeciesInsight {
  id: string;
  source_species: string;
  target_species: string;
  insight_type: 'behavioral' | 'health' | 'training' | 'nutrition';
  insight_data: Record<string, any>;
  applicability_score: number;
  evidence_strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  community_votes: number;
  expert_validated: boolean;
  related_patterns: string[];
  created_at: string;
  updated_at: string;
}

export interface AnonymousBenchmark {
  id: string;
  benchmark_type: 'wellness' | 'behavior' | 'training' | 'health';
  species: string;
  age_range?: string;
  region_code?: string;
  metric_name: string;
  percentile_data: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  sample_size: number;
  last_updated: string;
  data_period: 'weekly' | 'monthly' | 'quarterly';
  metadata: Record<string, any>;
  created_at: string;
}

export interface CommunityTrend {
  id: string;
  trend_type: 'rising' | 'declining' | 'seasonal' | 'emerging';
  category: 'health' | 'behavior' | 'training' | 'wellness';
  species_affected: string[];
  trend_strength: number;
  duration_days: number;
  peak_period?: string;
  trend_data: Record<string, any>;
  statistical_significance?: number;
  geographic_scope: string[];
  age_groups_affected: string[];
  related_events: Record<string, any>;
  predictions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CommunityAnomaly {
  id: string;
  anomaly_type: 'statistical' | 'behavioral' | 'health' | 'seasonal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_species: string[];
  anomaly_data: Record<string, any>;
  detection_method: 'statistical' | 'ml_model' | 'pattern_analysis';
  confidence_score: number;
  community_reports: number;
  expert_validation: 'pending' | 'confirmed' | 'false_positive';
  geographic_distribution: Record<string, any>;
  temporal_pattern: Record<string, any>;
  potential_causes?: string[];
  recommended_actions: Record<string, any>;
  resolution_status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface ModelImprovement {
  id: string;
  improvement_type: 'accuracy' | 'coverage' | 'new_pattern' | 'algorithm';
  model_component: 'emotion_analysis' | 'health_prediction' | 'behavior_pattern';
  before_metrics: Record<string, any>;
  after_metrics: Record<string, any>;
  improvement_percentage?: number;
  deployment_date?: string;
  rollout_status: 'planned' | 'testing' | 'partial' | 'complete';
  affected_users_count: number;
  performance_impact: Record<string, any>;
  user_feedback_summary: Record<string, any>;
  technical_details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIInsightsNotification {
  id: string;
  user_id: string;
  insight_type: 'pattern' | 'trend' | 'anomaly' | 'benchmark' | 'improvement';
  related_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action_required: boolean;
  action_data: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  expires_at?: string;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

// Tipi di filtri per le query
export interface CommunityFilters {
  species?: string[];
  confidence_threshold?: number;
  time_range?: {
    start: string;
    end: string;
  };
  validation_status?: string[];
  impact_level?: string[];
  severity?: string[];
}

// Tipi per le statistiche aggregate
export interface CommunityStats {
  total_patterns: number;
  validated_patterns: number;
  active_trends: number;
  open_anomalies: number;
  species_coverage: number;
  confidence_average: number;
  recent_discoveries: number;
}