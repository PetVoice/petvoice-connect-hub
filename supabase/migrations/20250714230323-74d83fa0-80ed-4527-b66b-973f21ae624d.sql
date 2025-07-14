-- Debug: verifica i dati prima di eseguire la logica
DO $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
BEGIN
  -- Debug 1: trova il referral
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referred_user_id = '075d7147-68a4-4f33-b72f-e85206c5b227'
    AND status = 'registered';
  
  RAISE NOTICE 'Referral trovato: %', referral_record;
  
  IF referral_record IS NOT NULL THEN
    -- Debug 2: trova il referrer profile
    SELECT * INTO referrer_profile
    FROM public.user_referrals
    WHERE user_id = referral_record.referrer_id;
    
    RAISE NOTICE 'Referrer profile trovato: %', referrer_profile;
    
    -- Esegui la conversione
    UPDATE public.referrals 
    SET 
      status = 'converted',
      conversion_date = now(),
      credits_awarded = 0.97 * 0.05, -- Bronzo tier
      updated_at = now()
    WHERE id = referral_record.id;
    
    RAISE NOTICE 'Referral aggiornato';
    
    -- Aggiungi i crediti
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
      0.97 * 0.05,
      'referral_conversion',
      'Credito per primo pagamento referral: ' || referral_record.referred_email,
      'active',
      now() + interval '24 months'
    );
    
    RAISE NOTICE 'Credito inserito';
    
    -- Aggiorna le statistiche
    UPDATE public.user_referrals 
    SET 
      successful_conversions = successful_conversions + 1,
      total_credits_earned = total_credits_earned + (0.97 * 0.05),
      current_tier = 'Bronzo',
      updated_at = now()
    WHERE user_id = referrer_profile.user_id;
    
    RAISE NOTICE 'Statistiche aggiornate';
  ELSE
    RAISE NOTICE 'Nessun referral trovato';
  END IF;
END $$;