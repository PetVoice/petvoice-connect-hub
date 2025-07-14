-- Esegui manualmente la logica di referral payment per il caso esistente
DO $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97;
  calculated_tier TEXT;
  referrer_conversions INTEGER;
BEGIN
  -- Cerca il referral record
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referred_user_id = '075d7147-68a4-4f33-b72f-e85206c5b227'
    AND status = 'registered'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF referral_record IS NOT NULL THEN
    -- Ottieni profilo referrer
    SELECT * INTO referrer_profile
    FROM public.user_referrals
    WHERE user_id = referral_record.referrer_id;
    
    IF referrer_profile IS NOT NULL THEN
      -- Calcola tier e commissione
      referrer_conversions := referrer_profile.successful_conversions;
      
      IF referrer_conversions >= 50 THEN
        calculated_tier := 'Platino';
        tier_commission := 0.20;
      ELSIF referrer_conversions >= 20 THEN
        calculated_tier := 'Oro';
        tier_commission := 0.15;
      ELSIF referrer_conversions >= 5 THEN
        calculated_tier := 'Argento';
        tier_commission := 0.10;
      ELSE
        calculated_tier := 'Bronzo';
        tier_commission := 0.05;
      END IF;
      
      credit_amount := subscription_amount * tier_commission;
      
      -- Aggiorna referral status
      UPDATE public.referrals 
      SET 
        status = 'converted',
        conversion_date = now(),
        credits_awarded = credit_amount,
        updated_at = now()
      WHERE id = referral_record.id;
      
      -- Aggiungi crediti
      INSERT INTO public.referral_credits (
        user_id,
        referral_id,
        amount,
        credit_type,
        description,
        status,
        expires_at
      ) VALUES (
        referrer_profile.user_id,
        referral_record.id,
        credit_amount,
        'referral_conversion',
        'Credito per primo pagamento referral: ' || referral_record.referred_email,
        'active',
        now() + interval '24 months'
      );
      
      -- Aggiorna statistiche referrer
      UPDATE public.user_referrals 
      SET 
        successful_conversions = successful_conversions + 1,
        total_credits_earned = total_credits_earned + credit_amount,
        current_tier = calculated_tier,
        updated_at = now()
      WHERE user_id = referrer_profile.user_id;
      
      -- Log
      INSERT INTO public.activity_log (
        user_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (
        referrer_profile.user_id,
        'referral_first_payment',
        'Primo pagamento referral: ' || referral_record.referred_email || ' (+€' || credit_amount || ')',
        jsonb_build_object(
          'referred_email', referral_record.referred_email,
          'referred_user_id', referral_record.referred_user_id,
          'credit_amount', credit_amount,
          'tier_commission', tier_commission,
          'tier', calculated_tier,
          'payment_type', 'first_payment'
        )
      );
    END IF;
  END IF;
END $$;