-- Update FAQ content with comprehensive questions for all platform features using proper UUIDs
DELETE FROM public.support_faq;

-- Insert comprehensive FAQ covering all platform features
INSERT INTO public.support_faq (question, answer, category, tags, is_published, sort_order, helpful_count, not_helpful_count, view_count) VALUES

-- GESTIONE PET
('Come aggiungo un nuovo pet al mio profilo?', 'Per aggiungere un nuovo pet: 1) Vai alla sezione "I Miei Pet", 2) Clicca su "Aggiungi Pet", 3) Inserisci nome, tipo di animale, razza, età e peso, 4) Carica una foto profilo, 5) Aggiungi eventuali informazioni sanitarie e salva. Puoi gestire più pet contemporaneamente.', 'pets', ARRAY['pet', 'registrazione', 'profilo'], true, 1, 0, 0, 0),

('Quanti pet posso registrare?', 'Con il piano gratuito puoi registrare 1 pet. Con il piano Premium puoi registrare pet illimitati e accedere a tutte le funzionalità avanzate per ognuno di essi.', 'pets', ARRAY['piano', 'limiti', 'premium'], true, 2, 0, 0, 0),

('Posso modificare le informazioni del mio pet?', 'Sì, puoi modificare tutte le informazioni del tuo pet in qualsiasi momento. Vai su "I Miei Pet", seleziona il pet e clicca su "Modifica". Tieni aggiornate le informazioni per analisi più precise.', 'pets', ARRAY['modifica', 'aggiornamento'], true, 3, 0, 0, 0),

-- ANALISI AI
('Come funziona l''analisi AI comportamentale?', 'L''analisi AI di PetVoice utilizza algoritmi avanzati per analizzare file audio, video e foto del tuo pet. Carica un file, l''AI identifica emozioni, comportamenti e stati d''animo fornendo insights dettagliati e suggerimenti personalizzati per il benessere del tuo animale.', 'analysis', ARRAY['ai', 'comportamento', 'emozioni'], true, 4, 0, 0, 0),

('Che tipi di file posso caricare per l''analisi?', 'Puoi caricare: 1) Video (MP4, AVI, MOV) per analisi comportamentali, 2) Audio (MP3, WAV, M4A) per analisi vocali, 3) Foto (JPG, PNG) per analisi espressioni facciali. Dimensione massima: 50MB per file.', 'analysis', ARRAY['formati', 'upload', 'file'], true, 5, 0, 0, 0),

('Quanto tempo richiede un''analisi AI?', 'L''analisi richiede generalmente 1-3 minuti per foto, 2-5 minuti per audio brevi, e 5-15 minuti per video a seconda della durata e qualità. Riceverai una notifica quando l''analisi è completata.', 'analysis', ARRAY['tempi', 'durata', 'processo'], true, 6, 0, 0, 0),

('Come interpreto i risultati dell''analisi AI?', 'I risultati mostrano: 1) Emozione principale con livello di confidenza, 2) Comportamenti rilevati, 3) Insights personalizzati, 4) Suggerimenti per il benessere, 5) Trend confrontato con analisi precedenti. Usa questi dati per monitorare il benessere del tuo pet.', 'analysis', ARRAY['risultati', 'interpretazione', 'insights'], true, 7, 0, 0, 0),

-- DIARIO COMPORTAMENTALE
('Come uso il diario comportamentale?', 'Il diario ti permette di registrare quotidianamente: 1) Umore del pet (scala 1-10), 2) Tag comportamentali, 3) Note testuali, 4) Foto del giorno, 5) Note vocali, 6) Temperatura corporea. Più dati inserisci, più accurate saranno le analisi.', 'diary', ARRAY['diario', 'registrazione', 'quotidiano'], true, 8, 0, 0, 0),

('Cosa sono i tag comportamentali?', 'I tag sono etichette predefinite per descrivere il comportamento del tuo pet: felice, ansioso, giocoso, aggressivo, calmo, energico, depresso, etc. Seleziona tutti i tag appropriati per ogni giornata per creare un profilo comportamentale completo.', 'diary', ARRAY['tag', 'comportamento', 'etichette'], true, 9, 0, 0, 0),

('Posso esportare i dati del diario?', 'Sì, puoi esportare tutti i dati del diario in formato PDF o CSV. Vai su "Diario" → "Impostazioni" → "Esporta Dati". Questo è utile per condividere informazioni con il veterinario.', 'diary', ARRAY['esportazione', 'pdf', 'veterinario'], true, 10, 0, 0, 0),

-- WELLNESS E SALUTE
('Cos''è il Wellness Score?', 'Il Wellness Score (0-100) è un indicatore automatico del benessere generale del tuo pet calcolato dall''AI basandosi su: dati del diario, risultati delle analisi, frequenza delle attività, trend comportamentali e metriche sanitarie. Più alto è il punteggio, migliore è il benessere.', 'wellness', ARRAY['wellness', 'punteggio', 'benessere'], true, 14, 0, 0, 0),

