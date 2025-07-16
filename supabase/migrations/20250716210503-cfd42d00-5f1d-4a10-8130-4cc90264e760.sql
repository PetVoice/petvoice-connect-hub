-- Aggiungere colonne per indirizzo dettagliato nella tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN street_address text,
ADD COLUMN postal_code text,
ADD COLUMN city text,
ADD COLUMN province text,
ADD COLUMN country text;