-- Verifica esistenza bucket e assicurati che sia pubblico
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';