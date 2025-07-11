-- Rimuovi il trigger problematico
DROP TRIGGER IF EXISTS check_email_before_insert ON auth.users;
DROP FUNCTION IF EXISTS public.check_email_uniqueness() CASCADE;

-- Nota: Non possiamo creare trigger sulla tabella auth.users perché è gestita da Supabase
-- Il controllo deve essere fatto lato applicazione