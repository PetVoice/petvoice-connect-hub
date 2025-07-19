-- Allow users to update their existing ratings instead of only insert
-- This fixes the duplicate key constraint error when users try to rate the same protocol twice

DROP POLICY IF EXISTS "Users can create ratings for completed protocols" ON public.protocol_ratings;

-- Updated policy that allows both INSERT and UPDATE
CREATE POLICY "Users can manage ratings for completed protocols" 
ON public.protocol_ratings 
FOR ALL
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.ai_training_protocols 
    WHERE id = protocol_id 
    AND user_id = auth.uid()
    AND (status = 'completed' OR progress_percentage = 100)
  )
)
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.ai_training_protocols 
    WHERE id = protocol_id 
    AND user_id = auth.uid()
    AND (status = 'completed' OR progress_percentage = 100)
  )
);