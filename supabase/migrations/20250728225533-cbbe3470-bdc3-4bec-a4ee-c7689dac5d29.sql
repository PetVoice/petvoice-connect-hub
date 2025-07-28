-- Aggiorna le RLS policies per support_feature_requests per permettere agli admin di gestire tutte le richieste

-- Rimuovi eventuali policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Users can view feature requests" ON public.support_feature_requests;
DROP POLICY IF EXISTS "Users can create feature requests" ON public.support_feature_requests;
DROP POLICY IF EXISTS "Users can update own feature requests" ON public.support_feature_requests;
DROP POLICY IF EXISTS "Users can delete own feature requests" ON public.support_feature_requests;
DROP POLICY IF EXISTS "Admins can delete all feature requests" ON public.support_feature_requests;

-- Abilita RLS se non già abilitato
ALTER TABLE public.support_feature_requests ENABLE ROW LEVEL SECURITY;

-- Policy per la visualizzazione: tutti possono vedere tutte le richieste
CREATE POLICY "Everyone can view feature requests" 
ON public.support_feature_requests 
FOR SELECT 
USING (true);

-- Policy per la creazione: utenti autenticati possono creare richieste
CREATE POLICY "Authenticated users can create feature requests" 
ON public.support_feature_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy per l'aggiornamento: utenti possono modificare solo le proprie richieste
CREATE POLICY "Users can update own feature requests" 
ON public.support_feature_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy per l'eliminazione: utenti possono eliminare le proprie richieste O gli admin possono eliminare tutto
CREATE POLICY "Users can delete own feature requests or admins can delete all" 
ON public.support_feature_requests 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
);