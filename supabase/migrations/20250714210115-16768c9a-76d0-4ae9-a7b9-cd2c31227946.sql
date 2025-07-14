-- Ricreo i trigger usando DROP IF EXISTS per evitare errori

-- 1. Trigger per profiles
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_on_profile_creation();

DROP TRIGGER IF EXISTS on_profile_insert_update_referral_stats ON public.profiles;
CREATE TRIGGER on_profile_insert_update_referral_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_stats();

DROP TRIGGER IF EXISTS on_profile_data_normalize ON public.profiles;
CREATE TRIGGER on_profile_data_normalize
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_data();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Trigger per pets
DROP TRIGGER IF EXISTS on_pet_activity_log ON public.pets;
CREATE TRIGGER on_pet_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.log_pet_activity();

DROP TRIGGER IF EXISTS on_pet_data_validate ON public.pets;
CREATE TRIGGER on_pet_data_validate
  BEFORE INSERT OR UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.validate_pet_data();

DROP TRIGGER IF EXISTS update_pets_updated_at ON public.pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Trigger per pet_analyses
DROP TRIGGER IF EXISTS on_analysis_log ON public.pet_analyses;
CREATE TRIGGER on_analysis_log
  AFTER INSERT ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.log_analysis_activity();

DROP TRIGGER IF EXISTS update_pet_analyses_updated_at ON public.pet_analyses;
CREATE TRIGGER update_pet_analyses_updated_at
  BEFORE UPDATE ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger per diary_entries
DROP TRIGGER IF EXISTS on_diary_activity_log ON public.diary_entries;
CREATE TRIGGER on_diary_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_diary_activity();

DROP TRIGGER IF EXISTS on_diary_data_validate ON public.diary_entries;
CREATE TRIGGER on_diary_data_validate
  BEFORE INSERT OR UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_diary_entry();

DROP TRIGGER IF EXISTS on_diary_notifications ON public.diary_entries;
CREATE TRIGGER on_diary_notifications
  AFTER INSERT ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.generate_notifications();