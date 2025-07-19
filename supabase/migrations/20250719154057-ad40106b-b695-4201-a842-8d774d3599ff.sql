-- Fix RLS policy for protocol_ratings table to allow users to rate completed protocols
DROP POLICY IF EXISTS "Users can create ratings for completed protocols" ON public.protocol_ratings;

CREATE POLICY "Users can create ratings for completed protocols" 
ON public.protocol_ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.ai_training_protocols 
    WHERE id = protocol_id 
    AND user_id = auth.uid()
    AND (status = 'completed' OR progress_percentage = 100)
  )
);