-- Elimina le policy esistenti problematiche
DROP POLICY IF EXISTS "Users can upload pet avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update pet avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete pet avatars" ON storage.objects;

-- Crea policy corrette per avatar di pet con path pets/{pet_id}/filename
CREATE POLICY "Users can upload avatars for their pets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Per avatar utente: path inizia con user ID (path user_id/filename)
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Per avatar pet: path pets/{pet_id}/filename dove pet appartiene all'utente
    (
      (storage.foldername(name))[1] = 'pets' AND
      EXISTS (
        SELECT 1 FROM public.pets 
        WHERE pets.id::text = (storage.foldername(name))[2] 
        AND pets.user_id = auth.uid()
      )
    )
  )
);

-- Policy per aggiornare avatar pet
CREATE POLICY "Users can update avatars for their pets" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Per avatar utente: path inizia con user ID
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Per avatar pet: path pets/{pet_id}/filename dove pet appartiene all'utente
    (
      (storage.foldername(name))[1] = 'pets' AND
      EXISTS (
        SELECT 1 FROM public.pets 
        WHERE pets.id::text = (storage.foldername(name))[2] 
        AND pets.user_id = auth.uid()
      )
    )
  )
);

-- Policy per eliminare avatar pet
CREATE POLICY "Users can delete avatars for their pets" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (
    -- Per avatar utente: path inizia con user ID
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Per avatar pet: path pets/{pet_id}/filename dove pet appartiene all'utente
    (
      (storage.foldername(name))[1] = 'pets' AND
      EXISTS (
        SELECT 1 FROM public.pets 
        WHERE pets.id::text = (storage.foldername(name))[2] 
        AND pets.user_id = auth.uid()
      )
    )
  )
);