('Come posso migliorare il Wellness Score?', 'Per migliorare il punteggio: 1) Aggiorna regolarmente il diario, 2) Monitora i comportamenti negativi, 3) Segui i suggerimenti dell''AI, 4) Mantieni attività fisica regolare, 5) Consulta il veterinario per problemi persistenti, 6) Usa i protocolli di training personalizzati.', 'wellness', ARRAY['miglioramento', 'suggerimenti', 'attività'], true, 15, 0, 0, 0),

-- ASSISTENZA E CHAT AI
('Come funziona l''assistente AI live chat?', 'L''assistente AI è disponibile 24/7 tramite il pulsante chat in basso a destra. Può rispondere a domande su tutte le funzionalità della piattaforma, fornire supporto tecnico immediato e guidarti nell''uso delle varie sezioni. Basta digitare la tua domanda per ricevere assistenza personalizzata.', 'support', ARRAY['assistente', 'chat', 'AI', 'supporto'], true, 29, 0, 0, 0),

('Che tipo di domande posso fare all''assistente AI?', 'Puoi chiedere qualsiasi cosa riguardo PetVoice: come usare le funzioni, interpretare i risultati, risolvere problemi tecnici, capire le analisi AI, gestire i protocolli di training, configurare le impostazioni e molto altro. L''AI conosce tutta la piattaforma nei dettagli.', 'support', ARRAY['domande', 'assistenza', 'funzionalità'], true, 30, 0, 0, 0);

-- Update knowledge base with comprehensive guides
DELETE FROM public.support_knowledge_base;

INSERT INTO public.support_knowledge_base (title, content, category, tags, is_published, helpful_count, not_helpful_count, view_count) VALUES

('Guida Completa: Primi Passi con PetVoice', 
'# Guida Completa: Primi Passi con PetVoice

## 1. Configurazione Iniziale

### Registrazione Account
- Crea il tuo account con email verificata
- Completa il profilo utente con foto e preferenze
- Scegli il piano più adatto alle tue esigenze

### Registrazione Primo Pet
1. **Vai su "I Miei Pet"** → "Aggiungi Pet"
2. **Informazioni Base:**
   - Nome del pet
   - Tipo (cane, gatto, etc.)
   - Razza (se nota)
   - Data di nascita o età stimata
   - Peso attuale
3. **Foto Profilo:** Carica una foto chiara del viso
4. **Informazioni Sanitarie:**
   - Condizioni mediche esistenti
   - Allergie note
   - Farmaci attuali
   - Veterinario di riferimento

## 2. Prima Analisi AI

### Preparazione del File
- **Video:** Riprendi il pet in situazioni naturali (10-60 secondi)
- **Audio:** Registra vocalizzazioni spontanee o chiamate
- **Foto:** Scatta immagini del viso con buona illuminazione

### Caricamento e Analisi
1. Vai su "Analisi AI"
2. Clicca "Carica File"
3. Seleziona file e aggiungi contesto
4. Attendi elaborazione (1-15 minuti)
5. Studia i risultati e insights

## 3. Assistente AI Live Chat

### Come Usarlo
- Clicca sul pulsante chat in basso a destra
- Digita la tua domanda in linguaggio naturale
- Ricevi risposte immediate e personalizzate
- Disponibile 24/7 per qualsiasi dubbio

### Esempi di Domande
- "Come interpreto il Wellness Score del mio cane?"
- "Perché l''analisi AI ha rilevato ansia?"
- "Come creo un protocollo di training per l''aggressività?"
- "Come esporto i dati del diario per il veterinario?"

## 4. Ottimizzazione Wellness Score

### Fattori che Influenzano il Punteggio
- **Frequenza aggiornamenti diario:** +15 punti
- **Comportamenti positivi:** +10 punti per tag
- **Attività fisica regolare:** +12 punti
- **Analisi AI positive:** +8 punti
- **Protocolli completati:** +20 punti

### Suggerimenti dell''Assistente AI
L''assistente AI può fornire consigli personalizzati per migliorare il benessere del tuo pet in base ai dati specifici e alle situazioni che descrivi durante la conversazione.', 
'guide', ARRAY['guida', 'inizio', 'configurazione', 'AI'], true, 0, 0, 0),

