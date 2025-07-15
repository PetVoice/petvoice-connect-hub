-- CANCELLA TUTTI GLI ABBONAMENTI GRATUITI ESISTENTI
-- Solo utenti che NON hanno mai pagato con Stripe devono perdere l'accesso

-- Disattiva tutti gli abbonamenti che non hanno stripe_customer_id
UPDATE public.subscribers 
SET 
  subscription_status = 'inactive',
  is_cancelled = true,
  cancellation_type = 'trial_ended',
  cancellation_date = now(),
  cancellation_effective_date = now(),
  updated_at = now()
WHERE stripe_customer_id IS NULL 
  OR stripe_customer_id = '';

-- Log per tracciare l'operazione
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) 
SELECT 
  user_id,
  'subscription_trial_ended',
  'Trial period ended - subscription deactivated',
  jsonb_build_object(
    'reason', 'free_trial_cleanup',
    'previous_status', 'active',
    'new_status', 'inactive'
  )
FROM public.subscribers 
WHERE stripe_customer_id IS NULL 
  OR stripe_customer_id = '';