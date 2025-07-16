-- Create user_onboarding table to track onboarding progress
CREATE TABLE public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  completed_date TIMESTAMP WITH TIME ZONE,
  current_step INTEGER NOT NULL DEFAULT 1,
  skipped_steps JSONB DEFAULT '[]'::jsonb,
  plan_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own onboarding status"
ON public.user_onboarding
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status"
ON public.user_onboarding
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding status"
ON public.user_onboarding
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();