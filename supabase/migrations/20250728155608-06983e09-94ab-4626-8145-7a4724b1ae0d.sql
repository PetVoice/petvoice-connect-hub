-- Controlliamo tutti i trigger sulla tabella support_tickets per trovare il problema con category
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_table = 'support_tickets';

-- Cerchiamo funzioni che potrebbero causare ambiguità con category
SELECT 
    p.proname,
    pg_get_functiondef(p.oid) as function_def
FROM pg_proc p
WHERE pg_get_functiondef(p.oid) ILIKE '%category%' 
AND pg_get_functiondef(p.oid) ILIKE '%support_tickets%';

-- Vediamo se esiste una funzione set_sla_deadline che potrebbe causare problemi
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'set_sla_deadline';