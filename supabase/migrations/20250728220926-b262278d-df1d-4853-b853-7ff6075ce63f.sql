-- Controlla il contenuto della funzione handle_payment_simple
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_payment_simple';