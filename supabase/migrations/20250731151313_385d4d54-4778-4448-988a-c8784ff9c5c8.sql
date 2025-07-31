-- Create ml_model_metrics table for tracking model performance
CREATE TABLE public.ml_model_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_type TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'accuracy', 'precision', 'recall'
  metric_value NUMERIC NOT NULL CHECK (metric_value >= 0 AND metric_value <= 1),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sample_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_type, metric_type, metric_date)
);

-- Enable RLS
ALTER TABLE public.ml_model_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ML metrics" 
ON public.ml_model_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ML metrics" 
ON public.ml_model_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ML metrics" 
ON public.ml_model_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_ml_model_metrics_user_type ON public.ml_model_metrics(user_id, model_type);
CREATE INDEX idx_ml_model_metrics_date ON public.ml_model_metrics(metric_date DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_ml_model_metrics_updated_at
BEFORE UPDATE ON public.ml_model_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();