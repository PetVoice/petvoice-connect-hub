-- Continuo con i trigger rimanenti

-- 5. Trigger per pet_wellness_scores
DROP TRIGGER IF EXISTS on_wellness_score_calculate ON public.pet_wellness_scores;
CREATE TRIGGER on_wellness_score_calculate
  BEFORE INSERT OR UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.calculate_wellness_score();

DROP TRIGGER IF EXISTS update_pet_wellness_scores_updated_at ON public.pet_wellness_scores;
CREATE TRIGGER update_pet_wellness_scores_updated_at
  BEFORE UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Trigger per subscribers (gestione referral)
DROP TRIGGER IF EXISTS on_subscription_conversion ON public.subscribers;
CREATE TRIGGER on_subscription_conversion
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_conversion();

DROP TRIGGER IF EXISTS on_subscription_monthly_credit ON public.subscribers;
CREATE TRIGGER on_subscription_monthly_credit
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_monthly_credit();

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Trigger per user_referrals
DROP TRIGGER IF EXISTS update_user_referrals_updated_at ON public.user_referrals;
CREATE TRIGGER update_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Trigger per altre tabelle con updated_at
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_metrics_updated_at ON public.health_metrics;
CREATE TRIGGER update_health_metrics_updated_at
  BEFORE UPDATE ON public.health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_medications_updated_at ON public.medications;
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pet_insurance_updated_at ON public.pet_insurance;
CREATE TRIGGER update_pet_insurance_updated_at
  BEFORE UPDATE ON public.pet_insurance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_veterinarians_updated_at ON public.veterinarians;
CREATE TRIGGER update_veterinarians_updated_at
  BEFORE UPDATE ON public.veterinarians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON public.emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrals_updated_at ON public.referrals;
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();