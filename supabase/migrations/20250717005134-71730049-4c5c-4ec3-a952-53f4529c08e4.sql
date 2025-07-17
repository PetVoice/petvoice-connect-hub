-- 1. Modificare il trigger di eliminazione utente per cambiare status referral a "annullato" 
-- invece di disattivare completamente i referral

-- Prima rimuovi il trigger esistente
DROP TRIGGER IF EXISTS handle_user_deletion_referrals_trigger ON auth.users;

-- Crea una funzione aggiornata per gestire l'eliminazione utente
CREATE OR REPLACE FUNCTION public.handle_user_deletion_referrals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Cambia lo status dei referral da "converted" a "cancelled" per referral dell'utente eliminato
  UPDATE public.referrals 
  SET status = 'cancelled'
  WHERE referred_user_id = OLD.id
    AND status = 'converted';
  
  -- Log dell'eliminazione per i referrer
  INSERT INTO public.activity_log (
    user_id,
    activity_type, 
    activity_description,
    metadata
  )
  SELECT 
    referrer_id,
    'referral_cancelled',
    'Referral annullato: utente eliminato',
    jsonb_build_object(
      'referred_user_id', OLD.id,
      'reason', 'account_deletion',
      'referred_email', referred_email
    )
  FROM public.referrals 
  WHERE referred_user_id = OLD.id
    AND status = 'cancelled';
  
  RETURN OLD;
END;
$function$;

-- Ricrea il trigger con la nuova funzione
CREATE TRIGGER handle_user_deletion_referrals_trigger
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion_referrals();

-- 2. Aggiungere filtri alla tabella referrals per supportare la ricerca
-- (non serve modificare il database, solo il frontend)

-- 3. Assicurarsi che tutti i dati necessari per il funnel esistano
-- Verificare che le commissioni mantengano le informazioni storiche
ALTER TABLE public.referral_commissions 
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE;

-- Aggiornare le commissioni per referral cancellati
UPDATE public.referral_commissions 
SET is_cancelled = TRUE 
WHERE referred_user_id IN (
  SELECT referred_user_id 
  FROM public.referrals 
  WHERE status = 'cancelled'
);