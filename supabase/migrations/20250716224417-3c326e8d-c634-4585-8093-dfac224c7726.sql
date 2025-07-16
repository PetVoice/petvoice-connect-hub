-- FIX TRIGGER: Gestire referral anche senza email nel subscriber
-- Il problema è che il trigger cerca per email ma il subscriber di Salvatore ha email NULL

-- Prima aggiorno l'email mancante per Salvatore
UPDATE public.subscribers 
SET email = 'salvatore8949@outlook.it'
WHERE user_id = '67b7cee3-7939-424d-974e-105027fc387b';

-- Ora converto automaticamente il referral di Salvatore (trigger che doveva partire)
WITH converted_referral AS (
  UPDATE public.referrals 
  SET 
    status = 'converted',
    conversion_date = now(),
    credits_awarded = 0.05,
    updated_at = now()
  WHERE id = '0f15b5a6-b439-48eb-b8e8-4cbc9e784571'
    AND status = 'registered'
  RETURNING *
)
-- Aggiorna stats Giuseppe
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Crea credito per Giuseppe
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- Giuseppe
  '0f15b5a6-b439-48eb-b8e8-4cbc9e784571',  -- Referral Salvatore
  0.05,
  'automatic_conversion',
  'Conversione automatica: salvatore8949@outlook.it (Bronzo 5%)',
  'active',
  now() + interval '24 months'
);

-- MIGLIORA IL TRIGGER per gestire casi con email NULL
CREATE OR REPLACE FUNCTION public.process_first_referral_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  referral_record RECORD;
  tier_info jsonb;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  subscription_amount NUMERIC := 0.97;
  user_email TEXT;
BEGIN
  -- Solo al PRIMO pagamento (conversione da registered a converted)
  IF NEW.subscription_status = 'active' AND 
     (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active') THEN
    
    -- Ottieni email dal auth.users se non presente nel subscriber
    IF NEW.email IS NULL THEN
      SELECT au.email INTO user_email 
      FROM auth.users au 
      WHERE au.id = NEW.user_id;
    ELSE
      user_email := NEW.email;
    END IF;
    
    -- Trova referral "registered" per questo utente - CERCA PER USER_ID E EMAIL
    SELECT * INTO referral_record
    FROM public.referrals 
    WHERE status = 'registered'  -- Solo quelli non ancora convertiti
      AND (referred_user_id = NEW.user_id OR 
           (user_email IS NOT NULL AND referred_email = user_email))
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record.id IS NOT NULL THEN
      
      -- CONVERTE il referral
      UPDATE public.referrals 
      SET 
        status = 'converted',
        conversion_date = now(),
        referred_user_id = NEW.user_id,
        credits_awarded = subscription_amount * 0.05,
        updated_at = now()
      WHERE id = referral_record.id;
      
      -- Aggiorna/crea user_referrals
      INSERT INTO public.user_referrals (
        user_id, referral_code, total_referrals, successful_conversions, 
        total_credits_earned, current_tier
      ) VALUES (
        referral_record.referrer_id,
        COALESCE(referral_record.referral_code, 'REF_' || LEFT(referral_record.referrer_id::text, 8)),
        1, 1, 0, 'Bronzo'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        successful_conversions = user_referrals.successful_conversions + 1,
        updated_at = now();
      
      -- Calcola tier aggiornato
      SELECT calculate_referral_tier(
        (SELECT successful_conversions FROM public.user_referrals WHERE user_id = referral_record.referrer_id)
      ) INTO tier_info;
      
      commission_rate := (tier_info->>'commission')::NUMERIC;
      commission_amount := subscription_amount * commission_rate;
      
      -- Aggiorna tier e commissione
      UPDATE public.user_referrals 
      SET 
        current_tier = tier_info->>'tier',
        total_credits_earned = total_credits_earned + commission_amount,
        updated_at = now()
      WHERE user_id = referral_record.referrer_id;
      
      -- Crea credito
      INSERT INTO public.referral_credits (
        user_id, referral_id, amount, credit_type, description, status, expires_at
      ) VALUES (
        referral_record.referrer_id,
        referral_record.id,
        commission_amount,
        'first_conversion',
        'Prima conversione: ' || COALESCE(user_email, NEW.user_id::text) || 
        ' (' || (tier_info->>'tier') || ' ' || ROUND(commission_rate * 100) || '%)',
        'active',
        now() + interval '24 months'
      );
      
      -- Log conversione
      INSERT INTO public.activity_log (
        user_id, activity_type, activity_description, metadata
      ) VALUES (
        referral_record.referrer_id,
        'referral_first_converted',
        'Cliente convertito: +€' || commission_amount || ' (' || (tier_info->>'tier') || ')',
        jsonb_build_object(
          'referral_id', referral_record.id,
          'commission_amount', commission_amount,
          'commission_rate', commission_rate,
          'tier', tier_info->>'tier',
          'referred_user', COALESCE(user_email, NEW.user_id::text)
        )
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;