-- Fix security issue: Set explicit search path for generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract username from email and create base code
  base_code := UPPER(SPLIT_PART(user_email, '@', 1));
  base_code := REGEXP_REPLACE(base_code, '[^A-Z0-9]', '', 'g');
  base_code := LEFT(base_code, 8);
  
  -- Add current year
  base_code := base_code || '2024';
  
  -- Check for uniqueness and add counter if needed
  final_code := base_code;
  WHILE EXISTS(SELECT 1 FROM public.user_referrals WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$;