-- Fix RLS policies for user_onboarding table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.user_onboarding;

-- Create correct RLS policies
CREATE POLICY "Users can view their own onboarding data" 
ON public.user_onboarding 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data" 
ON public.user_onboarding 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
ON public.user_onboarding 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding data" 
ON public.user_onboarding 
FOR DELETE 
USING (auth.uid() = user_id);