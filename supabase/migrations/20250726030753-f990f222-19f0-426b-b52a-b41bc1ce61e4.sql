-- Aggiungi il campo microchip_number alla tabella pets
ALTER TABLE public.pets 
ADD COLUMN microchip_number TEXT DEFAULT NULL;

-- Aggiungi un commento per documentare il campo
COMMENT ON COLUMN public.pets.microchip_number IS 'Numero del microchip del pet per identificazione';

-- Aggiungi un indice per ricerche rapide (opzionale ma utile)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pets_microchip_number 
ON public.pets(microchip_number) 
WHERE microchip_number IS NOT NULL;