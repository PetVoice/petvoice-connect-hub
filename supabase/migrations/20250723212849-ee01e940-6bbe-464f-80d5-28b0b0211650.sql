-- Create RLS policies for ai_training_exercises table
-- Users can access exercises if they own the associated protocol

-- Policy to allow users to view exercises from their own protocols
CREATE POLICY "Users can view exercises from their protocols" 
ON public.ai_training_exercises
FOR SELECT 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

-- Policy to allow users to insert exercises for their own protocols
CREATE POLICY "Users can create exercises for their protocols" 
ON public.ai_training_exercises
FOR INSERT 
TO authenticated
WITH CHECK (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

-- Policy to allow users to update exercises from their own protocols
CREATE POLICY "Users can update exercises from their protocols" 
ON public.ai_training_exercises
FOR UPDATE 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
)
WITH CHECK (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

-- Policy to allow users to delete exercises from their own protocols
CREATE POLICY "Users can delete exercises from their protocols" 
ON public.ai_training_exercises
FOR DELETE 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);