-- Create the missing insurance-documents bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('insurance-documents', 'insurance-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for insurance-documents bucket
CREATE POLICY "Allow authenticated users to upload insurance documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view their own insurance documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own insurance documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own insurance documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);