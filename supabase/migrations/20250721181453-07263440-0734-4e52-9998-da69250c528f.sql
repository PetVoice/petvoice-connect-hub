-- PREDICTIVE ANALYTICS SYSTEM
-- Tabelle per il sistema di analytics predittivo

-- 1. Previsioni comportamentali 24-48h
CREATE TABLE public.behavior_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL,
  prediction_date DATE NOT NULL,
  prediction_window TEXT NOT NULL CHECK (prediction_window IN ('24h', '48h')),
  predicted_behaviors JSONB NOT NULL DEFAULT '{}',
  confidence_scores JSONB NOT NULL DEFAULT '{}',
  contributing_factors JSONB DEFAULT '{}',
  accuracy_feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Health Risk Assessments
CREATE TABLE public.health_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL,
  overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_categories JSONB NOT NULL DEFAULT '{}',
  risk_factors JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_assessment_due DATE,
  trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Intervention Recommendations  
CREATE TABLE public.intervention_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL,
  intervention_type TEXT NOT NULL,
  recommended_timing TIMESTAMPTZ NOT NULL,
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  expected_outcomes JSONB DEFAULT '{}',
  success_probability DECIMAL(3,2) CHECK (success_probability >= 0 AND success_probability <= 1),
  estimated_cost DECIMAL(10,2),
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Early Warning System
CREATE TABLE public.early_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL,
  warning_type TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  pattern_detected JSONB NOT NULL DEFAULT '{}',
  alert_message TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]',
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seasonal Adjustments
CREATE TABLE public.seasonal_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  pet_species TEXT NOT NULL,
  pet_breed TEXT,
  adjustment_type TEXT NOT NULL,
  adjustment_data JSONB NOT NULL DEFAULT '{}',
  effectiveness_score DECIMAL(3,2),
  geographic_region TEXT DEFAULT 'global',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Care Approach Predictions (ROI)
CREATE TABLE public.care_approach_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL,
  approach_name TEXT NOT NULL,
  estimated_cost DECIMAL(10,2) NOT NULL,
  predicted_benefits JSONB DEFAULT '{}',
  roi_score DECIMAL(5,2),
  time_horizon_days INTEGER NOT NULL,
  confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  comparative_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_behavior_predictions_pet_date ON public.behavior_predictions(pet_id, prediction_date);
CREATE INDEX idx_health_risk_assessments_pet_date ON public.health_risk_assessments(pet_id, assessment_date);
CREATE INDEX idx_intervention_recommendations_timing ON public.intervention_recommendations(recommended_timing, status);
CREATE INDEX idx_early_warnings_severity ON public.early_warnings(severity_level, is_acknowledged);
CREATE INDEX idx_seasonal_adjustments_season_species ON public.seasonal_adjustments(season, pet_species);

-- RLS Policies
ALTER TABLE public.behavior_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_approach_predictions ENABLE ROW LEVEL SECURITY;

-- Policies per behavior_predictions
CREATE POLICY "Users can manage their behavior predictions" ON public.behavior_predictions
FOR ALL USING (auth.uid() = user_id);

-- Policies per health_risk_assessments  
CREATE POLICY "Users can manage their health risk assessments" ON public.health_risk_assessments
FOR ALL USING (auth.uid() = user_id);

-- Policies per intervention_recommendations
CREATE POLICY "Users can manage their intervention recommendations" ON public.intervention_recommendations
FOR ALL USING (auth.uid() = user_id);

-- Policies per early_warnings
CREATE POLICY "Users can manage their early warnings" ON public.early_warnings
FOR ALL USING (auth.uid() = user_id);

-- Policies per seasonal_adjustments (read-only per tutti)
CREATE POLICY "Users can view seasonal adjustments" ON public.seasonal_adjustments
FOR SELECT USING (true);

-- Policies per care_approach_predictions
CREATE POLICY "Users can manage their care approach predictions" ON public.care_approach_predictions
FOR ALL USING (auth.uid() = user_id);

-- Funzione per calcolare risk score automaticamente
CREATE OR REPLACE FUNCTION public.calculate_pet_risk_score(p_pet_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  risk_score INTEGER := 0;
  avg_mood DECIMAL;
  recent_entries INTEGER;
  behavioral_issues INTEGER;
  health_alerts INTEGER;
BEGIN
  -- Calcola media mood degli ultimi 7 giorni
  SELECT AVG(mood_score) INTO avg_mood
  FROM public.diary_entries
  WHERE pet_id = p_pet_id AND user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
    AND mood_score IS NOT NULL;

  -- Conta entries recenti
  SELECT COUNT(*) INTO recent_entries
  FROM public.diary_entries
  WHERE pet_id = p_pet_id AND user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days';

  -- Conta problemi comportamentali
  SELECT COUNT(*) INTO behavioral_issues
  FROM public.diary_entries
  WHERE pet_id = p_pet_id AND user_id = p_user_id
    AND entry_date >= CURRENT_DATE - INTERVAL '14 days'
    AND behavioral_tags && ARRAY['aggressivo', 'ansioso', 'depresso', 'agitato'];

  -- Conta health alerts attivi
  SELECT COUNT(*) INTO health_alerts
  FROM public.health_alerts
  WHERE pet_id = p_pet_id AND user_id = p_user_id
    AND is_resolved = FALSE;

  -- Calcola score finale (0-100)
  risk_score := GREATEST(0, LEAST(100,
    -- Base score da mood (invertito: mood basso = risk alto)
    CASE WHEN avg_mood IS NOT NULL THEN (10 - avg_mood) * 10 ELSE 50 END +
    -- Penalità per poche entries (mancanza dati)
    CASE WHEN recent_entries < 3 THEN 15 ELSE 0 END +
    -- Penalità per problemi comportamentali
    behavioral_issues * 5 +
    -- Penalità per health alerts
    health_alerts * 10
  ));

  RETURN risk_score;
END;
$$;

-- Trigger per aggiornare automaticamente i risk scores
CREATE OR REPLACE FUNCTION public.update_risk_score_on_diary_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserisci/aggiorna risk assessment
  INSERT INTO public.health_risk_assessments (
    user_id, pet_id, overall_risk_score, risk_categories, 
    risk_factors, recommendations, assessment_date
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.pet_id, OLD.pet_id),
    public.calculate_pet_risk_score(
      COALESCE(NEW.pet_id, OLD.pet_id), 
      COALESCE(NEW.user_id, OLD.user_id)
    ),
    '{"behavioral": 0, "physical": 0, "environmental": 0}',
    '{"recent_mood_trend": "calculated", "data_completeness": "assessed"}',
    '["Continue monitoring", "Consider veterinary consultation if score increases"]',
    CURRENT_DATE
  )
  ON CONFLICT (user_id, pet_id, assessment_date) 
  DO UPDATE SET
    overall_risk_score = EXCLUDED.overall_risk_score,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Applica trigger su diary_entries
CREATE TRIGGER update_risk_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_risk_score_on_diary_change();

-- Constraint unico per evitare duplicati risk assessment per giorno
ALTER TABLE public.health_risk_assessments 
ADD CONSTRAINT unique_pet_assessment_date 
UNIQUE (user_id, pet_id, assessment_date);