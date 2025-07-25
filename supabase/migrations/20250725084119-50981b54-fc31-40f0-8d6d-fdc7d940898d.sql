-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit) 
VALUES ('medical-documents', 'medical-documents', true, 
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'], 
        10485760); -- 10MB limit

-- Create policies for medical documents bucket
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