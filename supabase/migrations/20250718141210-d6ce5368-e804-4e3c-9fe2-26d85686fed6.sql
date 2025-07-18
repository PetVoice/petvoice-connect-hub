-- Community Learning AI Tables

-- Tabella per pattern globali scoperti
CREATE TABLE public.community_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL, -- 'behavioral', 'health', 'seasonal', 'cross_species'
  species_affected TEXT[] NOT NULL DEFAULT '{}',
  pattern_data JSONB NOT NULL,
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  sample_size INTEGER NOT NULL DEFAULT 0,
  discovery_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
  validation_count INTEGER NOT NULL DEFAULT 0,
  impact_level TEXT NOT NULL DEFAULT 'low' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per knowledge transfer cross-species
CREATE TABLE public.cross_species_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_species TEXT NOT NULL,
  target_species TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'behavioral', 'health', 'training', 'nutrition'
  insight_data JSONB NOT NULL,
  applicability_score NUMERIC NOT NULL CHECK (applicability_score >= 0 AND applicability_score <= 1),
  evidence_strength TEXT NOT NULL CHECK (evidence_strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  community_votes INTEGER NOT NULL DEFAULT 0,
  expert_validated BOOLEAN DEFAULT FALSE,
  related_patterns UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per benchmark anonimi
CREATE TABLE public.anonymous_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  benchmark_type TEXT NOT NULL, -- 'wellness', 'behavior', 'training', 'health'
  species TEXT NOT NULL,
  age_range TEXT, -- '0-1', '1-3', '3-7', '7+'
  region_code TEXT,
  metric_name TEXT NOT NULL,
  percentile_data JSONB NOT NULL, -- {p25: value, p50: value, p75: value, p90: value, p95: value}
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_period TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per trend identification
CREATE TABLE public.community_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_type TEXT NOT NULL, -- 'rising', 'declining', 'seasonal', 'emerging'
  category TEXT NOT NULL, -- 'health', 'behavior', 'training', 'wellness'
  species_affected TEXT[] NOT NULL DEFAULT '{}',
  trend_strength NUMERIC NOT NULL CHECK (trend_strength >= 0 AND trend_strength <= 1),
  duration_days INTEGER NOT NULL,
  peak_period TIMESTAMP WITH TIME ZONE,
  trend_data JSONB NOT NULL,
  statistical_significance NUMERIC,
  geographic_scope TEXT[] DEFAULT '{}', -- array of region codes
  age_groups_affected TEXT[] DEFAULT '{}',
  related_events JSONB DEFAULT '{}',
  predictions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per anomalie detected
CREATE TABLE public.community_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anomaly_type TEXT NOT NULL, -- 'statistical', 'behavioral', 'health', 'seasonal'
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_species TEXT[] NOT NULL DEFAULT '{}',
  anomaly_data JSONB NOT NULL,
  detection_method TEXT NOT NULL, -- 'statistical', 'ml_model', 'pattern_analysis'
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  community_reports INTEGER NOT NULL DEFAULT 0,
  expert_validation TEXT DEFAULT 'pending' CHECK (expert_validation IN ('pending', 'confirmed', 'false_positive')),
  geographic_distribution JSONB DEFAULT '{}',
  temporal_pattern JSONB DEFAULT '{}',
  potential_causes TEXT[],
  recommended_actions JSONB DEFAULT '{}',
  resolution_status TEXT DEFAULT 'open' CHECK (resolution_status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per model improvements
CREATE TABLE public.model_improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  improvement_type TEXT NOT NULL, -- 'accuracy', 'coverage', 'new_pattern', 'algorithm'
  model_component TEXT NOT NULL, -- 'emotion_analysis', 'health_prediction', 'behavior_pattern'
  before_metrics JSONB NOT NULL,
  after_metrics JSONB NOT NULL,
  improvement_percentage NUMERIC,
  deployment_date TIMESTAMP WITH TIME ZONE,
  rollout_status TEXT DEFAULT 'planned' CHECK (rollout_status IN ('planned', 'testing', 'partial', 'complete')),
  affected_users_count INTEGER DEFAULT 0,
  performance_impact JSONB DEFAULT '{}',
  user_feedback_summary JSONB DEFAULT '{}',
  technical_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per le notifiche AI agli utenti
CREATE TABLE public.ai_insights_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'pattern', 'trend', 'anomaly', 'benchmark', 'improvement'
  related_id UUID NOT NULL, -- ID della tabella correlata
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required BOOLEAN DEFAULT FALSE,
  action_data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.community_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_species_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Community patterns - tutti possono vedere patterns validati
CREATE POLICY "Everyone can view validated patterns" 
ON public.community_patterns 
FOR SELECT 
USING (validation_status = 'validated');

-- Cross-species insights - tutti possono vedere insights validati
CREATE POLICY "Everyone can view validated insights" 
ON public.cross_species_insights 
FOR SELECT 
USING (TRUE);

-- Anonymous benchmarks - tutti possono vedere
CREATE POLICY "Everyone can view benchmarks" 
ON public.anonymous_benchmarks 
FOR SELECT 
USING (TRUE);

-- Community trends - tutti possono vedere
CREATE POLICY "Everyone can view trends" 
ON public.community_trends 
FOR SELECT 
USING (TRUE);

-- Community anomalies - tutti possono vedere anomalie pubbliche
CREATE POLICY "Everyone can view public anomalies" 
ON public.community_anomalies 
FOR SELECT 
USING (severity IN ('medium', 'high', 'critical'));

-- Model improvements - tutti possono vedere
CREATE POLICY "Everyone can view improvements" 
ON public.model_improvements 
FOR SELECT 
USING (rollout_status IN ('partial', 'complete'));

-- AI notifications - solo proprie notifiche
CREATE POLICY "Users can view own notifications" 
ON public.ai_insights_notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Indexes per performance
CREATE INDEX idx_community_patterns_species ON public.community_patterns USING GIN(species_affected);
CREATE INDEX idx_community_patterns_type ON public.community_patterns(pattern_type);
CREATE INDEX idx_community_patterns_confidence ON public.community_patterns(confidence_score DESC);

CREATE INDEX idx_cross_species_source ON public.cross_species_insights(source_species);
CREATE INDEX idx_cross_species_target ON public.cross_species_insights(target_species);
CREATE INDEX idx_cross_species_score ON public.cross_species_insights(applicability_score DESC);

CREATE INDEX idx_benchmarks_species ON public.anonymous_benchmarks(species);
CREATE INDEX idx_benchmarks_type ON public.anonymous_benchmarks(benchmark_type);
CREATE INDEX idx_benchmarks_updated ON public.anonymous_benchmarks(last_updated DESC);

CREATE INDEX idx_trends_category ON public.community_trends(category);
CREATE INDEX idx_trends_strength ON public.community_trends(trend_strength DESC);
CREATE INDEX idx_trends_species ON public.community_trends USING GIN(species_affected);

CREATE INDEX idx_anomalies_severity ON public.community_anomalies(severity);
CREATE INDEX idx_anomalies_type ON public.community_anomalies(anomaly_type);
CREATE INDEX idx_anomalies_species ON public.community_anomalies USING GIN(affected_species);

CREATE INDEX idx_notifications_user ON public.ai_insights_notifications(user_id);
CREATE INDEX idx_notifications_read ON public.ai_insights_notifications(is_read, created_at DESC);
CREATE INDEX idx_notifications_priority ON public.ai_insights_notifications(priority, created_at DESC);

-- Trigger per aggiornamento timestamp
CREATE TRIGGER update_community_patterns_updated_at
BEFORE UPDATE ON public.community_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cross_species_insights_updated_at
BEFORE UPDATE ON public.cross_species_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_trends_updated_at
BEFORE UPDATE ON public.community_trends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_anomalies_updated_at
BEFORE UPDATE ON public.community_anomalies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_model_improvements_updated_at
BEFORE UPDATE ON public.model_improvements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();