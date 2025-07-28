-- Ricrea la tabella subscribers per gestire gli abbonamenti
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_type TEXT,
  cancellation_date TIMESTAMPTZ,
  cancellation_effective_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere il proprio abbonamento
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Policy per aggiornamenti (per edge functions)
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Policy per inserimenti (per edge functions)
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Inserisci un abbonamento premium temporaneo per l'utente corrente
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  true,
  'premium',
  NOW() + INTERVAL '1 year'
WHERE auth.uid() IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'premium',
  subscription_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();