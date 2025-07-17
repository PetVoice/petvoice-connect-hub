-- Fix: rimuovi ON DELETE CASCADE per preservare dati storici - versione corretta
-- Passo 1: Rimuovi vincoli esistenti

ALTER TABLE public.referrals 
DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;

ALTER TABLE public.referrals 
DROP CONSTRAINT IF EXISTS referrals_referred_user_id_fkey;

ALTER TABLE public.referral_commissions 
DROP CONSTRAINT IF EXISTS referral_commissions_referrer_id_fkey;

ALTER TABLE public.referral_commissions 
DROP CONSTRAINT IF EXISTS referral_commissions_referred_user_id_fkey;

-- Passo 2: Ricrea i constraint SENZA ON DELETE CASCADE
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referred_user_id_fkey 
FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.referral_commissions 
ADD CONSTRAINT referral_commissions_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.referral_commissions 
ADD CONSTRAINT referral_commissions_referred_user_id_fkey 
FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Passo 3: Permettiamo NULL nelle colonne user_id per i dati storici
ALTER TABLE public.referrals 
ALTER COLUMN referrer_id DROP NOT NULL;

ALTER TABLE public.referrals 
ALTER COLUMN referred_user_id DROP NOT NULL;

ALTER TABLE public.referral_commissions 
ALTER COLUMN referrer_id DROP NOT NULL;

ALTER TABLE public.referral_commissions 
ALTER COLUMN referred_user_id DROP NOT NULL;

-- Passo 4: Aggiungi colonne per conservare i dati storici
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS referrer_email TEXT,
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT FALSE;

ALTER TABLE public.referral_commissions 
ADD COLUMN IF NOT EXISTS referrer_email TEXT,
ADD COLUMN IF NOT EXISTS referred_email TEXT,
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT FALSE;

-- Passo 5: Aggiorna RLS policies corrette per gestire i dati storici
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals" ON public.referrals
FOR SELECT 
USING (
  auth.uid() = referrer_id OR 
  (referrer_id IS NULL AND is_historical = TRUE AND EXISTS (
    SELECT 1 FROM public.referrer_stats rs 
    WHERE rs.user_id = auth.uid() AND rs.referral_code = referrals.referral_code
  ))
);

DROP POLICY IF EXISTS "Users can view own commissions" ON public.referral_commissions;
CREATE POLICY "Users can view own commissions" ON public.referral_commissions
FOR SELECT 
USING (
  auth.uid() = referrer_id OR 
  (referrer_id IS NULL AND is_historical = TRUE AND referrer_email IS NOT NULL)
);

-- Passo 6: Funzione per marcare i dati come storici quando un utente viene eliminato
CREATE OR REPLACE FUNCTION public.preserve_referral_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Ottieni l'email dell'utente che sta per essere eliminato
  user_email := OLD.email;
  
  -- Marca i referrals come storici e salva l'email del referrer
  UPDATE public.referrals 
  SET 
    is_historical = TRUE,
    referrer_email = user_email
  WHERE referrer_id = OLD.id;
  
  -- Marca anche i referrals dove l'utente era il referred
  UPDATE public.referrals 
  SET 
    is_historical = TRUE
  WHERE referred_user_id = OLD.id;
  
  -- Marca le commissioni come storiche
  UPDATE public.referral_commissions 
  SET 
    is_historical = TRUE,
    referrer_email = user_email,
    referred_email = (
      SELECT referred_email FROM public.referrals 
      WHERE referred_user_id = OLD.id 
      LIMIT 1
    )
  WHERE referrer_id = OLD.id;
  
  -- Marca le commissioni dove l'utente era il referred
  UPDATE public.referral_commissions 
  SET 
    is_historical = TRUE,
    referred_email = user_email
  WHERE referred_user_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Crea trigger per preservare i dati storici
DROP TRIGGER IF EXISTS preserve_referral_history_trigger ON auth.users;
CREATE TRIGGER preserve_referral_history_trigger
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.preserve_referral_history();