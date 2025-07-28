-- Crea bucket per i contratti di assicurazione
INSERT INTO storage.buckets (id, name, public) 
VALUES ('insurance-contracts', 'insurance-contracts', true);

-- Crea policies per il bucket
CREATE POLICY "Insurance contracts are viewable by owner" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'insurance-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own insurance contracts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'insurance-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own insurance contracts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'insurance-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own insurance contracts" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'insurance-contracts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Aggiungi colonna contract_file_url alla tabella insurance_policies
ALTER TABLE public.insurance_policies 
ADD COLUMN contract_file_url TEXT,
ADD COLUMN contract_file_name TEXT;