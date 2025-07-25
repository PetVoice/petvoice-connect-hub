-- Aggiorna medical-documents bucket con mime types
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  file_size_limit = 52428800
WHERE id = 'medical-documents';

-- Policy per insurance-documents bucket
CREATE POLICY "Users can upload their own insurance documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'insurance-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own insurance documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'insurance-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own insurance documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'insurance-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own insurance documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'insurance-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );