-- Aggiungi colonna stripe_customer_id alla tabella subscribers se non esiste
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Aggiorna le funzioni per usare la struttura corretta della tabella subscribers
-- Nota: La tabella subscribers ha:
-- - subscription_plan (invece di subscription_tier)
-- - subscription_status
-- - subscription_start_date
-- - subscription_end_date (invece di subscription_end)
-- - max_pets_allowed