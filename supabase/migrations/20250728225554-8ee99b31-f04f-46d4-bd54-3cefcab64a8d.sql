-- Aggiungi policy per l'eliminazione che manca
CREATE POLICY "Users can delete own feature requests or admins can delete all" 
ON public.support_feature_requests 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
);