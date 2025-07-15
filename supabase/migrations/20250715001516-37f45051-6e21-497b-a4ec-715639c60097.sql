-- CANCELLA TUTTI GLI ABBONAMENTI GRATUITI CON TIPO VALIDO
-- Solo utenti che NON hanno mai pagato con Stripe devono perdere l'accesso

-- Disattiva tutti gli abbonamenti che non hanno stripe_customer_id
UPDATE public.subscribers 
SET 
  subscription_status = 'cancelled',
  is_cancelled = true,
  cancellation_type = 'immediate',
  cancellation_date = now(),
  cancellation_effective_date = now(),
  updated_at = now()
WHERE stripe_customer_id IS NULL 
  OR stripe_customer_id = '';

-- Verifica quanti abbonamenti sono stati cancellati
SELECT COUNT(*) as cancelled_subscriptions 
FROM public.subscribers 
WHERE subscription_status = 'cancelled' 
  AND cancellation_type = 'immediate';