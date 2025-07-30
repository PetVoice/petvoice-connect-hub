-- Create storage buckets for diary photos and voice notes
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-photos', 'diary-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-voice-notes', 'diary-voice-notes', true);

-- Create policies for diary photos bucket
CREATE POLICY "Users can view their own diary photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own diary photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own diary photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own diary photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for diary voice notes bucket
CREATE POLICY "Users can view their own diary voice notes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own diary voice notes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own diary voice notes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own diary voice notes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);