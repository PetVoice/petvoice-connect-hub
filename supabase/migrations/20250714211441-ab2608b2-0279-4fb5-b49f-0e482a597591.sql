-- Aggiungi politica RLS per permettere agli utenti di vedere i referrals dove sono il referred_user_id
CREATE POLICY "Users can view referrals where they are referred"
ON public.referrals
FOR SELECT
USING (auth.uid() = referred_user_id);