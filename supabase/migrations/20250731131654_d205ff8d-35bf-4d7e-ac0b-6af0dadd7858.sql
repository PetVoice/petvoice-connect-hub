-- Assicurati che il bucket avatars esista e possa contenere avatar di pet
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Crea policy per permettere agli utenti di vedere tutti gli avatar
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Crea policy per permettere agli utenti di caricare avatar per i loro pet
CREATE POLICY "Users can upload pet avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Per avatar utente: path inizia con user ID
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Per avatar pet: controlla che il pet appartenga all'utente
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id::text = (storage.foldername(name))[2] 
      AND pets.user_id = auth.uid()
    )
  )
);

-- Crea policy per permettere agli utenti di aggiornare avatar per i loro pet
CREATE POLICY "Users can update pet avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Per avatar utente: path inizia con user ID
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Per avatar pet: controlla che il pet appartenga all'utente
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id::text = (storage.foldername(name))[2] 
      AND pets.user_id = auth.uid()
    )
  )
);

-- Crea policy per permettere agli utenti di eliminare avatar per i loro pet
CREATE POLICY "Users can delete pet avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Per avatar utente: path inizia con user ID
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Per avatar pet: controlla che il pet appartenga all'utente
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id::text = (storage.foldername(name))[2] 
      AND pets.user_id = auth.uid()
    )
  )
);