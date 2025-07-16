-- Verifica se c'è un trigger che usa updated_at sulla tabella health_metrics
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'health_metrics';

-- Verifica la struttura della tabella
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'health_metrics' AND table_schema = 'public';