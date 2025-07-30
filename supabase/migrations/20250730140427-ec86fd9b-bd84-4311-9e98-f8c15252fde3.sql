-- Rimuovi le policy esistenti
DROP POLICY IF EXISTS "Users can view their own diary photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own diary photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own diary photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own diary photos" ON storage.objects;

DROP POLICY IF EXISTS "Users can view their own diary voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own diary voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own diary voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own diary voice notes" ON storage.objects;

-- Crea policy corrette per diary photos
CREATE POLICY "Users can view their own diary photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can upload their own diary photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can update their own diary photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can delete their own diary photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'diary-photos' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Crea policy corrette per diary voice notes
CREATE POLICY "Users can view their own diary voice notes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can upload their own diary voice notes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can update their own diary voice notes" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users can delete their own diary voice notes" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'diary-voice-notes' AND auth.uid()::text = (storage.foldername(name))[2]);