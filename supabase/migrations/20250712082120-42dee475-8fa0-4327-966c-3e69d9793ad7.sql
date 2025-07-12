-- Make pet-media bucket public for reading
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pet-media';