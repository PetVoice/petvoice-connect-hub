-- RIPRISTINO COMPLETO DEL SISTEMA DI AFFILIAZIONE

-- 1. Rimuovi tutti i trigger esistenti (per evitare duplicati)
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;
DROP TRIGGER IF EXISTS on_recurring_referral_commission ON public.subscribers;
DROP TRIGGER IF EXISTS on_first_referral_conversion ON public.subscribers;

-- 2. Crea il trigger per la registrazione degli utenti
CREATE TRIGGER on_auth_user_created_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();

-- 3. Crea il trigger per la conversione al primo pagamento
CREATE TRIGGER on_first_referral_conversion
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND 
        COALESCE(OLD.subscription_status, '') != 'active')
  EXECUTE FUNCTION public.process_first_referral_conversion();

-- 4. Crea il trigger per le commissioni ricorrenti
CREATE TRIGGER on_recurring_referral_commission
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND 
        OLD.subscription_status = 'active' AND
        NEW.current_period_end != OLD.current_period_end)
  EXECUTE FUNCTION public.process_recurring_referral_commission();

-- 5. Aggiorna le statistiche di tutti i referrer esistenti
SELECT update_all_referral_stats();

-- 6. Converte automaticamente i referral pending
SELECT auto_convert_pending_referrals();

-- 7. Verifica che i trigger siano attivi
SELECT 
  t.trigger_name,
  t.event_object_table,
  t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public' 
  AND t.event_object_table IN ('subscribers', 'auth')
ORDER BY t.event_object_table, t.trigger_name;