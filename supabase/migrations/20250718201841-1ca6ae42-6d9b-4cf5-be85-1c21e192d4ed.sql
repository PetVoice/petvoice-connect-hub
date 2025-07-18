-- Crea le tabelle per i protocolli di training AI

-- Tabella principale per i protocolli di training
CREATE TABLE public.ai_training_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'comportamento',
  difficulty text NOT NULL DEFAULT 'facile' CHECK (difficulty IN ('facile', 'medio', 'difficile')),
  duration_days integer NOT NULL DEFAULT 14,
  current_day integer DEFAULT 1,
  progress_percentage integer DEFAULT 0,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'paused', 'completed', 'suggested')),
  target_behavior text,
  triggers text[],
  success_rate numeric DEFAULT 0,
  ai_generated boolean DEFAULT false,
  integration_source text CHECK (integration_source IN ('analysis', 'diary', 'wellness', 'matching', 'manual')),
  veterinary_approved boolean DEFAULT false,
  estimated_cost numeric,
  required_materials text[],
  is_public boolean DEFAULT false,
  share_code text UNIQUE,
  community_rating numeric DEFAULT 0,
  community_usage integer DEFAULT 0,
  mentor_recommended boolean DEFAULT false,
  notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now()
);

-- Tabella per gli esercizi del protocollo
CREATE TABLE public.ai_training_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid REFERENCES public.ai_training_protocols(id) ON DELETE CASCADE NOT NULL,
  day_number integer NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 15,
  exercise_type text NOT NULL DEFAULT 'behavioral' CHECK (exercise_type IN ('physical', 'mental', 'behavioral', 'social')),
  instructions text[],
  materials text[],
  video_url text,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  feedback text,
  effectiveness_score integer CHECK (effectiveness_score >= 1 AND effectiveness_score <= 10),
  photos text[],
  voice_notes text[],
  ai_analysis text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabella per le metriche dei protocolli
CREATE TABLE public.ai_training_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid REFERENCES public.ai_training_protocols(id) ON DELETE CASCADE NOT NULL,
  behavior_improvement numeric DEFAULT 0,
  stress_reduction numeric DEFAULT 0,
  engagement_level numeric DEFAULT 0,
  owner_satisfaction numeric DEFAULT 0,
  community_success numeric DEFAULT 0,
  time_efficiency numeric DEFAULT 0,
  cost_effectiveness numeric DEFAULT 0,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabella per i programmi di training (schedule)
CREATE TABLE public.ai_training_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid REFERENCES public.ai_training_protocols(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date,
  daily_time time DEFAULT '09:00',
  reminder_times time[],
  weekdays integer[] DEFAULT '{1,2,3,4,5,6,7}',
  flexible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabella per i protocolli suggeriti dall'AI
CREATE TABLE public.ai_suggested_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  reason text NOT NULL,
  source text NOT NULL,
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  estimated_success numeric DEFAULT 0,
  similar_cases integer DEFAULT 0,
  category text NOT NULL,
  difficulty text NOT NULL,
  duration_days integer NOT NULL,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  integration_data jsonb DEFAULT '{}',
  auto_generated boolean DEFAULT true,
  accepted boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabella per i template di protocolli
CREATE TABLE public.ai_training_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text NOT NULL,
  duration_days integer NOT NULL,
  popularity_score integer DEFAULT 0,
  success_rate numeric DEFAULT 0,
  template_data jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.ai_training_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggested_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_templates ENABLE ROW LEVEL SECURITY;

-- Policies per ai_training_protocols
CREATE POLICY "Users can manage their own training protocols" ON public.ai_training_protocols
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public protocols" ON public.ai_training_protocols
  FOR SELECT USING (is_public = true);

-- Policies per ai_training_exercises
CREATE POLICY "Users can manage exercises of their protocols" ON public.ai_training_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_training_protocols 
      WHERE id = ai_training_exercises.protocol_id 
      AND user_id = auth.uid()
    )
  );

-- Policies per ai_training_metrics
CREATE POLICY "Users can manage metrics of their protocols" ON public.ai_training_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_training_protocols 
      WHERE id = ai_training_metrics.protocol_id 
      AND user_id = auth.uid()
    )
  );

-- Policies per ai_training_schedules
CREATE POLICY "Users can manage schedules of their protocols" ON public.ai_training_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.ai_training_protocols 
      WHERE id = ai_training_schedules.protocol_id 
      AND user_id = auth.uid()
    )
  );

-- Policies per ai_suggested_protocols
CREATE POLICY "Users can manage their suggested protocols" ON public.ai_suggested_protocols
  FOR ALL USING (auth.uid() = user_id);

-- Policies per ai_training_templates
CREATE POLICY "Everyone can view active templates" ON public.ai_training_templates
  FOR SELECT USING (is_active = true);

-- Indici per performance
CREATE INDEX idx_ai_training_protocols_user_id ON public.ai_training_protocols(user_id);
CREATE INDEX idx_ai_training_protocols_pet_id ON public.ai_training_protocols(pet_id);
CREATE INDEX idx_ai_training_protocols_status ON public.ai_training_protocols(status);
CREATE INDEX idx_ai_training_exercises_protocol_id ON public.ai_training_exercises(protocol_id);
CREATE INDEX idx_ai_suggested_protocols_user_id ON public.ai_suggested_protocols(user_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_ai_training_protocols_updated_at BEFORE UPDATE ON public.ai_training_protocols FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_training_exercises_updated_at BEFORE UPDATE ON public.ai_training_exercises FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_training_schedules_updated_at BEFORE UPDATE ON public.ai_training_schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();