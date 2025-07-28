-- Vediamo la funzione calculate_sla_deadline per confermare il problema
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'calculate_sla_deadline';