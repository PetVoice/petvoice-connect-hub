-- Chiamata diretta per cancellare l'abbonamento test
-- Questo è un SQL che simula la chiamata all'edge function
SELECT 'Abbonamento su Stripe per mariolana12321@hotmail.com deve essere cancellato manualmente tramite edge function' as note;

-- Nel frattempo, forziamo l'aggiornamento del database
UPDATE public.subscribers 
SET 
  subscription_status = 'cancelled',
  subscription_end_date = now(),
  updated_at = now()
WHERE stripe_customer_id = 'cus_Sh09UpXvDikVH0';

-- Verifica che l'aggiornamento sia stato effettuato
SELECT 
  'Abbonamento aggiornato nel database' as status,
  subscription_status,
  subscription_end_date
FROM public.subscribers 
WHERE stripe_customer_id = 'cus_Sh09UpXvDikVH0';