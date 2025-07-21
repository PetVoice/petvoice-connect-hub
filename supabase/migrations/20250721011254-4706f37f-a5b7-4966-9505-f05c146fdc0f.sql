-- Inserisci i profili mancanti per far funzionare il Pet Matching
INSERT INTO public.profiles (user_id, display_name) 
VALUES 
  ('5d336311-bfc2-40f4-8cd8-3ad17bd246d5', 'Giuseppe R.'),
  ('a5209243-97c9-4ff3-a129-9ac3d968413e', 'Salvatore M.')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  updated_at = NOW();