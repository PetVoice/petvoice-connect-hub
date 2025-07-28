-- Controlliamo tutti i trigger sulla tabella support_tickets
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    p.prosrc as function_code
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.proname = t.trigger_name
WHERE t.event_object_table = 'support_tickets';

-- Cerchiamo anche funzioni che potrebbero causare ambiguità
SELECT 
    p.proname,
    pg_get_functiondef(p.oid) as function_def
FROM pg_proc p
WHERE pg_get_functiondef(p.oid) ILIKE '%category%' 
AND pg_get_functiondef(p.oid) ILIKE '%support_tickets%';

-- Vediamo la struttura completa della tabella
\d support_tickets;