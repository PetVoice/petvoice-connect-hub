-- Rimuovi i protocolli duplicati di "Riattivazione Energia e Motivazione"
-- Mantieni solo il più recente (quello pubblico del 18:51)
DELETE FROM public.ai_training_protocols 
WHERE title = 'Riattivazione Energia e Motivazione' 
AND id IN (
  'f4949bd6-e3bb-40f7-a77a-3a02ae565d0b',  -- quello del 19 luglio
  '323ede62-5953-4104-b164-c2a6b3f2ca02'   -- quello privato del 20 luglio
);