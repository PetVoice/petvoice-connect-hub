-- Fix per rimuovere errori di relazione e aggiungere sistema iscrizioni canali

-- 1. Pulisci e sistema messaggi canali senza relazioni con profiles
-- (I messaggi esistono già, ora implementiamo l'iscrizione ai canali)

-- 2. Crea politiche per permettere agli utenti di vedere messaggi nei canali a cui sono iscritti
DROP POLICY IF EXISTS "Users can view messages in subscribed channels" ON community_messages;
CREATE POLICY "Users can view messages in subscribed channels" 
ON community_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_channel_subscriptions 
    WHERE user_channel_subscriptions.user_id = auth.uid() 
    AND user_channel_subscriptions.channel_id = community_messages.channel_id
  )
);

-- 3. Aggiorna politica per inserimento messaggi
DROP POLICY IF EXISTS "Users can create messages in subscribed channels" ON community_messages;
CREATE POLICY "Users can create messages in subscribed channels" 
ON community_messages FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM user_channel_subscriptions 
    WHERE user_channel_subscriptions.user_id = auth.uid() 
    AND user_channel_subscriptions.channel_id = community_messages.channel_id
  )
);

-- 4. Politiche per aggiornamento/cancellazione messaggi
DROP POLICY IF EXISTS "Users can update own messages" ON community_messages;
CREATE POLICY "Users can update own messages" 
ON community_messages FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON community_messages;
CREATE POLICY "Users can delete own messages" 
ON community_messages FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Aggiungi soft delete ai messaggi
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 6. Aggiorna politica per vedere solo messaggi non eliminati
DROP POLICY IF EXISTS "Users can view messages in subscribed channels" ON community_messages;
CREATE POLICY "Users can view messages in subscribed channels" 
ON community_messages FOR SELECT 
USING (
  deleted_at IS NULL AND
  EXISTS (
    SELECT 1 FROM user_channel_subscriptions 
    WHERE user_channel_subscriptions.user_id = auth.uid() 
    AND user_channel_subscriptions.channel_id = community_messages.channel_id
  )
);

-- 7. Abilita realtime per user_channel_subscriptions per aggiornamenti automatici
ALTER TABLE user_channel_subscriptions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE user_channel_subscriptions;

-- 8. Fix RLS per local_alerts (rimuovi relazione con profiles)
DROP POLICY IF EXISTS "Users can view all local alerts" ON local_alerts;
CREATE POLICY "Users can view all local alerts" 
ON local_alerts FOR SELECT 
USING (true);