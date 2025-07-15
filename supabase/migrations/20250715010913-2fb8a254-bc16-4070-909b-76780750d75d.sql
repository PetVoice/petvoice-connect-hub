-- Controllo stato attuale dei referral e trigger
SELECT 
  'referrals_status' as check_type,
  status,
  COUNT(*) as count
FROM public.referrals 
WHERE referrer_id = '01666545-f178-46d7-9282-9389b489ada5'
GROUP BY status

UNION ALL

SELECT 
  'subscribers_status' as check_type,
  subscription_status,
  COUNT(*) as count
FROM public.subscribers
GROUP BY subscription_status

UNION ALL

SELECT 
  'trigger_check' as check_type,
  trigger_name,
  1 as count
FROM information_schema.triggers 
WHERE event_object_table = 'subscribers'
  AND trigger_name LIKE '%referral%'

UNION ALL

SELECT 
  'cron_check' as check_type,
  jobname,
  1 as count
FROM cron.job
WHERE jobname LIKE '%referral%';