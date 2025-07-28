-- Verifica se esiste già una foreign key verso auth.users
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'support_tickets'
    AND kcu.column_name = 'user_id';

-- Se non esiste la foreign key verso profiles, aggiungiamola
-- Prima verifichiamo che user_id nella tabella support_tickets sia di tipo UUID
ALTER TABLE public.support_tickets 
ALTER COLUMN user_id SET DATA TYPE UUID USING user_id::UUID;

-- Aggiungiamo la foreign key verso profiles
ALTER TABLE public.support_tickets 
ADD CONSTRAINT support_tickets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;