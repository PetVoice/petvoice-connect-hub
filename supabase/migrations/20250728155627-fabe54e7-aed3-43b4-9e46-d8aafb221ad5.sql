-- Vediamo solo i trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'support_tickets';

-- Vediamo la funzione set_sla_deadline
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'set_sla_deadline';