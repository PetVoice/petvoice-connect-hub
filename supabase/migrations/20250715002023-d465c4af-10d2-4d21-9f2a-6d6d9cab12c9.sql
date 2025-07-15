-- RISOLVE IL PROBLEMA VERO: Aggiunge constraint mancante alla tabella referrals
-- Il problema è che la tabella referrals non ha un constraint unico su (referrer_id, referred_email)

-- Aggiungi constraint unico per evitare referral duplicati
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referrer_email_unique 
UNIQUE (referrer_id, referred_email);