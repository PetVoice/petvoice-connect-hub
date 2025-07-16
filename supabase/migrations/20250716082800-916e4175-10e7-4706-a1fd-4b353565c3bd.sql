-- Create learning paths table
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  estimated_time_minutes INTEGER NOT NULL DEFAULT 120,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Stores lesson content structure
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('reading', 'video', 'interactive', 'quiz', 'practice')),
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  prerequisites JSONB DEFAULT '[]'::jsonb, -- Array of lesson IDs that must be completed first
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user learning progress table
CREATE TABLE public.user_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_lesson_id UUID REFERENCES public.lessons(id),
  total_time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, learning_path_id)
);

-- Create lesson completions table
CREATE TABLE public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  score INTEGER CHECK (score >= 0 AND score <= 100), -- For quizzes/assessments
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_paths
CREATE POLICY "Everyone can view active learning paths" 
ON public.learning_paths 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for lessons
CREATE POLICY "Everyone can view lessons for active paths" 
ON public.lessons 
FOR SELECT 
USING (
  learning_path_id IN (
    SELECT id FROM public.learning_paths WHERE is_active = true
  )
);

-- RLS Policies for user_learning_progress
CREATE POLICY "Users can view own learning progress" 
ON public.user_learning_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning progress" 
ON public.user_learning_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress" 
ON public.user_learning_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for lesson_completions
CREATE POLICY "Users can view own lesson completions" 
ON public.lesson_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lesson completions" 
ON public.lesson_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson completions" 
ON public.lesson_completions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_lessons_path_order ON public.lessons(learning_path_id, sort_order);
CREATE INDEX idx_user_progress_user_path ON public.user_learning_progress(user_id, learning_path_id);
CREATE INDEX idx_lesson_completions_user ON public.lesson_completions(user_id, learning_path_id);

-- Add triggers for automatic updates
CREATE OR REPLACE FUNCTION public.update_learning_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress INTEGER;
BEGIN
  -- Calculate progress when a lesson is completed
  IF TG_OP = 'INSERT' THEN
    -- Get total lessons for this path
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons
    WHERE learning_path_id = NEW.learning_path_id AND is_required = true;
    
    -- Get completed lessons for this user and path
    SELECT COUNT(*) INTO completed_lessons
    FROM public.lesson_completions
    WHERE user_id = NEW.user_id AND learning_path_id = NEW.learning_path_id;
    
    -- Calculate progress percentage
    new_progress := CASE 
      WHEN total_lessons > 0 THEN (completed_lessons * 100 / total_lessons)
      ELSE 0 
    END;
    
    -- Update or insert user progress
    INSERT INTO public.user_learning_progress (
      user_id, 
      learning_path_id, 
      progress_percentage, 
      is_completed,
      last_accessed_at,
      current_lesson_id
    ) VALUES (
      NEW.user_id, 
      NEW.learning_path_id, 
      new_progress, 
      new_progress = 100,
      now(),
      CASE WHEN new_progress = 100 THEN NULL ELSE NEW.lesson_id END
    )
    ON CONFLICT (user_id, learning_path_id) 
    DO UPDATE SET
      progress_percentage = new_progress,
      is_completed = new_progress = 100,
      last_accessed_at = now(),
      completed_at = CASE WHEN new_progress = 100 THEN now() ELSE user_learning_progress.completed_at END,
      updated_at = now();
      
    -- Log activity
    INSERT INTO public.activity_log (
      user_id,
      activity_type,
      activity_description,
      metadata
    ) VALUES (
      NEW.user_id,
      'lesson_completed',
      'Completed lesson: ' || (SELECT title FROM public.lessons WHERE id = NEW.lesson_id),
      jsonb_build_object(
        'lesson_id', NEW.lesson_id,
        'learning_path_id', NEW.learning_path_id,
        'progress_percentage', new_progress,
        'time_spent_minutes', NEW.time_spent_minutes
      )
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_update_learning_progress
  AFTER INSERT ON public.lesson_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_learning_progress();

-- Insert initial learning paths data
INSERT INTO public.learning_paths (title, description, level, icon_name, color, estimated_time_minutes, total_lessons, sort_order) VALUES
('Getting Started', 'Impara le basi di PetVoice e configura il tuo primo animale domestico', 'Beginner', 'zap', 'bg-green-500', 120, 8, 1),
('Analysis Master', 'Diventa esperto nell''analisi comportamentale e nell''interpretazione dei risultati', 'Intermediate', 'brain', 'bg-blue-500', 240, 12, 2),
('Diary Expert', 'Padroneggia il diario digitale e il tracking dell''umore del tuo pet', 'Intermediate', 'book-open', 'bg-purple-500', 180, 10, 3),
('Health Guardian', 'Gestisci cartelle mediche, comunicazioni veterinarie e preparazione emergenze', 'Advanced', 'shield', 'bg-red-500', 300, 15, 4),
('Data Detective', 'Analizza trend, interpreta dati e prendi decisioni informate', 'Advanced', 'trending-up', 'bg-orange-500', 360, 18, 5),
('Community Leader', 'Partecipa efficacemente alla community e aiuta altri utenti', 'Intermediate', 'users', 'bg-cyan-500', 180, 8, 6);