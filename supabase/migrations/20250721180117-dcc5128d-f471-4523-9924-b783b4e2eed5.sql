-- RIMOZIONE COMPLETA SISTEMA DI AFFILIAZIONE

-- 1. Drop tutti i trigger relativi all'affiliazione
DROP TRIGGER IF EXISTS convert_registered_referrals ON public.subscribers;
DROP TRIGGER IF EXISTS process_monthly_renewals ON public.subscribers;
DROP TRIGGER IF EXISTS process_referral_conversion ON public.subscribers;

-- 2. Drop tutte le funzioni relative all'affiliazione
DROP FUNCTION IF EXISTS public.convert_registered_referrals();
DROP FUNCTION IF EXISTS public.process_monthly_renewals();
DROP FUNCTION IF EXISTS public.process_referral_conversion();
DROP FUNCTION IF EXISTS public.register_referral(uuid, text, text);
DROP FUNCTION IF EXISTS public.get_tier_info(integer);
DROP FUNCTION IF EXISTS public.generate_referral_code(text);
DROP FUNCTION IF EXISTS public.calculate_referral_tier(integer);

-- 3. Drop tutte le tabelle relative all'affiliazione
DROP TABLE IF EXISTS public.referral_commissions CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referrer_stats CASCADE;

-- 4. Remove colonne referral dalle tabelle esistenti  
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_code CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_count CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referred_by CASCADE;