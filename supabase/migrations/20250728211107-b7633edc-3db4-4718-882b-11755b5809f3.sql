-- Ricrea completamente la tabella subscribers
CREATE TABLE public.subscribers (
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

-- Inserisci abbonamento premium per l'utente corrente
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'::uuid,
  'admin@example.com',
  true,
  'premium',
  NOW() + INTERVAL '1 year'
);