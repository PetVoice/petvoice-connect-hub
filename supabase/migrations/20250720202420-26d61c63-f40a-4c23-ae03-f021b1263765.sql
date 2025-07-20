-- Rimuovi tutti i duplicati di "Gestione Gelosia e Possessività" 
-- tranne il più recente pubblico (quello del 20:15:24)
DELETE FROM public.ai_training_protocols 
WHERE title = 'Gestione Gelosia e Possessività' 
AND id IN (
  '4f5d05b5-ec6d-4026-9f81-a53311563588',  -- privato del 20:20
  '19a226be-63b5-4682-8c58-013e1116baeb',  -- privato del 20:16  
  '63343abe-2d4f-4f35-9f6d-bd8ea7047c7e'   -- pubblico del 19 luglio
);

-- Verifica che non ci siano altri protocolli duplicati
-- Trova tutti i protocolli con titoli duplicati
WITH duplicate_titles AS (
  SELECT title, COUNT(*) as count 
  FROM public.ai_training_protocols 
  GROUP BY title 
  HAVING COUNT(*) > 1
)
SELECT p.id, p.title, p.created_at, p.user_id, p.is_public, p.status
FROM public.ai_training_protocols p
INNER JOIN duplicate_titles d ON p.title = d.title
ORDER BY p.title, p.created_at DESC;