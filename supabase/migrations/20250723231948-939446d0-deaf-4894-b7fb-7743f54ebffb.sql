-- Aggiorna la policy RLS per permettere la lettura di esercizi dei protocolli pubblici

-- Elimina la policy esistente
DROP POLICY IF EXISTS "Users can view exercises from their protocols" ON public.ai_training_exercises;

-- Crea nuova policy che include protocolli pubblici
CREATE POLICY "Users can view exercises from their protocols or public protocols" 
ON public.ai_training_exercises 
FOR SELECT 
USING (
  protocol_id IN (
    SELECT id FROM public.ai_training_protocols 
    WHERE user_id = auth.uid()::text OR is_public = true
  )
);