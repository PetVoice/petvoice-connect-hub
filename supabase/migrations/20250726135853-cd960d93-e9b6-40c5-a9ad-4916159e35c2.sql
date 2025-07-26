-- Elimina tutti i parametri vitali con metric_type "umore" dal database
DELETE FROM public.health_metrics 
WHERE metric_type = 'umore';

-- Log dell'operazione di pulizia
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) 
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- UUID di sistema
  'data_cleanup',
  'Eliminati parametri vitali "umore" non validi dal database',
  jsonb_build_object(
    'cleanup_date', now(),
    'removed_metric_type', 'umore',
    'action', 'Removed invalid "umore" health metrics from database'
  )
);