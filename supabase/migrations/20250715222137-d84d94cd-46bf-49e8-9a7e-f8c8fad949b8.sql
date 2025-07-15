-- Creazione tabelle per sistema di supporto avanzato

-- Tabella per ticket di supporto
CREATE TABLE support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_number text NOT NULL UNIQUE,
    category text NOT NULL CHECK (category IN ('technical', 'billing', 'medical', 'general')),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    subject text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_agent_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    closed_at timestamptz,
    sla_deadline timestamptz,
    first_response_at timestamptz,
    customer_satisfaction_rating integer CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    satisfaction_feedback text,
    escalation_count integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    tags text[] DEFAULT '{}'::text[]
);

-- Tabella per messaggi/comunicazioni nei ticket
CREATE TABLE support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type text NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system_update')),
    content text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    is_internal boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Tabella per allegati ai ticket
CREATE TABLE support_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id uuid REFERENCES support_messages(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    file_url text NOT NULL,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabella per knowledge base
CREATE TABLE support_knowledge_base (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    is_published boolean DEFAULT false,
    view_count integer DEFAULT 0,
    helpful_count integer DEFAULT 0,
    not_helpful_count integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_updated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabella per FAQ
CREATE TABLE support_faq (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    is_published boolean DEFAULT false,
    view_count integer DEFAULT 0,
    helpful_count integer DEFAULT 0,
    not_helpful_count integer DEFAULT 0,
    sort_order integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabella per feedback sui servizi di supporto
CREATE TABLE support_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type text NOT NULL CHECK (feedback_type IN ('ticket', 'knowledge_base', 'general')),
    feedback_text text,
    improvement_suggestions text,
    created_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Tabella per feature requests
CREATE TABLE support_feature_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'planned', 'in_development', 'completed', 'rejected')),
    votes integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Tabella per agenti di supporto
CREATE TABLE support_agents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    specializations text[] DEFAULT '{}'::text[],
    max_concurrent_tickets integer DEFAULT 10,
    current_ticket_count integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabella per SLA configurazione
CREATE TABLE support_sla_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL,
    priority text NOT NULL,
    response_time_minutes integer NOT NULL,
    resolution_time_hours integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabella per tracking performance
CREATE TABLE support_performance_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    total_tickets integer DEFAULT 0,
    resolved_tickets integer DEFAULT 0,
    avg_response_time_minutes numeric DEFAULT 0,
    avg_resolution_time_hours numeric DEFAULT 0,
    first_contact_resolution_rate numeric DEFAULT 0,
    customer_satisfaction_avg numeric DEFAULT 0,
    escalation_count integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indices per performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at);

CREATE INDEX idx_support_knowledge_base_category ON support_knowledge_base(category);
CREATE INDEX idx_support_knowledge_base_tags ON support_knowledge_base USING gin(tags);

CREATE INDEX idx_support_faq_category ON support_faq(category);
CREATE INDEX idx_support_faq_tags ON support_faq USING gin(tags);

-- Funzione per generare numero ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text AS $$
DECLARE
    ticket_number text;
BEGIN
    ticket_number := 'PV' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                     LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
    
    -- Verifica unicità
    WHILE EXISTS (SELECT 1 FROM support_tickets WHERE ticket_number = ticket_number) LOOP
        ticket_number := 'PV' || TO_CHAR(now(), 'YYYYMMDD') || '-' || 
                        LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
    END LOOP;
    
    RETURN ticket_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger per auto-generare ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_support_knowledge_base_updated_at
    BEFORE UPDATE ON support_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Funzione per calcolare SLA deadline
CREATE OR REPLACE FUNCTION calculate_sla_deadline(category text, priority text)
RETURNS timestamptz AS $$
DECLARE
    response_time_minutes integer;
BEGIN
    SELECT s.response_time_minutes INTO response_time_minutes
    FROM support_sla_config s
    WHERE s.category = category AND s.priority = priority AND s.is_active = true
    LIMIT 1;
    
    IF response_time_minutes IS NULL THEN
        -- Default SLA
        CASE priority
            WHEN 'critical' THEN response_time_minutes := 60;
            WHEN 'high' THEN response_time_minutes := 240;
            WHEN 'medium' THEN response_time_minutes := 480;
            WHEN 'low' THEN response_time_minutes := 1440;
        END CASE;
    END IF;
    
    RETURN now() + (response_time_minutes || ' minutes')::interval;
