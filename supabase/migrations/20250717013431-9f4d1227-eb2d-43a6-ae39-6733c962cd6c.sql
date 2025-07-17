-- Aggiorna la funzione convert_referral per gestire le riattivazioni
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
  is_reactivation BOOLEAN := false;
BEGIN
  -- Trova referral anche se era stato cancellato (per riattivazioni)
  SELECT * INTO referral_rec
  FROM public.referrals
  WHERE (referred_user_id = p_user_id OR referred_email = p_email)
    AND status IN ('registered', 'converted', 'cancelled')  -- Include anche cancellati
    AND is_active = true  -- Solo referral attivi
  ORDER BY 
    CASE status 
      WHEN 'converted' THEN 1 
      WHEN 'registered' THEN 2 
      WHEN 'cancelled' THEN 3 
    END,
    created_at DESC
  LIMIT 1;
  
  IF referral_rec.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No active referral found');
  END IF;
  
  -- Verifica che il referrer esista ancora
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = referral_rec.referrer_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Referrer account no longer exists');
  END IF;

  -- Determina se è una riattivazione
  is_reactivation := (referral_rec.status = 'cancelled');

  -- Riattiva il referral se era cancellato
  UPDATE public.referrals
  SET status = 'converted', 
      converted_at = NOW(),
      referred_user_id = p_user_id,
      is_active = true  -- Riattiva se necessario
  WHERE id = referral_rec.id;
  
  -- Aggiorna o incrementa statistiche referrer
  IF is_reactivation THEN
    -- Per riattivazioni, non incrementare total_conversions ma aggiorna la data
    UPDATE public.referrer_stats
    SET updated_at = NOW()
    WHERE user_id = referral_rec.referrer_id;
  ELSE
    -- Per nuove conversioni, incrementa total_conversions
    UPDATE public.referrer_stats
    SET total_conversions = total_conversions + 1,
        updated_at = NOW()
    WHERE user_id = referral_rec.referrer_id;
  END IF;
  
  -- Calcola tier corrente (sempre in base ai totali attuali)
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
  
  -- Crea commissione (first_payment per nuovi, recurring per riattivazioni)
  INSERT INTO public.referral_commissions (
    referrer_id, referred_user_id, amount, commission_rate, tier,
    commission_type, subscription_amount, billing_period_start, billing_period_end
  ) VALUES (
    referral_rec.referrer_id, p_user_id, commission_amount, tier_info.rate, tier_info.tier,
    CASE WHEN is_reactivation THEN 'recurring' ELSE 'first_payment' END,
    subscription_amount, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'
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
    'rate', tier_info.rate,
    'is_reactivation', is_reactivation,
    'commission_type', CASE WHEN is_reactivation THEN 'recurring' ELSE 'first_payment' END
  );
  
  RETURN result;
END;
$function$;