-- Creo tutti i trigger necessari per il corretto funzionamento dell'app

-- 1. Trigger per auth.users (gestione nuovi utenti e cancellazioni)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- 2. Trigger per profiles
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

-- 3. Trigger per pets
CREATE TRIGGER on_pet_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.log_pet_activity();

CREATE TRIGGER on_pet_data_validate
  BEFORE INSERT OR UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.validate_pet_data();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger per pet_analyses
CREATE TRIGGER on_analysis_log
  AFTER INSERT ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.log_analysis_activity();

CREATE TRIGGER update_pet_analyses_updated_at
  BEFORE UPDATE ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Trigger per diary_entries
CREATE TRIGGER on_diary_activity_log
  AFTER INSERT OR UPDATE OR DELETE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_diary_activity();

CREATE TRIGGER on_diary_data_validate
  BEFORE INSERT OR UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_diary_entry();

CREATE TRIGGER on_diary_notifications
  AFTER INSERT ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.generate_notifications();

-- 6. Trigger per pet_wellness_scores
CREATE TRIGGER on_wellness_score_calculate
  BEFORE INSERT OR UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.calculate_wellness_score();

CREATE TRIGGER update_pet_wellness_scores_updated_at
  BEFORE UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Trigger per subscribers (gestione referral)
CREATE TRIGGER on_subscription_conversion
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_conversion();

CREATE TRIGGER on_subscription_monthly_credit
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_monthly_credit();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Trigger per auth.users (gestione registrazione referral)
CREATE TRIGGER on_auth_user_referral_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_registration();

-- 9. Trigger per altre tabelle che hanno updated_at
CREATE TRIGGER update_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at
  BEFORE UPDATE ON public.health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_insurance_updated_at
  BEFORE UPDATE ON public.pet_insurance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_veterinarians_updated_at
  BEFORE UPDATE ON public.veterinarians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();