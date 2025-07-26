-- Tabella per gestire i farmaci dei pet
CREATE TABLE public.pet_medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.pet_medications ENABLE ROW LEVEL SECURITY;

-- Policy per lettura (users can view their pet medications)
CREATE POLICY "Users can view their pet medications" 
ON public.pet_medications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy per inserimento (users can create their pet medications)
CREATE POLICY "Users can create their pet medications" 
ON public.pet_medications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy per aggiornamento (users can update their pet medications)
CREATE POLICY "Users can update their pet medications" 
ON public.pet_medications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy per eliminazione (users can delete their pet medications)
CREATE POLICY "Users can delete their pet medications" 
ON public.pet_medications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_pet_medications_updated_at
  BEFORE UPDATE ON public.pet_medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indici per performance
CREATE INDEX idx_pet_medications_user_id ON public.pet_medications(user_id);
CREATE INDEX idx_pet_medications_pet_id ON public.pet_medications(pet_id);
CREATE INDEX idx_pet_medications_active ON public.pet_medications(is_active) WHERE is_active = true;