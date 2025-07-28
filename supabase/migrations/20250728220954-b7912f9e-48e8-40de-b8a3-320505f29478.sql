-- Modifica la funzione handle_payment_simple per essere sicura se le tabelle referrals non esistono
CREATE OR REPLACE FUNCTION public.handle_payment_simple()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  referral_record RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC := 0.97 * 0.05; -- 5% di default
BEGIN
  -- Controlla se le tabelle referrals esistono prima di procedere
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
    -- Se le tabelle referrals non esistono, ritorna senza fare nulla
    RETURN NEW;
  END IF;
  
  -- Solo quando subscription diventa attiva
  IF NEW.subscription_status = 'active' AND 
     COALESCE(OLD.subscription_status, '') != 'active' THEN
    
    -- Controlla anche se le altre tabelle esistono
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_referrals') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_credits') THEN
    
      -- Trova referral per questo utente
      SELECT * INTO referral_record
      FROM public.referrals
      WHERE referred_user_id = NEW.user_id 
        AND status = 'registered'
      LIMIT 1;
      
      IF referral_record IS NOT NULL THEN
        -- Aggiorna referral a convertito
        UPDATE public.referrals 
        SET 
          status = 'converted',
          conversion_date = now(),
          credits_awarded = credit_amount,
          updated_at = now()
        WHERE id = referral_record.id;
        
        -- Aggiorna statistiche referrer
        UPDATE public.user_referrals 
        SET 
          successful_conversions = successful_conversions + 1,
          total_credits_earned = total_credits_earned + credit_amount,
          updated_at = now()
        WHERE user_id = referral_record.referrer_id;
        
        -- Crea credito
        INSERT INTO public.referral_credits (
          user_id, 
          referral_id, 
          amount, 
          credit_type, 
          description, 
          status, 
          expires_at
        ) VALUES (
          referral_record.referrer_id,
          referral_record.id,
          credit_amount,
          'referral_conversion',
          'Credito per conversione referral',
          'active',
          now() + interval '24 months'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;