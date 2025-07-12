-- Create storage policies for pet-media bucket
CREATE POLICY "Users can view their own pet media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own pet media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own pet media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pet media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pet-media' AND auth.uid()::text = (storage.foldername(name))[1]);