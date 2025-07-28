-- Fix webhook errors by disabling referral triggers until referrals tables are properly set up

-- Drop trigger that causes referrals table errors
DROP TRIGGER IF EXISTS on_profile_insert_update_referral_stats ON public.profiles;

-- Modify update_referral_stats function to be safe if referrals table doesn't exist
CREATE OR REPLACE FUNCTION public.update_referral_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Check if referrals table exists before trying to access it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
    -- Only if the table exists, check for profiles referrals
    IF TG_TABLE_NAME = 'profiles' AND NEW.referred_by IS NOT NULL THEN
      -- Incrementa contatore referral
      UPDATE public.user_referrals 
      SET 
        total_referrals = COALESCE(total_referrals, 0) + 1,
        updated_at = NOW()
      WHERE referral_code = NEW.referred_by;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;