-- Create table for storing integration tokens and settings
CREATE TABLE public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'calendar' or 'health'
  provider TEXT NOT NULL, -- 'google', 'apple', 'microsoft'
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_integration UNIQUE(user_id, integration_type, provider)
);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own integrations"
ON public.user_integrations
FOR ALL
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_integrations_user_provider ON public.user_integrations(user_id, integration_type, provider);

-- Create trigger for updated_at
CREATE TRIGGER update_user_integrations_updated_at
BEFORE UPDATE ON public.user_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for synced calendar events
CREATE TABLE public.synced_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_id UUID NOT NULL REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  calendar_event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  sync_status TEXT DEFAULT 'synced',
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_external_event UNIQUE(integration_id, external_event_id)
);

-- Enable RLS
ALTER TABLE public.synced_calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their synced events"
ON public.synced_calendar_events
FOR ALL
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_synced_events_integration ON public.synced_calendar_events(integration_id);

-- Create table for health data sync
CREATE TABLE public.health_data_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  integration_id UUID NOT NULL REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'activity', 'weight', 'sleep', etc.
  external_data_id TEXT,
  sync_status TEXT DEFAULT 'synced',
  data_value JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_external_health_data UNIQUE(integration_id, external_data_id)
);

-- Enable RLS
ALTER TABLE public.health_data_sync ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their health sync data"
ON public.health_data_sync
FOR ALL
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_health_sync_integration ON public.health_data_sync(integration_id);
CREATE INDEX idx_health_sync_pet ON public.health_data_sync(pet_id);