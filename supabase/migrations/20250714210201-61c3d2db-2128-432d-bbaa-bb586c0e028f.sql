-- Aggiungo i trigger per auth.users che sono fondamentali

-- 1. Trigger per gestione nuovi utenti
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger per gestione eliminazione utenti
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- 3. Trigger per gestione registrazione referral
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;
CREATE TRIGGER on_auth_user_referral_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_registration();