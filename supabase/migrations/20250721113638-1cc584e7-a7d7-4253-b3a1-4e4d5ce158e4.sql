-- Create user_channel_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_channel_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id UUID,
  channel_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, channel_id),
  UNIQUE(user_id, channel_name)
);

-- Enable RLS
ALTER TABLE public.user_channel_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own subscriptions" 
ON public.user_channel_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create the pet-connections channel
INSERT INTO public.community_channels (
  id,
  name,
  description,
  channel_type,
  emoji,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'pet-connections',
  'Canale per richieste di connessione tra proprietari di animali',
  'pet_connections',
  '🐾',
  true
) ON CONFLICT (id) DO NOTHING;