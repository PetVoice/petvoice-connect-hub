-- Update RLS policy for exercises to correctly handle public protocols
DROP POLICY IF EXISTS "Users can view exercises of public protocols" ON public.ai_training_exercises;

CREATE POLICY "Users can view exercises of public protocols" 
ON public.ai_training_exercises 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.is_public = true
  )
  OR 
  EXISTS (
    SELECT 1 
    FROM public.ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.user_id = auth.uid()
  )
);