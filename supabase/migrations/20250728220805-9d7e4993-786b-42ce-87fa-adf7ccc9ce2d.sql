-- Verifica che il trigger sia stato effettivamente rimosso e che non ci siano altri trigger che causano problemi

-- Controlla tutti i trigger sulla tabella profiles
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' 
AND event_object_schema = 'public';

-- Controlla se il trigger esiste ancora
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.triggers 
    WHERE trigger_name = 'on_profile_insert_update_referral_stats'
    AND event_object_table = 'profiles'
    AND event_object_schema = 'public'
) as trigger_still_exists;