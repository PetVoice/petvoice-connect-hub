-- Create storage policies for pet-media bucket to allow authenticated users to upload and access their files

-- Policy for users to upload their own files
CREATE POLICY "Users can upload their own pet analysis files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'pet-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own files
CREATE POLICY "Users can view their own pet analysis files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'pet-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to update their own files
CREATE POLICY "Users can update their own pet analysis files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'pet-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own files
CREATE POLICY "Users can delete their own pet analysis files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'pet-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);