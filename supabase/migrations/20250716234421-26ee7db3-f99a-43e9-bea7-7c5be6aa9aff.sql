-- Aggiungi campo per tracciare se un referral è ancora attivo
ALTER TABLE public.referrals 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Aggiorna la funzione che gestisce l'eliminazione dell'utente per disattivare i referral
CREATE OR REPLACE FUNCTION handle_user_deletion_referrals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Disattiva tutti i referral dove l'utente eliminato era il referred
  UPDATE public.referrals 
  SET is_active = false,
      status = 'user_deleted'
  WHERE referred_user_id = OLD.id;
  
  -- Log dell'eliminazione per i referrer
  INSERT INTO public.activity_log (
    user_id,
    activity_type, 
    activity_description,
    metadata
  )
  SELECT 
    referrer_id,
    'referral_deactivated',
    'Referral disattivato: utente eliminato',
    jsonb_build_object(
      'referred_user_id', OLD.id,
      'reason', 'account_deletion',
      'referred_email', referred_email
    )
  FROM public.referrals 
  WHERE referred_user_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Crea il trigger per l'eliminazione utente
DROP TRIGGER IF EXISTS on_user_deletion_referrals ON auth.users;
CREATE TRIGGER on_user_deletion_referrals
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_deletion_referrals();

-- Aggiorna la funzione convert_referral per verificare se il referral è attivo
CREATE OR REPLACE FUNCTION public.convert_referral(p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
  result JSONB;
BEGIN
  -- Trova referral "registered" E ATTIVO
  SELECT * INTO referral_rec
  FROM public.referrals
  WHERE (referred_user_id = p_user_id OR referred_email = p_email)
    AND status = 'registered'
    AND is_active = true  -- Solo referral attivi
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF referral_rec.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No active referral found');
  END IF;
  
  -- Verifica che il referrer esista ancora
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = referral_rec.referrer_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Referrer account no longer exists');
  END IF;

  -- Converte referral
  UPDATE public.referrals
  SET status = 'converted', 
      converted_at = NOW(),
      referred_user_id = p_user_id
  WHERE id = referral_rec.id;
  
  -- Aggiorna statistiche referrer
  UPDATE public.referrer_stats
  SET total_conversions = total_conversions + 1,
      updated_at = NOW()
  WHERE user_id = referral_rec.referrer_id;
  
  -- Calcola tier corrente
  SELECT * INTO tier_info
  FROM get_tier_info((
    SELECT total_conversions FROM public.referrer_stats 
    WHERE user_id = referral_rec.referrer_id
  ));
  
  -- Aggiorna tier
  UPDATE public.referrer_stats
  SET current_tier = tier_info.tier,
      tier_progress = total_conversions - tier_info.min_conversions
  WHERE user_id = referral_rec.referrer_id;
  
  -- Calcola commissione
  commission_amount := subscription_amount * tier_info.rate;
  
  -- Crea commissione primo pagamento
  INSERT INTO public.referral_commissions (
    referrer_id, referred_user_id, amount, commission_rate, tier,
    commission_type, subscription_amount, billing_period_start, billing_period_end
  ) VALUES (
    referral_rec.referrer_id, p_user_id, commission_amount, tier_info.rate, tier_info.tier,
    'first_payment', subscription_amount, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'
  );
  
  -- Aggiorna crediti
  UPDATE public.referrer_stats
  SET total_credits_earned = total_credits_earned + commission_amount,
      available_credits = available_credits + commission_amount,
      updated_at = NOW()
  WHERE user_id = referral_rec.referrer_id;
  
  result := jsonb_build_object(
    'success', true,
    'referral_id', referral_rec.id,
    'commission_amount', commission_amount,
    'tier', tier_info.tier,
    'rate', tier_info.rate
  );
  
  RETURN result;
END;
$$;

-- Aggiorna la funzione per commissioni ricorrenti
CREATE OR REPLACE FUNCTION public.process_recurring_commissions(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ref_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
  total_processed INTEGER := 0;
BEGIN
  -- Per ogni referral convertito di questo utente CHE SIA ANCORA ATTIVO
  FOR ref_rec IN 
    SELECT r.referrer_id, r.id as referral_id
    FROM public.referrals r
    WHERE r.referred_user_id = p_user_id 
      AND r.status = 'converted'
      AND r.is_active = true  -- Solo referral attivi
      AND EXISTS (SELECT 1 FROM auth.users WHERE id = r.referrer_id)  -- Verifica che il referrer esista
  LOOP
    -- Calcola tier attuale del referrer
    SELECT * INTO tier_info
    FROM get_tier_info((
      SELECT total_conversions FROM public.referrer_stats 
      WHERE user_id = ref_rec.referrer_id
    ));
    
    commission_amount := subscription_amount * tier_info.rate;
    
    -- Crea commissione ricorrente (solo se non già processata questo mese)
    INSERT INTO public.referral_commissions (
      referrer_id, referred_user_id, amount, commission_rate, tier,
      commission_type, subscription_amount, billing_period_start, billing_period_end
    ) 
    SELECT 
      ref_rec.referrer_id, p_user_id, commission_amount, tier_info.rate, tier_info.tier,
      'recurring', subscription_amount, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.referral_commissions rc
      WHERE rc.referrer_id = ref_rec.referrer_id 
        AND rc.referred_user_id = p_user_id
        AND rc.commission_type = 'recurring'
        AND rc.billing_period_start = CURRENT_DATE
    );
    
    -- Se inserito, aggiorna crediti e conta
    IF FOUND THEN
      UPDATE public.referrer_stats
      SET available_credits = available_credits + commission_amount,
          total_credits_earned = total_credits_earned + commission_amount,
          updated_at = NOW()
      WHERE user_id = ref_rec.referrer_id;
      
      total_processed := total_processed + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('success', true, 'processed', total_processed);
END;
$$;