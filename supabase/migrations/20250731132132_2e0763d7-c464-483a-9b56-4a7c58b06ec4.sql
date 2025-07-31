-- Temporaneamente creiamo una policy più permissiva per debug
DROP POLICY IF EXISTS "Users can upload avatars for their pets" ON storage.objects;

-- Policy temporanea più permissiva per pet avatars
CREATE POLICY "Temp pet avatar upload debug" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = 'pets'
);

-- Verifichiamo anche che la tabella pets abbia la giusta struttura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pets' 
AND column_name IN ('id', 'user_id');