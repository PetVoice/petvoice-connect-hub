-- Database Analysis and Cleanup Migration
-- Part 1: Drop unused tables and optimize structure

-- 1. Drop unused tables (identified as never queried in application code)
DROP TABLE IF EXISTS public.feature_request_comments CASCADE;
DROP TABLE IF EXISTS public.feature_request_votes CASCADE;
DROP TABLE IF EXISTS public.anonymous_benchmarks CASCADE;
DROP TABLE IF EXISTS public.community_anomalies CASCADE;
DROP TABLE IF EXISTS public.community_patterns CASCADE;
DROP TABLE IF EXISTS public.community_trends CASCADE;
DROP TABLE IF EXISTS public.cross_species_insights CASCADE;

-- 2. Remove unused columns from existing tables
ALTER TABLE public.support_feature_requests DROP COLUMN IF EXISTS metadata;
ALTER TABLE public.ai_training_protocols DROP COLUMN IF EXISTS share_code;
ALTER TABLE public.ai_training_protocols DROP COLUMN IF EXISTS mentor_recommended;
ALTER TABLE public.ai_training_protocols DROP COLUMN IF EXISTS veterinary_approved;
ALTER TABLE public.ai_training_protocols DROP COLUMN IF EXISTS integration_source;

-- 3. Add missing indexes for frequent queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_diary_entries_user_entry_date 
ON public.diary_entries(user_id, entry_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pet_analyses_user_created 
ON public.pet_analyses(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_user_start_time 
ON public.calendar_events(user_id, start_time);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_user_created 
ON public.activity_log(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_messages_channel_created 
ON public.community_messages(channel_id, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_tickets_user_status 
ON public.support_tickets(user_id, status);

-- 4. Clean up old/obsolete data
-- Remove activity logs older than 1 year
DELETE FROM public.activity_log 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Remove old pet analyses with low confidence (older than 6 months)
DELETE FROM public.pet_analyses 
WHERE created_at < NOW() - INTERVAL '6 months' 
AND primary_confidence < 0.6;

-- Remove old read notifications (older than 3 months)
DELETE FROM public.ai_insights_notifications 
WHERE is_read = true 
AND read_at < NOW() - INTERVAL '3 months';

-- Remove old closed support tickets (older than 2 years)
DELETE FROM public.support_tickets 
WHERE status = 'closed' 
AND updated_at < NOW() - INTERVAL '2 years';

-- 5. Analyze tables for optimization
ANALYZE public.diary_entries;
ANALYZE public.pet_analyses;
ANALYZE public.calendar_events;
ANALYZE public.activity_log;
ANALYZE public.community_messages;
ANALYZE public.support_tickets;
ANALYZE public.pets;
ANALYZE public.profiles;

-- Log cleanup completion
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) 
SELECT 
  id,
  'system_cleanup',
  'Database cleanup and optimization completed',
  jsonb_build_object(
    'cleanup_date', NOW(),
    'tables_dropped', 7,
    'columns_removed', 5,
    'indexes_added', 6,
    'old_records_cleaned', 'yes'
  )
FROM auth.users 
WHERE email = 'admin@petvoice.com'
LIMIT 1;