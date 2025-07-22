-- Rimuovi FAQ duplicate
DELETE FROM support_faq WHERE id = 'e286b9d3-511a-4498-bc3b-31544618c55a';

-- Aggiorna email di supporto nelle FAQ esistenti
UPDATE support_faq 
SET answer = REPLACE(answer, 'supporto@petvoice.it', 'petvoice2025@gmail.com')
WHERE answer LIKE '%supporto@petvoice.it%';

-- Inserisci nuove FAQ complete per tutte le funzionalità

-- FAQ per Musicoterapia AI
INSERT INTO support_faq (id, question, answer, category, tags, sort_order, is_published) VALUES
(gen_random_uuid(), 'Come funziona la musicoterapia AI?', 'La musicoterapia AI analizza l''umore e lo stato emotivo del tuo pet per generare playlist personalizzate. Utilizza algoritmi avanzati per creare musica che riduce ansia, migliora il sonno e aumenta il benessere del tuo animale.', 'features', ARRAY['musicoterapia', 'ai', 'benessere'], 20, true),

(gen_random_uuid(), 'Posso scaricare le tracce musicali generate?', 'Sì, con il piano premium puoi scaricare le tracce musicali generate dall''AI per uso offline. Le tracce sono ottimizzate per le frequenze uditive del tuo specifico tipo di pet.', 'features', ARRAY['musicoterapia', 'download', 'premium'], 21, true),

(gen_random_uuid(), 'Quali tipi di musica vengono generati?', 'L''AI genera diversi tipi di musica: rilassante per l''ansia, energizzante per la depressione, suoni della natura per il sonno, frequenze specifiche per cani/gatti e musica classica adattata per animali.', 'features', ARRAY['musicoterapia', 'tipi', 'frequenze'], 22, true),

-- FAQ per Protocolli Training AI
(gen_random_uuid(), 'Come creo un protocollo di training personalizzato?', 'Vai su "AI Training", clicca "Nuovo Protocollo", seleziona l''obiettivo comportamentale e rispondi alle domande dell''AI. Il sistema genererà un piano personalizzato basato sul comportamento e le caratteristiche del tuo pet.', 'features', ARRAY['training', 'protocolli', 'ai'], 23, true),

(gen_random_uuid(), 'Quanto durano i protocolli di training?', 'I protocolli variano da 7 a 30 giorni: protocolli base (7-14 giorni) per comandi semplici, intermedi (14-21 giorni) per comportamenti complessi, avanzati (21-30 giorni) per problemi comportamentali severi.', 'features', ARRAY['training', 'durata', 'protocolli'], 24, true),

(gen_random_uuid(), 'Posso modificare un protocollo in corso?', 'Sì, puoi modificare orari, intensità e durata delle sessioni. L''AI si adatta automaticamente alle modifiche mantenendo l''efficacia del training. Non puoi cambiare l''obiettivo principale senza riavviare.', 'features', ARRAY['training', 'modifica', 'personalizzazione'], 25, true),

-- FAQ per Analytics e Reports
(gen_random_uuid(), 'Come leggere i grafici analytics?', 'I grafici mostrano trend comportamentali, correlazioni salute-umore, progressi training e previsioni AI. Ogni grafico include spiegazioni interattive e raccomandazioni basate sui pattern identificati.', 'features', ARRAY['analytics', 'grafici', 'interpretazione'], 26, true),

(gen_random_uuid(), 'Posso esportare i report in formato PDF?', 'Sì, puoi generare report PDF completi con grafici, analisi comportamentali, raccomandazioni veterinarie e riassunti mensili. Ideali da condividere con veterinari e comportamentalisti.', 'features', ARRAY['report', 'pdf', 'export'], 27, true),

-- FAQ per Community e Chat
(gen_random_uuid(), 'Come accedo alla community di PetVoice?', 'Vai su "Community" dal menu principale. Puoi partecipare a chat globali, gruppi per tipo di animale, canali locali per paese e discussioni tematiche. La community è moderata 24/7.', 'features', ARRAY['community', 'chat', 'gruppi'], 28, true),

