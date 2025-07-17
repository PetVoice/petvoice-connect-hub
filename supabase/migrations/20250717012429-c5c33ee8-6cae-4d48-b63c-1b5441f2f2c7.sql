-- Fix doppia commissione al primo pagamento - evita sia first_payment che recurring insieme
-- e logica cancellazione immediata sovrascrive quella a fine periodo

-- 1. Fix doppia commissione: modifica convert_referral per non creare commissioni ricorrenti al primo pagamento
CREATE OR REPLACE FUNCTION public.convert_referral(p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
  
  -- Crea commissione SOLO first_payment (non recurring)
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
$function$;

-- 2. Fix cancel subscription: cancellazione immediata deve sovrascrivere quella a fine periodo
CREATE OR REPLACE FUNCTION public.cancel_user_subscription(p_user_id uuid, p_immediate boolean DEFAULT false)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    effective_date TIMESTAMP WITH TIME ZONE;
BEGIN
    IF p_immediate THEN
        effective_date := NOW();
        -- Cancellazione immediata sovrascrive qualsiasi altra cancellazione pendente
        UPDATE public.subscribers 
        SET 
            is_cancelled = TRUE,
            cancellation_type = 'immediate',
            cancellation_date = NOW(),
            cancellation_effective_date = effective_date,
            subscription_status = 'cancelled',
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        -- Cancellazione a fine periodo solo se non c'è già una cancellazione immediata
        SELECT cancellation_effective_date INTO effective_date
        FROM public.subscribers 
        WHERE user_id = p_user_id;
        
        -- Solo se non c'è già una cancellazione immediata
        IF effective_date IS NULL OR effective_date > NOW() + INTERVAL '1 day' THEN
            effective_date := DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day';
            
            UPDATE public.subscribers 
            SET 
                is_cancelled = TRUE,
                cancellation_type = 'end_of_period',
                cancellation_date = NOW(),
                cancellation_effective_date = effective_date,
                subscription_status = 'pending_cancellation',
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;
    
    RETURN FOUND;
END;
$function$;