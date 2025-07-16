-- Aggiungi colonna channel_name per salvare l'ID del gruppo
ALTER TABLE public.user_channel_subscriptions 
ADD COLUMN channel_name TEXT;

-- Aggiorna i record esistenti con nomi dedotti dai channel_id
UPDATE public.user_channel_subscriptions 
SET channel_name = CASE 
  WHEN channel_id = '431765ff-b5fd-40ef-89ae-6a90856969bd' THEN 'it-general'
  WHEN channel_id = '330993f4-ab79-43fd-b142-137bf85ca2d5' THEN 'de-general'
  WHEN channel_id = '317c3e72-4e3f-4bdb-9b18-fe5b77a424ad' THEN 'fr-general'
  WHEN channel_id = 'dd748387-eae1-48c8-b273-dbaff73f5eef' THEN 'es-general'
  WHEN channel_id = '66e26573-b1d8-4aa7-816b-d961a0f80b2d' THEN 'gb-general'
  ELSE 'unknown-group'
END
WHERE channel_name IS NULL;