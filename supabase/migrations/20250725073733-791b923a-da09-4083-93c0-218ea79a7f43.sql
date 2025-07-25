-- Policy per medical-documents bucket
CREATE POLICY "Authenticated users can upload medical documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own medical documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own medical documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'medical-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own medical documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy per insurance-documents bucket
CREATE POLICY "Authenticated users can upload insurance documents" ON storage.objects
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