('Assistente AI PetVoice: Guida Completa', 
'# Assistente AI PetVoice: La Tua Guida Personale

## Cos''è l''Assistente AI

L''Assistente AI di PetVoice è un chatbot intelligente disponibile 24/7 che conosce ogni aspetto della piattaforma. È progettato per fornire supporto immediato, risolvere dubbi e guidarti nell''utilizzo ottimale di tutte le funzionalità.

## Come Accedere

### Pulsante Chat
- Trovi il pulsante chat in basso a destra in ogni pagina
- Clicca per aprire la finestra di conversazione
- L''indicatore verde mostra che è sempre attivo

### Finestra Chat
- **Minimize/Maximize:** Riduci o espandi la chat
- **Storico conversazioni:** Mantiene il contesto durante la sessione
- **Domande Rapide:** Suggerimenti per iniziare

## Capacità dell''Assistente

### Supporto Completo Piattaforma
- **Gestione Pet:** Registrazione, modifica, eliminazione
- **Analisi AI:** Interpretazione risultati, miglioramento accuracy
- **Diario Comportamentale:** Best practices, esportazione dati
- **Calendario:** Programmazione eventi, promemoria
- **Wellness:** Spiegazione punteggi, suggerimenti miglioramento
- **Training:** Creazione protocolli, monitoraggio progressi
- **Musicoterapia:** Utilizzo ottimale, personalizzazione
- **Community:** Partecipazione, Pet Matching
- **Statistiche:** Interpretazione grafici e trend
- **Impostazioni:** Configurazione account, privacy
- **Abbonamenti:** Differenze piani, gestione pagamenti

### Risoluzione Problemi Tecnici
- **Errori Upload:** Formati supportati, dimensioni massime
- **Problemi Sincronizzazione:** Troubleshooting connessione
- **Performance Issues:** Ottimizzazione browser, cache
- **Account Issues:** Recovery password, problemi accesso

### Consigli Personalizzati
- **Analisi Comportamentale:** Interpretazione pattern specifici
- **Wellness Optimization:** Strategie personalizzate
- **Training Recommendations:** Protocolli adatti al tuo pet
- **Health Insights:** Correlazioni dati-benessere

## Esempi di Conversazioni

### Gestione Pet
**Tu:** "Il mio gatto sembra ansioso nelle analisi, cosa significa?"
**AI:** "L''ansia nei gatti può manifestarsi attraverso diversi indicatori che l''AI rileva: postura tesa, pupille dilatate, vocalizzazioni specifiche. Per il tuo gatto, posso suggerirti..."

### Wellness Score
**Tu:** "Il Wellness Score è sceso a 65, come posso migliorarlo?"
**AI:** "Un punteggio di 65 indica alcune aree di miglioramento. Basandomi sui dati del tuo pet, ti consiglio di..."

### Problemi Tecnici
**Tu:** "L''upload del video non funziona"
**AI:** "Verifichiamo insieme: 1) Il file è in formato MP4/AVI/MOV? 2) La dimensione è sotto i 50MB? 3) La connessione è stabile? Se tutti i punti sono ok..."

## Suggerimenti per Conversazioni Efficaci

### Sii Specifico
- **Meglio:** "Il Wellness Score del mio Golden Retriever di 3 anni è sceso da 85 a 70 in una settimana"
- **Evita:** "Il mio cane non sta bene"

### Fornisci Contesto
- Tipo e razza del pet
- Situazione specifica
- Cosa hai già provato
- Timeline degli eventi

### Chiedi Follow-up
- "Puoi spiegarmi meglio questo punto?"
- "Quali sono i prossimi passi?"
- "Ci sono alternative a questa soluzione?"

## Limitazioni

### Cosa NON può fare l''Assistente
- **Diagnosi Veterinarie:** Non sostituisce il veterinario
- **Emergenze Mediche:** Per emergenze contatta sempre il vet
- **Modifiche Account:** Non può cambiare impostazioni critiche
- **Accesso Dati Sensibili:** Non può visualizzare info private

### Cosa Fare in Caso di Limitazioni
- Per emergenze mediche: contatta veterinario
- Per modifiche account: vai su Impostazioni
- Per problemi complessi: contatta supporto umano
- Per feedback: usa sezione dedicata

## Privacy e Sicurezza

### Protezione Dati
- Le conversazioni non vengono salvate permanentemente
- Nessun dato sensibile viene condiviso
- Crittografia end-to-end per la comunicazione
- Conformità GDPR completa

### Best Practices
- Non condividere password o dati bancari
- Usa nomi generici invece di info personali dettagliate
- Segnala comportamenti anomali del bot

## Aggiornamenti e Miglioramenti

### Apprendimento Continuo
- L''AI si aggiorna costantemente con nuove informazioni
- Feedback degli utenti migliora le risposte
- Nuove funzionalità vengono integrate automaticamente

### Feedback
- Valuta le risposte con 👍 o 👎
- Segnala risposte imprecise
- Suggerisci miglioramenti tramite chat

L''Assistente AI è il tuo compagno ideale per sfruttare al massimo PetVoice. Non esitare a fare qualsiasi domanda: è qui per aiutarti!', 
'guide', ARRAY['assistente', 'AI', 'chat', 'supporto'], true, 0, 0, 0);