-- Fix storage policies for document upload
-- Create policy for pet-media bucket to allow authenticated users to upload files

-- Allow authenticated users to insert files in pet-media bucket
CREATE POLICY "Allow authenticated uploads to pet-media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-media' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to select their own files
CREATE POLICY "Allow users to view their own files in pet-media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-media' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own files in pet-media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-media' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files in pet-media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-media' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);