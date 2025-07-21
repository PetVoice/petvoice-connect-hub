-- RIMOZIONE COMPLETA SISTEMA DI AFFILIAZIONE - ORDINE CORRETTO

-- 1. Prima elimina TUTTI i trigger che dipendono dalle funzioni
DROP TRIGGER IF EXISTS convert_registered_referrals ON public.subscribers;
DROP TRIGGER IF EXISTS convert_registered_to_converted ON public.subscribers;
DROP TRIGGER IF EXISTS process_monthly_renewals ON public.subscribers;
DROP TRIGGER IF EXISTS process_referral_conversion ON public.subscribers;
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS referral_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_first_referral_conversion ON public.subscribers;
DROP TRIGGER IF EXISTS on_recurring_referral_commission ON public.subscribers;

-- 2. Poi elimina le funzioni (ora senza dipendenze)
DROP FUNCTION IF EXISTS public.convert_registered_referrals() CASCADE;
DROP FUNCTION IF EXISTS public.process_monthly_renewals() CASCADE;
DROP FUNCTION IF EXISTS public.process_referral_conversion() CASCADE;
DROP FUNCTION IF EXISTS public.register_referral(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_tier_info(integer) CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_code(text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_referral_tier(integer) CASCADE;
DROP FUNCTION IF EXISTS public.handle_referral_payment() CASCADE;
DROP FUNCTION IF EXISTS public.process_first_referral_conversion() CASCADE;
DROP FUNCTION IF EXISTS public.handle_complete_user_registration() CASCADE;

-- 3. Elimina tutte le tabelle relative all'affiliazione
DROP TABLE IF EXISTS public.referral_commissions CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referrer_stats CASCADE;
DROP TABLE IF EXISTS public.user_referrals CASCADE;
DROP TABLE IF EXISTS public.referral_credits CASCADE;

-- 4. Remove colonne referral dalle tabelle esistenti  
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_code CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_count CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referred_by CASCADE;