-- Aggiungi policy INSERT per consentire agli utenti di creare il proprio profilo di affiliazione
CREATE POLICY "Users can create own referral profile" ON public.user_referrals
FOR INSERT 
WITH CHECK (auth.uid() = user_id);