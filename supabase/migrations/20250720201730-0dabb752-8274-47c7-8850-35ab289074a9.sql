-- Fix public protocols by assigning a system user_id
-- First, create a system user UUID for public protocols
UPDATE public.ai_training_protocols 
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL AND is_public = true;

-- Update RLS policy for exercises to allow public protocol exercises
DROP POLICY IF EXISTS "Users can view exercises of public protocols" ON public.ai_training_exercises;

CREATE POLICY "Users can view exercises of public protocols" 
ON public.ai_training_exercises 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.is_public = true
  )
);