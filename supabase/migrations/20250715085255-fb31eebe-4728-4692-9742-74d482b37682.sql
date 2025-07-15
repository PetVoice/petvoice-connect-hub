-- Community Messages Table
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
  is_emergency BOOLEAN DEFAULT FALSE,
  file_url TEXT,
  voice_duration INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community Channels Table
CREATE TABLE public.community_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('country', 'pet_type', 'breed', 'general')),
  country_code TEXT,
  pet_type TEXT CHECK (pet_type IN ('dog', 'cat', 'other')),
  breed TEXT,
  emoji TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Channel Subscriptions
CREATE TABLE public.user_channel_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- Community Notifications Table
CREATE TABLE public.community_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Local Alerts Table
CREATE TABLE public.local_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('health', 'emergency', 'environment', 'outbreak')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'emergency')),
  country_code TEXT NOT NULL,
  affected_species TEXT[],
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'false_report')),
  reports_count INTEGER DEFAULT 1,
  verified_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_messages
CREATE POLICY "Users can view messages in subscribed channels" ON public.community_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_channel_subscriptions 
    WHERE user_id = auth.uid() AND channel_id = community_messages.channel_id
  )
);

CREATE POLICY "Users can create messages in subscribed channels" ON public.community_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_channel_subscriptions 
    WHERE user_id = auth.uid() AND channel_id = community_messages.channel_id
  )
);

CREATE POLICY "Users can update own messages" ON public.community_messages
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.community_messages
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_channels
CREATE POLICY "Everyone can view active channels" ON public.community_channels
FOR SELECT USING (is_active = TRUE);

-- RLS Policies for user_channel_subscriptions
CREATE POLICY "Users can manage own subscriptions" ON public.user_channel_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for community_notifications
CREATE POLICY "Users can view own notifications" ON public.community_notifications
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for local_alerts
CREATE POLICY "Users can view all local alerts" ON public.local_alerts
FOR SELECT USING (TRUE);

CREATE POLICY "Users can create local alerts" ON public.local_alerts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON public.local_alerts
FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_messages_updated_at
  BEFORE UPDATE ON public.community_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_channels_updated_at
  BEFORE UPDATE ON public.community_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_local_alerts_updated_at
  BEFORE UPDATE ON public.local_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default channels
INSERT INTO public.community_channels (name, description, channel_type, emoji) VALUES
('🌍 Generale', 'Discussioni globali', 'general', '🌍'),
('🆘 Emergenze', 'Supporto crisi 24/7', 'general', '🆘');

-- Insert country channels
INSERT INTO public.community_channels (name, description, channel_type, country_code, emoji) VALUES
('🇮🇹 Italia', 'Community italiana', 'country', 'IT', '🇮🇹'),
('🇩🇪 Germania', 'Community tedesca', 'country', 'DE', '🇩🇪'),
('🇫🇷 Francia', 'Community francese', 'country', 'FR', '🇫🇷'),
('🇪🇸 Spagna', 'Community spagnola', 'country', 'ES', '🇪🇸'),
('🇬🇧 Regno Unito', 'Community britannica', 'country', 'GB', '🇬🇧'),
('🇺🇸 Stati Uniti', 'Community americana', 'country', 'US', '🇺🇸');

-- Insert pet type channels
INSERT INTO public.community_channels (name, description, channel_type, pet_type, emoji) VALUES
('🐕 Cani', 'Tutto sui cani', 'pet_type', 'dog', '🐕'),
('🐱 Gatti', 'Tutto sui gatti', 'pet_type', 'cat', '🐱');

-- Insert popular breed channels
INSERT INTO public.community_channels (name, description, channel_type, pet_type, breed, emoji) VALUES
('🦮 Golden Retriever', 'Gruppo Golden Retriever', 'breed', 'dog', 'Golden Retriever', '🦮'),
('🐕‍🦺 Labrador', 'Gruppo Labrador', 'breed', 'dog', 'Labrador', '🐕‍🦺'),
('🐕 Pastore Tedesco', 'Gruppo Pastore Tedesco', 'breed', 'dog', 'Pastore Tedesco', '🐕'),
('🐱 Persiano', 'Gruppo Persiano', 'breed', 'cat', 'Persiano', '🐱'),
('🐱 Siamese', 'Gruppo Siamese', 'breed', 'cat', 'Siamese', '🐱'),
('🐱 Maine Coon', 'Gruppo Maine Coon', 'breed', 'cat', 'Maine Coon', '🐱');