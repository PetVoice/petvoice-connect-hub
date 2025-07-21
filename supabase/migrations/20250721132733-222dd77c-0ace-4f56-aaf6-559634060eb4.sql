-- Abilita la replica completa per la tabella private_chats per il real-time
ALTER TABLE public.private_chats REPLICA IDENTITY FULL;

-- Aggiungi la tabella alla publication di Supabase per il real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_chats;