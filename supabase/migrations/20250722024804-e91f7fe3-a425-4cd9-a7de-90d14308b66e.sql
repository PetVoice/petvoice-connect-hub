-- Fix security warnings: Set search_path for all functions that don't have it
-- This prevents potential security vulnerabilities by ensuring functions use a specific search path

-- 1. Fix generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character code
        code := upper(
            substring(
                md5(random()::text || clock_timestamp()::text) 
                from 1 for 8
            )
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT exists_check;
    END LOOP;
    
    RETURN code;
END;
$function$;

-- 2. Fix get_tier_info function
CREATE OR REPLACE FUNCTION public.get_tier_info(conversions_count integer)
 RETURNS TABLE(tier text, rate numeric, name text, min_conversions integer, benefits text[])
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  CASE 
    WHEN conversions_count >= 50 THEN
      RETURN QUERY SELECT 'diamond'::text, 0.25::numeric, 'Diamond Partner'::text, 50, 
                         ARRAY['25% commissioni', 'Supporto dedicato', 'Crediti bonus', 'Accesso beta']::text[];
    WHEN conversions_count >= 20 THEN
      RETURN QUERY SELECT 'platinum'::text, 0.20::numeric, 'Platinum Partner'::text, 20,
                         ARRAY['20% commissioni', 'Supporto prioritario', 'Crediti bonus']::text[];
    WHEN conversions_count >= 10 THEN
      RETURN QUERY SELECT 'gold'::text, 0.15::numeric, 'Gold Partner'::text, 10,
                         ARRAY['15% commissioni', 'Supporto migliorato']::text[];
    WHEN conversions_count >= 5 THEN
      RETURN QUERY SELECT 'silver'::text, 0.10::numeric, 'Silver Partner'::text, 5,
                         ARRAY['10% commissioni', 'Accesso community']::text[];
    ELSE
      RETURN QUERY SELECT 'bronze'::text, 0.05::numeric, 'Bronze Partner'::text, 0,
                         ARRAY['5% commissioni base']::text[];
  END CASE;
END;
$function$;

-- 3. Fix get_user_tier function  
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
 RETURNS TABLE(tier text, rate numeric, name text, min_conversions integer, benefits text[], current_conversions integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  user_conversions INTEGER;
BEGIN
  -- Get user's total conversions
  SELECT COALESCE(total_conversions, 0) INTO user_conversions
  FROM public.referrer_stats
  WHERE user_id = p_user_id;
  
  -- If no stats found, assume 0 conversions
  IF user_conversions IS NULL THEN
    user_conversions := 0;
  END IF;
  
  -- Return tier info with current conversions
  RETURN QUERY
  SELECT t.tier, t.rate, t.name, t.min_conversions, t.benefits, user_conversions
  FROM get_tier_info(user_conversions) t;
END;
$function$;

-- 4. Fix is_referral_code_unique function
CREATE OR REPLACE FUNCTION public.is_referral_code_unique(code text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = code
    );
END;
$function$;

-- Now enable real-time notifications for critical tables
-- This allows instant notifications when data changes

-- Enable realtime for tables that need instant notifications
ALTER TABLE public.ai_insights_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.community_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.early_warnings REPLICA IDENTITY FULL;
ALTER TABLE public.health_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.event_notifications REPLICA IDENTITY FULL;

-- Add notification tables to realtime publication (skip community_messages as it's already there)
-- Add tables only if they're not already in the publication
DO $$
BEGIN
    -- Check and add ai_insights_notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'ai_insights_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights_notifications;
    END IF;
    
    -- Check and add community_notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'community_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_notifications;
    END IF;
    
    -- Check and add early_warnings
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'early_warnings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.early_warnings;
    END IF;
    
    -- Check and add health_alerts
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'health_alerts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.health_alerts;
    END IF;
    
    -- Check and add event_notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'event_notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.event_notifications;
    END IF;
END $$;

-- Create triggers to auto-generate notifications for important events

-- 1. Trigger for new AI insights notifications
CREATE OR REPLACE FUNCTION public.create_ai_insight_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Create notification for completed analysis
  IF TG_OP = 'INSERT' AND NEW.primary_confidence > 0.7 THEN
    INSERT INTO public.ai_insights_notifications (
      user_id,
      related_id,
      insight_type,
      title,
      message,
      priority,
      action_required,
      action_data
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'analysis_completed',
      'Analisi AI Completata',
      'La tua analisi "' || NEW.file_name || '" è stata completata con confidenza ' || ROUND(NEW.primary_confidence * 100) || '%',
      CASE 
        WHEN NEW.primary_confidence > 0.9 THEN 'high'
        WHEN NEW.primary_confidence > 0.8 THEN 'medium'
        ELSE 'low'
      END,
      NEW.primary_confidence > 0.85,
      jsonb_build_object(
        'analysis_id', NEW.id,
        'confidence', NEW.primary_confidence,
        'emotion', NEW.primary_emotion,
        'action_url', '/dashboard/analysis/' || NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Attach trigger to pet_analyses table
DROP TRIGGER IF EXISTS trigger_ai_insight_notification ON public.pet_analyses;
CREATE TRIGGER trigger_ai_insight_notification
  AFTER INSERT ON public.pet_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_ai_insight_notification();

-- 2. Trigger for wellness score alerts
CREATE OR REPLACE FUNCTION public.create_wellness_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Alert for low wellness scores
  IF NEW.wellness_score IS NOT NULL AND NEW.wellness_score < 40 THEN
    INSERT INTO public.health_alerts (
      user_id,
      pet_id,
      alert_type,
      title,
      description,
      severity
    ) VALUES (
      NEW.user_id,
      NEW.pet_id,
      'low_wellness',
      'Wellness Score Basso Rilevato',
      'Il wellness score del tuo pet è sceso a ' || NEW.wellness_score || '/100. Considera una consulenza veterinaria.',
      CASE 
        WHEN NEW.wellness_score < 20 THEN 'high'
        WHEN NEW.wellness_score < 30 THEN 'medium'
        ELSE 'low'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Attach trigger to pet_wellness_scores table
DROP TRIGGER IF EXISTS trigger_wellness_alert ON public.pet_wellness_scores;
CREATE TRIGGER trigger_wellness_alert
  AFTER INSERT OR UPDATE ON public.pet_wellness_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.create_wellness_alert();

-- 3. Auto-notification for new community messages
CREATE OR REPLACE FUNCTION public.notify_channel_members()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Create notifications for all channel subscribers except the sender
  INSERT INTO public.community_notifications (user_id, channel_id, message_id)
  SELECT 
    ucs.user_id,
    NEW.channel_id,
    NEW.id
  FROM public.user_channel_subscriptions ucs
  WHERE ucs.channel_id = NEW.channel_id 
    AND ucs.user_id != NEW.user_id  -- Don't notify the sender
    AND ucs.user_id IS NOT NULL;
  
  RETURN NEW;
END;
$function$;

-- Attach trigger to community_messages table
DROP TRIGGER IF EXISTS trigger_notify_channel_members ON public.community_messages;
CREATE TRIGGER trigger_notify_channel_members
  AFTER INSERT ON public.community_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_channel_members();

-- 4. Create protocol completion notifications
CREATE OR REPLACE FUNCTION public.notify_protocol_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Notify when protocol reaches 100% completion
  IF NEW.progress_percentage = 100 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) THEN
    INSERT INTO public.ai_insights_notifications (
      user_id,
      related_id,
      insight_type,
      title,
      message,
      priority,
      action_required,
      action_data
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'protocol_completed',
      'Protocollo Completato! 🎉',
      'Hai completato con successo il protocollo "' || NEW.title || '"! Ottimo lavoro!',
      'medium',
      true,
      jsonb_build_object(
        'protocol_id', NEW.id,
        'completion_rate', NEW.progress_percentage,
        'action_url', '/dashboard/training/' || NEW.id || '/summary'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Attach trigger to ai_training_protocols table
DROP TRIGGER IF EXISTS trigger_protocol_completion ON public.ai_training_protocols;
CREATE TRIGGER trigger_protocol_completion
  AFTER UPDATE ON public.ai_training_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_protocol_completion();

-- 5. Create automatic event reminders
CREATE OR REPLACE FUNCTION public.create_event_reminders()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  reminder_time timestamp with time zone;
  reminder_setting text;
BEGIN
  -- Create reminders based on reminder_settings
  IF NEW.reminder_settings IS NOT NULL THEN
    -- Extract reminder times from jsonb
    FOR reminder_setting IN 
      SELECT jsonb_array_elements_text(NEW.reminder_settings->'times')
    LOOP
      -- Calculate reminder time
      CASE reminder_setting
        WHEN '24h' THEN reminder_time := NEW.start_time - INTERVAL '1 day';
        WHEN '2h' THEN reminder_time := NEW.start_time - INTERVAL '2 hours';
        WHEN '30m' THEN reminder_time := NEW.start_time - INTERVAL '30 minutes';
        WHEN '10m' THEN reminder_time := NEW.start_time - INTERVAL '10 minutes';
        ELSE CONTINUE; -- Skip unknown reminder types
      END CASE;
      
      -- Only create reminder if it's in the future
      IF reminder_time > now() THEN
        INSERT INTO public.event_notifications (
          user_id,
          event_id,
          notification_type,
          scheduled_for
        ) VALUES (
          NEW.user_id,
          NEW.id,
          'reminder_' || reminder_setting,
          reminder_time
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Attach trigger to calendar_events table
DROP TRIGGER IF EXISTS trigger_event_reminders ON public.calendar_events;
CREATE TRIGGER trigger_event_reminders
  AFTER INSERT ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_reminders();

-- Create function to check and send pending notifications
CREATE OR REPLACE FUNCTION public.process_pending_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Mark due event notifications as ready to send
  UPDATE public.event_notifications 
  SET status = 'ready'
  WHERE scheduled_for <= now() 
    AND status = 'pending';
    
  -- Auto-expire old notifications (older than 7 days)
  UPDATE public.ai_insights_notifications
  SET is_dismissed = true, dismissed_at = now()
  WHERE created_at < now() - INTERVAL '7 days'
    AND is_dismissed = false
    AND expires_at IS NULL;
    
  -- Auto-resolve old health alerts that haven't been addressed
  UPDATE public.health_alerts
  SET is_resolved = true, resolved_at = now()
  WHERE created_at < now() - INTERVAL '3 days'
    AND is_resolved = false
    AND severity = 'low';
END;
$function$;