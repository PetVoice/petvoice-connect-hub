-- Fix RLS policies for storage.objects to allow voice messages and images
CREATE POLICY "Users can upload community files" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'pet-media' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view community files" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'pet-media');

-- Remove unwanted channels (General and Emergenze)
DELETE FROM public.community_channels 
WHERE name IN ('Generale', 'Emergenze');