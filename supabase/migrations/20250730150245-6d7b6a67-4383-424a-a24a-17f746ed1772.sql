-- Tabella per raccogliere feedback sulle predizioni
CREATE TABLE public.prediction_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  analysis_id UUID,
  prediction_type TEXT NOT NULL, -- 'emotion', 'behavior', 'intervention'
  predicted_value TEXT NOT NULL,
  actual_value TEXT,
  accuracy_score NUMERIC CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  feedback_type TEXT NOT NULL DEFAULT 'user_correction', -- 'user_correction', 'observation_confirmed'
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per metriche di apprendimento continuo
CREATE TABLE public.ml_model_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL, -- 'emotion_detection', 'behavior_prediction'
  metric_name TEXT NOT NULL, -- 'accuracy', 'precision', 'recall', 'f1_score'
  metric_value NUMERIC NOT NULL,
  data_points_count INTEGER NOT NULL DEFAULT 0,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per pattern di apprendimento
CREATE TABLE public.learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'behavioral_trend', 'emotional_pattern', 'trigger_correlation'
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  validation_count INTEGER DEFAULT 0,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per sessioni di training del modello
CREATE TABLE public.model_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL,
  training_data_count INTEGER NOT NULL,
  performance_before JSONB,
  performance_after JSONB,
  improvements JSONB,
  training_duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' -- 'running', 'completed', 'failed'
);

-- Enable RLS
ALTER TABLE public.prediction_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_training_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies per prediction_feedback
CREATE POLICY "Users can create feedback for their pets"
ON public.prediction_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their feedback"
ON public.prediction_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback"
ON public.prediction_feedback FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies per ml_model_metrics (solo lettura per utenti)
CREATE POLICY "Users can view model metrics"
ON public.ml_model_metrics FOR SELECT
USING (true);

-- RLS Policies per learning_patterns
CREATE POLICY "Users can manage their learning patterns"
ON public.learning_patterns FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies per model_training_sessions (solo lettura per utenti)
CREATE POLICY "Users can view training sessions"
ON public.model_training_sessions FOR SELECT
USING (true);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_prediction_feedback_updated_at
BEFORE UPDATE ON public.prediction_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_patterns_updated_at
BEFORE UPDATE ON public.learning_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Funzione per calcolare metriche di accuratezza
CREATE OR REPLACE FUNCTION public.calculate_prediction_accuracy(
  p_model_type TEXT,
  p_days_back INTEGER DEFAULT 30
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  accuracy_result NUMERIC;
BEGIN
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE AVG(accuracy_score)
    END INTO accuracy_result
  FROM public.prediction_feedback
  WHERE prediction_type = p_model_type
    AND accuracy_score IS NOT NULL
    AND created_at >= (CURRENT_DATE - INTERVAL '1 day' * p_days_back);
    
  RETURN COALESCE(accuracy_result, 0);
END;
$$;

-- Funzione per identificare pattern ricorrenti
CREATE OR REPLACE FUNCTION public.detect_behavior_patterns(p_user_id UUID, p_pet_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  pattern_data JSONB;
  confidence NUMERIC;
BEGIN
  -- Pattern emotivo basato su analisi recenti
  SELECT 
    jsonb_build_object(
      'dominant_emotions', array_agg(DISTINCT primary_emotion),
      'avg_confidence', AVG(primary_confidence),
      'frequency_by_time', jsonb_object_agg(
        EXTRACT(hour FROM created_at)::TEXT, 
        COUNT(*)
      )
    ),
    AVG(primary_confidence)
  INTO pattern_data, confidence
  FROM public.pet_analyses
  WHERE user_id = p_user_id 
    AND pet_id = p_pet_id
    AND created_at >= (CURRENT_DATE - INTERVAL '30 days')
  GROUP BY DATE_TRUNC('hour', created_at)
  HAVING COUNT(*) >= 3;

  -- Inserisce il pattern se trovato
  IF pattern_data IS NOT NULL THEN
    INSERT INTO public.learning_patterns (
      user_id, pet_id, pattern_type, pattern_data, confidence_score
    ) VALUES (
      p_user_id, p_pet_id, 'emotional_pattern', pattern_data, confidence
    )
    ON CONFLICT (user_id, pet_id, pattern_type) DO UPDATE SET
      pattern_data = EXCLUDED.pattern_data,
      confidence_score = EXCLUDED.confidence_score,
      updated_at = now();
  END IF;
END;
$$;