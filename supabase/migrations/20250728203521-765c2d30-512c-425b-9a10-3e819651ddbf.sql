-- Abilita realtime per le tabelle community
ALTER TABLE community_messages REPLICA IDENTITY FULL;
ALTER TABLE community_message_deletions REPLICA IDENTITY FULL;

-- Aggiungi le tabelle alla pubblicazione realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE community_message_deletions;