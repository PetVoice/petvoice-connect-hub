-- DISABILITA TUTTI I TRIGGER CHE CAUSANO CONFLITTI
-- Rimuovi trigger duplicati sulla tabella profiles
DROP TRIGGER IF EXISTS generate_referral_on_insert ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS normalize_profile_before_insert_update ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_data_normalize ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_insert_update_referral_stats ON public.profiles;
DROP TRIGGER IF EXISTS update_referral_stats_trigger ON public.profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Rimuovi trigger sulla tabella auth.users che potrebbero causare conflitti
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;
DROP TRIGGER IF EXISTS normalize_user_email ON auth.users;

-- Mantieni solo il trigger essenziale per la creazione dell'utente
-- Già presente: on_auth_user_created_simple che gestisce profilo + abbonamento

-- Ricrea SOLO il trigger per l'updated_at sui profiles
CREATE TRIGGER update_profiles_updated_at_simple
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();