(gen_random_uuid(), 'Posso segnalare emergenze nella community?', 'Sì, c''è un canale dedicato "Emergenze" dove puoi ottenere aiuto rapido dalla community. Per emergenze veterinarie reali usa sempre il numero di emergenza del tuo veterinario.', 'features', ARRAY['community', 'emergenze', 'aiuto'], 29, true),

-- FAQ per Funzionalità Avanzate
(gen_random_uuid(), 'Come funziona l''analisi predittiva?', 'L''AI analizza pattern comportamentali storici per prevedere possibili problemi di salute, cambiamenti di umore e necessità di interventi. Le previsioni hanno percentuali di accuratezza indicate.', 'features', ARRAY['predizione', 'ai', 'salute'], 30, true),

(gen_random_uuid(), 'Cosa include il diario comportamentale avanzato?', 'Include registrazione umore (1-10), tag comportamentali, foto/video, note testuali, correlazioni con meteo/orari, grafici automatici e suggerimenti AI per migliorare il benessere.', 'features', ARRAY['diario', 'comportamento', 'tracking'], 31, true),

-- FAQ per Primo Soccorso
(gen_random_uuid(), 'Come accedo alla guida di primo soccorso?', 'Vai su "Benessere" > "Emergenze". Troverai guide illustrate per situazioni comuni: soffocamento, avvelenamento, ferite, convulsioni. Include video tutorial e numeri di emergenza locali.', 'features', ARRAY['primo-soccorso', 'emergenze', 'guida'], 32, true),

(gen_random_uuid(), 'La guida di primo soccorso è affidabile?', 'Le guide sono create da veterinari certificati e aggiornate regolarmente. Tuttavia, in caso di emergenza reale contatta sempre immediatamente il tuo veterinario o clinica di emergenza.', 'medical', ARRAY['primo-soccorso', 'affidabilità', 'veterinari'], 33, true),

-- FAQ per Calendario Intelligente
(gen_random_uuid(), 'Come imposta promemoria il calendario AI?', 'Il calendario analizza i dati del tuo pet e suggerisce automaticamente: visite veterinarie periodiche, vaccinazioni, trattamenti antiparassitari, sessioni di training e controlli comportamentali.', 'features', ARRAY['calendario', 'promemoria', 'ai'], 34, true),

-- FAQ per Sicurezza e Privacy
(gen_random_uuid(), 'Chi ha accesso ai dati del mio pet?', 'Solo tu hai accesso ai tuoi dati. PetVoice utilizza i dati in forma anonima e aggregata per migliorare l''AI. Non condividiamo mai dati personali con terze parti senza il tuo consenso esplicito.', 'privacy', ARRAY['dati', 'accesso', 'privacy'], 35, true),

(gen_random_uuid(), 'Come cancello definitivamente il mio account?', 'Vai su Impostazioni > Account > Elimina Account. Tutti i dati verranno cancellati definitivamente entro 30 giorni. Puoi esportare i dati prima della cancellazione.', 'privacy', ARRAY['cancellazione', 'account', 'dati'], 36, true),

-- FAQ per Piani e Fatturazione
(gen_random_uuid(), 'Quali sono le differenze tra piano gratuito e premium?', 'Piano gratuito: 3 analisi/mese, 1 pet, calendario base. Piano premium (0,97€/mese): analisi illimitate, pet illimitati, musicoterapia AI, protocolli training, chat live prioritaria, export PDF.', 'billing', ARRAY['piani', 'gratuito', 'premium', 'confronto'], 37, true),

(gen_random_uuid(), 'Offrire sconti per più animali?', 'Il piano premium include già animali illimitati al prezzo di 0,97€/mese. Non ci sono costi aggiuntivi per ogni pet aggiunto al tuo account.', 'billing', ARRAY['sconti', 'multipet', 'prezzo'], 38, true);