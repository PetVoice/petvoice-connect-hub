-- Create storage buckets for medical documents and insurance documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('medical-documents', 'medical-documents', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('insurance-documents', 'insurance-documents', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for medical documents
CREATE POLICY "Users can upload their own medical documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own medical documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own medical documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for insurance documents  
CREATE POLICY "Users can upload their own insurance documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'insurance-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own insurance documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'insurance-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own insurance documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'insurance-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own insurance documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'insurance-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);