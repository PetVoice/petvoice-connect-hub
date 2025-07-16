-- Aggiungo più FAQ per la piattaforma
INSERT INTO public.support_faq (question, answer, category, tags, is_published, sort_order) VALUES 
('Come funziona l''analisi comportamentale AI?', 'L''AI di PetVoice analizza video, audio e foto del tuo pet per identificare emozioni, comportamenti e possibili problemi. Utilizza algoritmi avanzati di machine learning per fornire insights accurati sul benessere del tuo animale.', 'technical', ARRAY['ai', 'analisi', 'comportamento'], true, 10),

('Posso condividere i dati del mio pet con il veterinario?', 'Sì, puoi esportare i report e condividerli facilmente con il tuo veterinario. I dati possono essere esportati in formato PDF con grafici e analisi dettagliate per consultazioni mediche.', 'medical', ARRAY['veterinario', 'condivisione', 'export'], true, 11),

('Che formati di file sono supportati per l''upload?', 'PetVoice supporta video (MP4, MOV, AVI max 100MB), audio (MP3, WAV, M4A max 50MB) e immagini (JPG, PNG, HEIC max 20MB). Per risultati ottimali usa file di alta qualità.', 'technical', ARRAY['upload', 'formati', 'file'], true, 12),

('Come funziona il sistema di backup?', 'Tutti i tuoi dati sono automaticamente salvati nel cloud con backup giornalieri. Non perderai mai le informazioni del tuo pet, anche cambiando dispositivo.', 'technical', ARRAY['backup', 'cloud', 'sicurezza'], true, 13),

('Posso usare PetVoice per più animali?', 'Sì, puoi aggiungere tutti i pet che vuoi al tuo account. Ogni animale avrà il suo profilo separato con analisi e dati dedicati.', 'general', ARRAY['multipet', 'account', 'profili'], true, 14),

('Come interpreto i risultati dell''analisi?', 'Ogni analisi mostra l''emozione principale con percentuale di confidenza, emozioni secondarie, insights comportamentali e raccomandazioni specifiche. I grafici mostrano i trend nel tempo.', 'general', ARRAY['risultati', 'interpretazione', 'analisi'], true, 15),

('Cosa fare se l''analisi sembra imprecisa?', 'Assicurati di usare video di almeno 10 secondi con buona illuminazione. Se i risultati sembrano ancora imprecisi, contatta il supporto con i dettagli del file caricato.', 'technical', ARRAY['precisione', 'qualità', 'troubleshooting'], true, 16),

('Come funziona il calendario intelligente?', 'Il calendario ti aiuta a programmare visite veterinarie, trattamenti, attività e promemoria. Può suggerire appuntamenti basati sui comportamenti e sulla salute del tuo pet.', 'general', ARRAY['calendario', 'programmazione', 'promemoria'], true, 17),

('Posso accedere ai miei dati offline?', 'L''app richiede connessione internet per le analisi AI, ma puoi visualizzare i dati già caricati e aggiungere note al diario anche offline. I dati si sincronizzeranno alla prossima connessione.', 'technical', ARRAY['offline', 'sincronizzazione', 'connessione'], true, 18),

('Come contattare il supporto tecnico?', 'Puoi contattarci tramite la chat live, aprire un ticket di supporto, o scrivere a supporto@petvoice.it. Il supporto premium riceve risposta entro 2 ore.', 'general', ARRAY['supporto', 'contatto', 'assistenza'], true, 19);

-- Aggiorno le RLS policies per permettere a tutti di vedere i contatori delle FAQ
DROP POLICY IF EXISTS "Everyone can view published FAQ" ON public.support_faq;
CREATE POLICY "Everyone can view published FAQ" ON public.support_faq
  FOR SELECT USING (is_published = true);

-- Permetto a tutti gli utenti autenticati di aggiornare i contatori helpful/not_helpful
CREATE POLICY "Authenticated users can update FAQ feedback" ON public.support_faq
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Aggiorno le RLS policies per le feature requests per permettere a tutti di vedere i voti
DROP POLICY IF EXISTS "Users can view all feature requests" ON public.support_feature_requests;
CREATE POLICY "Everyone can view feature requests" ON public.support_feature_requests
  FOR SELECT USING (true);

-- Permetto a tutti gli utenti autenticati di votare le feature requests
CREATE POLICY "Authenticated users can vote feature requests" ON public.support_feature_requests
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Creo una tabella per tracciare i voti degli utenti (evitare voti multipli)
CREATE TABLE IF NOT EXISTS public.feature_request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_request_id UUID NOT NULL REFERENCES public.support_feature_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_request_id)
);

-- RLS per la tabella dei voti
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own votes" ON public.feature_request_votes
  FOR ALL USING (auth.uid() = user_id);

-- Creo una tabella per i commenti/discussioni sulle feature requests
CREATE TABLE IF NOT EXISTS public.feature_request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_request_id UUID NOT NULL REFERENCES public.support_feature_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS per i commenti
ALTER TABLE public.feature_request_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view comments" ON public.feature_request_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.feature_request_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.feature_request_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_request_comments_updated_at 
    BEFORE UPDATE ON public.feature_request_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();