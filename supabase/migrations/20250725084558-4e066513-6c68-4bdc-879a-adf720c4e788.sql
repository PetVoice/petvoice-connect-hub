-- Update bucket to be private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'medical-documents';

-- Update policies to work with private bucket
DROP POLICY IF EXISTS "Users can view their own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical documents" ON storage.objects;

-- Create new policies for private bucket
CREATE POLICY "Users can view their own medical documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own medical documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own medical documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own medical documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);