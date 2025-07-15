-- Fix RLS policies for community messages and storage
-- Allow users to insert messages in channels they're subscribed to
DROP POLICY IF EXISTS "Users can create messages in subscribed channels" ON community_messages;
CREATE POLICY "Users can create messages in subscribed channels" 
ON community_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix storage policies for pet-media bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-media', 'pet-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community uploads
CREATE POLICY "Users can upload to pet-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pet-media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view pet-media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-media');

-- Enable realtime for community_messages
ALTER TABLE community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;