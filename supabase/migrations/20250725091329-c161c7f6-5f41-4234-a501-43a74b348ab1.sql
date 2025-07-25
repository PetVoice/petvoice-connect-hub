-- Crea il bucket documents per il caricamento file
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Policy per lettura pubblica
CREATE POLICY "Documents are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

-- Policy per upload da parte degli utenti autenticati
CREATE POLICY "Users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Policy per aggiornamento dei propri file
CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Policy per eliminazione dei propri file
CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);