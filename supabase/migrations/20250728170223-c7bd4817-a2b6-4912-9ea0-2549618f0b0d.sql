-- Controlla quali sono i constraint sulla tabella support_tickets
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'support_tickets')
  AND contype = 'c';

-- Aggiungi 'urgent' ai valori accettati per la priorità
ALTER TABLE public.support_tickets 
DROP CONSTRAINT IF EXISTS support_tickets_priority_check;

ALTER TABLE public.support_tickets 
ADD CONSTRAINT support_tickets_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical'));