-- Create calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'activity',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_all_day BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB,
  reminder_settings JSONB DEFAULT '{"enabled": true, "times": ["24h", "2h"]}'::jsonb,
  attendees TEXT[],
  cost DECIMAL(10,2),
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event templates table
CREATE TABLE public.event_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_duration INTERVAL,
  default_reminder_settings JSONB,
  template_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event notifications table
CREATE TABLE public.event_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_events
CREATE POLICY "Users can manage their pet events" 
ON public.calendar_events 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for event_templates
CREATE POLICY "Users can manage their templates" 
ON public.event_templates 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for event_notifications
CREATE POLICY "Users can view their notifications" 
ON public.event_notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_calendar_events_user_pet ON public.calendar_events(user_id, pet_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_category ON public.calendar_events(category);
CREATE INDEX idx_event_notifications_scheduled ON public.event_notifications(scheduled_for) WHERE status = 'pending';

-- Create trigger for updating timestamps
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for conflict detection
CREATE OR REPLACE FUNCTION public.detect_event_conflicts(
  p_user_id UUID,
  p_pet_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_exclude_event_id UUID DEFAULT NULL
)
RETURNS TABLE(
  conflicting_event_id UUID,
  conflicting_title TEXT,
  conflicting_start TIMESTAMP WITH TIME ZONE,
  conflicting_end TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.start_time,
    e.end_time
  FROM public.calendar_events e
  WHERE e.user_id = p_user_id 
    AND e.pet_id = p_pet_id
    AND e.status = 'scheduled'
    AND (p_exclude_event_id IS NULL OR e.id != p_exclude_event_id)
    AND (
      (e.start_time <= p_start_time AND e.end_time > p_start_time) OR
      (e.start_time < p_end_time AND e.end_time >= p_end_time) OR
      (e.start_time >= p_start_time AND e.end_time <= p_end_time)
    );
END;
$$;

-- Create function for generating recurring events
CREATE OR REPLACE FUNCTION public.generate_recurring_events(
  p_base_event_id UUID,
  p_end_date DATE DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_event RECORD;
  recurring_pattern JSONB;
  current_date DATE;
  event_count INTEGER := 0;
  max_occurrences INTEGER := 100;
BEGIN
  -- Get base event
  SELECT * INTO base_event 
  FROM public.calendar_events 
  WHERE id = p_base_event_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  recurring_pattern := base_event.recurring_pattern;
  
  IF recurring_pattern IS NULL THEN
    RETURN 0;
  END IF;
  
  current_date := (base_event.start_time + INTERVAL '1 day')::DATE;
  
  -- Generate recurring events based on pattern
  WHILE event_count < max_occurrences AND (p_end_date IS NULL OR current_date <= p_end_date) LOOP
    -- Calculate next occurrence based on pattern type
    CASE recurring_pattern->>'type'
      WHEN 'daily' THEN
        current_date := current_date + (recurring_pattern->>'interval')::INTEGER;
      WHEN 'weekly' THEN
        current_date := current_date + (7 * (recurring_pattern->>'interval')::INTEGER);
      WHEN 'monthly' THEN
        current_date := current_date + INTERVAL '1 month' * (recurring_pattern->>'interval')::INTEGER;
      WHEN 'yearly' THEN
        current_date := current_date + INTERVAL '1 year' * (recurring_pattern->>'interval')::INTEGER;
      ELSE
        EXIT;
    END CASE;
    
    -- Insert new recurring event
    INSERT INTO public.calendar_events (
      user_id, pet_id, title, description, location, category,
      start_time, end_time, is_all_day, reminder_settings,
      attendees, cost, notes, photo_urls
    ) VALUES (
      base_event.user_id,
      base_event.pet_id,
      base_event.title,
      base_event.description,
      base_event.location,
      base_event.category,
      current_date + (base_event.start_time::TIME),
      CASE 
        WHEN base_event.end_time IS NOT NULL 
        THEN current_date + (base_event.end_time::TIME)
        ELSE NULL
      END,
      base_event.is_all_day,
      base_event.reminder_settings,
      base_event.attendees,
      base_event.cost,
      base_event.notes,
      base_event.photo_urls
    );
    
    event_count := event_count + 1;
  END LOOP;
  
  RETURN event_count;
END;
$$;