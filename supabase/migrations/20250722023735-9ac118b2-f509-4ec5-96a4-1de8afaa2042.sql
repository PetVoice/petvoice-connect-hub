-- Correggi FAQ per protocolli (non creabili dagli utenti)
UPDATE support_faq 
SET 
  question = 'Come vengono generati i protocolli di training?',
  answer = 'I protocolli di training sono generati automaticamente dall''AI di PetVoice basandosi sui dati comportamentali del tuo pet. Il sistema analizza il comportamento attuale e crea un piano personalizzato per raggiungere gli obiettivi comportamentali desiderati.'
WHERE question = 'Come creo un protocollo di training personalizzato?';

-- Rimuovi FAQ sui piani gratuiti e correggi informazioni sui piani
UPDATE support_faq 
SET 
  question = 'Cosa include il piano premium di PetVoice?',
  answer = 'PetVoice offre solo un piano premium a 0,97€/mese che include: analisi comportamentali illimitate, pet illimitati, musicoterapia AI, protocolli training generati automaticamente, chat live prioritaria, export PDF, calendario intelligente avanzato, community completa e backup cloud.'
WHERE question = 'Quali sono le differenze tra piano gratuito e premium?';

-- Correggi FAQ sui protocolli per riflettere che sono auto-generati
UPDATE support_faq 
SET 
  question = 'Posso personalizzare i protocolli generati dall''AI?',
  answer = 'Sì, puoi personalizzare alcuni aspetti dei protocolli generati dall''AI: orari delle sessioni, intensità degli esercizi, durata delle attività e aggiungere note personali. L''AI si adatta automaticamente alle tue modifiche mantenendo l''efficacia del training.'
WHERE question = 'Posso modificare un protocollo in corso?';

-- Aggiungi nuove FAQ corrette
INSERT INTO support_faq (id, question, answer, category, tags, sort_order, is_published) VALUES

-- FAQ corrette per i protocolli
(gen_random_uuid(), 'Come richiedo un nuovo protocollo di training?', 'L''AI genera automaticamente nuovi protocolli basandosi sui progressi del tuo pet e sui dati comportamentali raccolti. Puoi anche richiedere suggerimenti specifici tramite la chat AI descrivendo i comportamenti che vuoi migliorare.', 'features', ARRAY['training', 'ai-generati', 'richieste'], 39, true),

(gen_random_uuid(), 'Ogni quanto vengono aggiornati i protocolli?', 'L''AI rivede e aggiorna i protocolli automaticamente ogni 7-14 giorni basandosi sui progressi registrati. Se i risultati non sono soddisfacenti, il sistema propone automaticamente modifiche o protocolli alternativi.', 'features', ARRAY['training', 'aggiornamenti', 'ai'], 40, true),

-- FAQ corrette sui piani
(gen_random_uuid(), 'Posso provare PetVoice gratuitamente?', 'PetVoice offre un periodo di prova di 7 giorni gratuiti per testare tutte le funzionalità premium. Dopo il periodo di prova, è necessario attivare l''abbonamento premium a 0,97€/mese per continuare ad utilizzare l''app.', 'billing', ARRAY['prova', 'gratuita', 'periodo'], 41, true),

(gen_random_uuid(), 'Cosa succede se non rinnovo l''abbonamento?', 'Se non rinnovi l''abbonamento premium, perderai l''accesso a tutte le funzionalità dell''app. I tuoi dati rimarranno salvati per 30 giorni, durante i quali potrai riattivare l''abbonamento e recuperare tutto.', 'billing', ARRAY['rinnovo', 'scadenza', 'dati'], 42, true),

-- FAQ per chiarire il modello business
(gen_random_uuid(), 'Perché PetVoice costa solo 0,97€ al mese?', 'PetVoice utilizza un modello di business basato su volume e efficienza tecnologica. L''AI riduce i costi operativi permettendoci di offrire un servizio premium a un prezzo accessibile per tutti i proprietari di animali.', 'billing', ARRAY['prezzo', 'modello', 'business'], 43, true);