-- Crea bucket per media dei canali
INSERT INTO storage.buckets (id, name, public) 
VALUES ('channel-media', 'channel-media', true)
ON CONFLICT (id) DO NOTHING;

-- Politiche per il bucket channel-media
CREATE POLICY "Anyone can view channel media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'channel-media');

CREATE POLICY "Users can upload channel media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own channel media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own channel media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'channel-media' AND auth.uid() IS NOT NULL);