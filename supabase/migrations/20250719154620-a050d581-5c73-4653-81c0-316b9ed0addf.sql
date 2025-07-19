-- Drop the existing policy with the new name first, then recreate it properly
DROP POLICY IF EXISTS "Users can manage ratings for completed protocols" ON public.protocol_ratings;
DROP POLICY IF EXISTS "Users can create ratings for completed protocols" ON public.protocol_ratings;

-- Create the correct policy that allows both INSERT and UPDATE
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