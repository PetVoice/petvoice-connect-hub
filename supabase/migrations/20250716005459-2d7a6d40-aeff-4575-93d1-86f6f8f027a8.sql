-- Abilita la replica completa per la tabella community_messages per il real-time
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;

-- Aggiungi la tabella alla publication di Supabase per il real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;