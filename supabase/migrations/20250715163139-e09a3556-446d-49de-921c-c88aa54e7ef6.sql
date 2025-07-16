-- Verifica e configura tabella community_messages
DO $$ 
BEGIN
    -- Verifica se la tabella esiste, se non esiste la crea
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_messages') THEN
        CREATE TABLE public.community_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            channel_id UUID NOT NULL,
            user_id UUID NOT NULL,
            content TEXT,
            message_type TEXT NOT NULL DEFAULT 'text',
            file_url TEXT,
            voice_duration INTEGER,
            is_emergency BOOLEAN DEFAULT false,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Abilita RLS
        ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
        
        -- Crea indici per performance
        CREATE INDEX idx_community_messages_channel_id ON public.community_messages(channel_id);
        CREATE INDEX idx_community_messages_user_id ON public.community_messages(user_id);
        CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at);
        
        -- Trigger per updated_at
        CREATE TRIGGER update_community_messages_updated_at
            BEFORE UPDATE ON public.community_messages
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Crea/aggiorna RLS policies per community_messages
DROP POLICY IF EXISTS "Users can view messages in subscribed channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can create messages in subscribed channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.community_messages;

-- Policy per vedere i messaggi (solo nei canali a cui si è iscritti)
CREATE POLICY "Users can view messages in subscribed channels" ON public.community_messages
    FOR SELECT
    USING (
        deleted_at IS NULL AND
        (
            -- Utente autenticato può vedere messaggi nei canali a cui è iscritto
            EXISTS (
                SELECT 1 FROM public.user_channel_subscriptions 
                WHERE user_id = auth.uid() 
                AND channel_id = community_messages.channel_id
            )
            OR
            -- Oppure può vedere i propri messaggi
            user_id = auth.uid()
        )
    );

-- Policy per creare messaggi (solo nei canali a cui si è iscritti)
CREATE POLICY "Users can create messages in subscribed channels" ON public.community_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_channel_subscriptions 
            WHERE user_id = auth.uid() 
            AND channel_id = community_messages.channel_id
        )
    );

-- Policy per aggiornare i propri messaggi
CREATE POLICY "Users can update own messages" ON public.community_messages
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy per cancellare i propri messaggi (soft delete)
CREATE POLICY "Users can delete own messages" ON public.community_messages
    FOR UPDATE
    USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id);

-- Verifica che user_channel_subscriptions esista
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_channel_subscriptions') THEN
        CREATE TABLE public.user_channel_subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            channel_id UUID NOT NULL,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            notifications_enabled BOOLEAN DEFAULT true,
            UNIQUE(user_id, channel_id)
        );
        
        ALTER TABLE public.user_channel_subscriptions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage own subscriptions" ON public.user_channel_subscriptions
            FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END $$;