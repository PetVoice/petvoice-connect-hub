-- Create RLS policies for ai_training_metrics table
-- Users can access metrics if they own the associated protocol

CREATE POLICY "Users can view metrics from their protocols" 
ON public.ai_training_metrics
FOR SELECT 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can create metrics for their protocols" 
ON public.ai_training_metrics
FOR INSERT 
TO authenticated
WITH CHECK (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can update metrics from their protocols" 
ON public.ai_training_metrics
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

CREATE POLICY "Users can delete metrics from their protocols" 
ON public.ai_training_metrics
FOR DELETE 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

-- Create RLS policies for ai_training_schedules table
-- Users can access schedules if they own the associated protocol

CREATE POLICY "Users can view schedules from their protocols" 
ON public.ai_training_schedules
FOR SELECT 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can create schedules for their protocols" 
ON public.ai_training_schedules
FOR INSERT 
TO authenticated
WITH CHECK (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can update schedules from their protocols" 
ON public.ai_training_schedules
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

CREATE POLICY "Users can delete schedules from their protocols" 
ON public.ai_training_schedules
FOR DELETE 
TO authenticated
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = (auth.uid())::text
  )
);