END;
$$ LANGUAGE plpgsql;

-- Trigger per impostare SLA deadline
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sla_deadline := calculate_sla_deadline(NEW.category, NEW.priority);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_sla_deadline
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_sla_deadline();

-- Inserimento dati di configurazione SLA di default
INSERT INTO support_sla_config (category, priority, response_time_minutes, resolution_time_hours) VALUES
('technical', 'critical', 60, 4),
('technical', 'high', 240, 24),
('technical', 'medium', 480, 72),
('technical', 'low', 1440, 168),
('billing', 'critical', 120, 8),
('billing', 'high', 480, 24),
('billing', 'medium', 720, 48),
('billing', 'low', 1440, 72),
('medical', 'critical', 30, 2),
('medical', 'high', 120, 12),
('medical', 'medium', 360, 48),
('medical', 'low', 720, 72),
('general', 'critical', 240, 8),
('general', 'high', 480, 24),
('general', 'medium', 720, 72),
('general', 'low', 1440, 168);

-- Inserimento FAQ di esempio
INSERT INTO support_faq (question, answer, category, tags, is_published, sort_order) VALUES
('Come posso registrare un messaggio vocale del mio pet?', 'Per registrare un messaggio vocale, vai nella sezione Analisi e clicca sul pulsante microfono. Tieni premuto per registrare e rilascia per fermare la registrazione.', 'technical', '{"registrazione", "vocale", "analisi"}', true, 1),
('Quanto costa il piano Premium?', 'Il piano Premium costa €9.99 al mese e include analisi illimitate, supporto prioritario e molte altre funzionalità avanzate.', 'billing', '{"prezzo", "premium", "abbonamento"}', true, 2),
('Posso cancellare il mio abbonamento in qualsiasi momento?', 'Sì, puoi cancellare il tuo abbonamento in qualsiasi momento dalle impostazioni del tuo account. La cancellazione avrà effetto alla fine del periodo di fatturazione corrente.', 'billing', '{"cancellazione", "abbonamento"}', true, 3),
('I dati del mio pet sono sicuri?', 'Sì, prendiamo molto sul serio la sicurezza dei dati. Tutti i dati sono crittografati e archiviati in modo sicuro nel rispetto delle normative GDPR.', 'general', '{"sicurezza", "privacy", "dati"}', true, 4),
('Come posso aggiungere un nuovo pet al mio account?', 'Vai nella sezione I Miei Pet e clicca sul pulsante "Aggiungi Pet". Compila il modulo con i dettagli del tuo pet e clicca su Salva.', 'technical', '{"pet", "aggiungere", "account"}', true, 5);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_sla_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies per support_tickets
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies per support_messages
CREATE POLICY "Users can view messages for their tickets" ON support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets t 
            WHERE t.id = support_messages.ticket_id 
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages for their tickets" ON support_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM support_tickets t 
            WHERE t.id = support_messages.ticket_id 
            AND t.user_id = auth.uid()
        )
    );

-- Policies per support_attachments
CREATE POLICY "Users can view attachments for their tickets" ON support_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets t 
            WHERE t.id = support_attachments.ticket_id 
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create attachments for their tickets" ON support_attachments
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        EXISTS (
            SELECT 1 FROM support_tickets t 
            WHERE t.id = support_attachments.ticket_id 
            AND t.user_id = auth.uid()
        )
    );

-- Policies per knowledge base (read-only per utenti normali)
CREATE POLICY "Everyone can view published knowledge base" ON support_knowledge_base
    FOR SELECT USING (is_published = true);

-- Policies per FAQ (read-only per utenti normali)
CREATE POLICY "Everyone can view published FAQ" ON support_faq
    FOR SELECT USING (is_published = true);

-- Policies per feedback
CREATE POLICY "Users can view their own feedback" ON support_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" ON support_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies per feature requests
CREATE POLICY "Users can view all feature requests" ON support_feature_requests
    FOR SELECT USING (true);

CREATE POLICY "Users can create feature requests" ON support_feature_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature requests" ON support_feature_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies per agents, SLA config e performance metrics (admin only)
CREATE POLICY "Service role can manage agents" ON support_agents
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage SLA config" ON support_sla_config
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage performance metrics" ON support_performance_metrics
    FOR ALL USING (auth.role() = 'service_role');