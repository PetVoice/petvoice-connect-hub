-- Controlla tutti i trigger che potrebbero essere coinvolti nelle operazioni sui subscribers
SELECT 
    trigger_name, 
    event_object_table,
    event_manipulation, 
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
AND (
    event_object_table = 'subscribers' 
    OR event_object_table = 'profiles'
    OR action_statement LIKE '%referrals%'
    OR action_statement LIKE '%update_referral_stats%'
)
ORDER BY event_object_table, trigger_name;