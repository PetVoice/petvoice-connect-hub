-- Creo solo i trigger per le tabelle public che sicuramente non esistono

-- 1. Trigger per profiles
CREATE TRIGGER on_profile_created
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_on_profile_creation();

CREATE TRIGGER on_profile_insert_update_referral_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_stats();

CREATE TRIGGER on_profile_data_normalize
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_data();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Trigger per pets
CREATE TRIGGER on_pet_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.log_pet_activity();

CREATE TRIGGER on_pet_data_validate
  BEFORE INSERT OR UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.validate_pet_data();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Trigger per pet_analyses
CREATE TRIGGER on_analysis_log
  AFTER INSERT ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.log_analysis_activity();

CREATE TRIGGER update_pet_analyses_updated_at
  BEFORE UPDATE ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger per diary_entries
CREATE TRIGGER on_diary_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_diary_activity();

CREATE TRIGGER on_diary_data_validate
  BEFORE INSERT OR UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_diary_entry();

CREATE TRIGGER on_diary_notifications
  AFTER INSERT ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.generate_notifications();

-- 5. Trigger per pet_wellness_scores
CREATE TRIGGER on_wellness_score_calculate
  BEFORE INSERT OR UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.calculate_wellness_score();

CREATE TRIGGER update_pet_wellness_scores_updated_at
  BEFORE UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();