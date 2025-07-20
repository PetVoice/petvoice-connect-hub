-- Aggiorna la policy per permettere visualizzazione esercizi di protocolli pubblici
DROP POLICY IF EXISTS "Users can manage exercises of their protocols" ON ai_training_exercises;

-- Crea nuove policy separate per più controllo granulare
CREATE POLICY "Users can view exercises of their protocols" ON ai_training_exercises
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view exercises of public protocols" ON ai_training_exercises
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.is_public = true
  )
);

CREATE POLICY "Users can insert exercises to their protocols" ON ai_training_exercises
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update exercises of their protocols" ON ai_training_exercises
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete exercises of their protocols" ON ai_training_exercises
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM ai_training_protocols 
    WHERE ai_training_protocols.id = ai_training_exercises.protocol_id 
    AND ai_training_protocols.user_id = auth.uid()
  )
);