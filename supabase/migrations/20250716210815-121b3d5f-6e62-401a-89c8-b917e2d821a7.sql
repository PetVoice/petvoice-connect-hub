-- Dividere street_address in due campi separati: street_name e street_number
ALTER TABLE public.profiles 
ADD COLUMN street_name text,
ADD COLUMN street_number text;

-- Aggiornare i dati esistenti (se ci sono) dividendo street_address
UPDATE public.profiles 
SET 
  street_name = TRIM(REGEXP_REPLACE(street_address, '^[0-9/]+[a-zA-Z]*\s*', '', 'g')),
  street_number = TRIM(REGEXP_REPLACE(street_address, '^([0-9/]+[a-zA-Z]*)\s*.*', '\1', 'g'))
WHERE street_address IS NOT NULL AND street_address != '';

-- Rimuovere il vecchio campo street_address
ALTER TABLE public.profiles DROP COLUMN street_address;