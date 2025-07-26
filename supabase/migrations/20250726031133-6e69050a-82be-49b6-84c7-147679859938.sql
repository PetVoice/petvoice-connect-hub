-- Aggiungi il campo gender alla tabella pets
ALTER TABLE public.pets 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'unknown')) DEFAULT 'unknown';

-- Aggiungi un commento per documentare il campo
COMMENT ON COLUMN public.pets.gender IS 'Sesso del pet: male, female, o unknown';