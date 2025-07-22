-- Update and expand FAQ content with comprehensive questions for all platform features
DELETE FROM public.support_faq;

-- Insert comprehensive FAQ covering all platform features
INSERT INTO public.support_faq (id, question, answer, category, tags, is_published, sort_order, helpful_count, not_helpful_count, view_count) VALUES

-- GESTIONE PET
('faq_001', 'Come aggiungo un nuovo pet al mio profilo?', 'Per aggiungere un nuovo pet: 1) Vai alla sezione "I Miei Pet", 2) Clicca su "Aggiungi Pet", 3) Inserisci nome, tipo di animale, razza, età e peso, 4) Carica una foto profilo, 5) Aggiungi eventuali informazioni sanitarie e salva. Puoi gestire più pet contemporaneamente.', 'pets', ARRAY['pet', 'registrazione', 'profilo'], true, 1, 0, 0, 0),

('faq_002', 'Quanti pet posso registrare?', 'Con il piano gratuito puoi registrare 1 pet. Con il piano Premium puoi registrare pet illimitati e accedere a tutte le funzionalità avanzate per ognuno di essi.', 'pets', ARRAY['piano', 'limiti', 'premium'], true, 2, 0, 0, 0),

('faq_003', 'Posso modificare le informazioni del mio pet?', 'Sì, puoi modificare tutte le informazioni del tuo pet in qualsiasi momento. Vai su "I Miei Pet", seleziona il pet e clicca su "Modifica". Tieni aggiornate le informazioni per analisi più precise.', 'pets', ARRAY['modifica', 'aggiornamento'], true, 3, 0, 0, 0),

-- ANALISI AI
('faq_004', 'Come funziona l''analisi AI comportamentale?', 'L''analisi AI di PetVoice utilizza algoritmi avanzati per analizzare file audio, video e foto del tuo pet. Carica un file, l''AI identifica emozioni, comportamenti e stati d''animo fornendo insights dettagliati e suggerimenti personalizzati per il benessere del tuo animale.', 'analysis', ARRAY['ai', 'comportamento', 'emozioni'], true, 4, 0, 0, 0),

('faq_005', 'Che tipi di file posso caricare per l''analisi?', 'Puoi caricare: 1) Video (MP4, AVI, MOV) per analisi comportamentali, 2) Audio (MP3, WAV, M4A) per analisi vocali, 3) Foto (JPG, PNG) per analisi espressioni facciali. Dimensione massima: 50MB per file.', 'analysis', ARRAY['formati', 'upload', 'file'], true, 5, 0, 0, 0),

('faq_006', 'Quanto tempo richiede un''analisi AI?', 'L''analisi richiede generalmente 1-3 minuti per foto, 2-5 minuti per audio brevi, e 5-15 minuti per video a seconda della durata e qualità. Riceverai una notifica quando l''analisi è completata.', 'analysis', ARRAY['tempi', 'durata', 'processo'], true, 6, 0, 0, 0),

('faq_007', 'Come interpreto i risultati dell''analisi AI?', 'I risultati mostrano: 1) Emozione principale con livello di confidenza, 2) Comportamenti rilevati, 3) Insights personalizzati, 4) Suggerimenti per il benessere, 5) Trend confrontato con analisi precedenti. Usa questi dati per monitorare il benessere del tuo pet.', 'analysis', ARRAY['risultati', 'interpretazione', 'insights'], true, 7, 0, 0, 0),

-- DIARIO COMPORTAMENTALE
('faq_008', 'Come uso il diario comportamentale?', 'Il diario ti permette di registrare quotidianamente: 1) Umore del pet (scala 1-10), 2) Tag comportamentali, 3) Note testuali, 4) Foto del giorno, 5) Note vocali, 6) Temperatura corporea. Più dati inserisci, più accurate saranno le analisi.', 'diary', ARRAY['diario', 'registrazione', 'quotidiano'], true, 8, 0, 0, 0),

('faq_009', 'Cosa sono i tag comportamentali?', 'I tag sono etichette predefinite per descrivere il comportamento del tuo pet: felice, ansioso, giocoso, aggressivo, calmo, energico, depresso, etc. Seleziona tutti i tag appropriati per ogni giornata per creare un profilo comportamentale completo.', 'diary', ARRAY['tag', 'comportamento', 'etichette'], true, 9, 0, 0, 0),

('faq_010', 'Posso esportare i dati del diario?', 'Sì, puoi esportare tutti i dati del diario in formato PDF o CSV. Vai su "Diario" → "Impostazioni" → "Esporta Dati". Questo è utile per condividere informazioni con il veterinario.', 'diary', ARRAY['esportazione', 'pdf', 'veterinario'], true, 10, 0, 0, 0),

-- CALENDARIO E APPUNTAMENTI
('faq_011', 'Come programmo un appuntamento veterinario?', 'Nel Calendario: 1) Clicca su "Nuovo Evento", 2) Seleziona "Appuntamento Veterinario", 3) Inserisci data, ora e dettagli, 4) Aggiungi promemoria automatici, 5) Salva. Riceverai notifiche prima dell''appuntamento.', 'calendar', ARRAY['appuntamento', 'veterinario', 'promemoria'], true, 11, 0, 0, 0),

('faq_012', 'Posso impostare promemoria per i farmaci?', 'Sì, nel Calendario puoi creare eventi ricorrenti per medicazioni. Imposta frequenza (giornaliera, settimanale, etc.), dosaggio e note. Il sistema ti invierà notifiche automatiche per non dimenticare mai una dose.', 'calendar', ARRAY['farmaci', 'promemoria', 'medicazioni'], true, 12, 0, 0, 0),

('faq_013', 'Posso sincronizzare con Google Calendar?', 'Attualmente stiamo sviluppando l''integrazione con Google Calendar. Nel frattempo, puoi esportare gli eventi di PetVoice e importarli manualmente nel tuo calendario preferito.', 'calendar', ARRAY['google', 'sincronizzazione', 'integrazione'], true, 13, 0, 0, 0),

-- WELLNESS E SALUTE
('faq_014', 'Cos''è il Wellness Score?', 'Il Wellness Score (0-100) è un indicatore automatico del benessere generale del tuo pet calcolato dall''AI basandosi su: dati del diario, risultati delle analisi, frequenza delle attività, trend comportamentali e metriche sanitarie. Più alto è il punteggio, migliore è il benessere.', 'wellness', ARRAY['wellness', 'punteggio', 'benessere'], true, 14, 0, 0, 0),

('faq_015', 'Come posso migliorare il Wellness Score?', 'Per migliorare il punteggio: 1) Aggiorna regolarmente il diario, 2) Monitora i comportamenti negativi, 3) Segui i suggerimenti dell''AI, 4) Mantieni attività fisica regolare, 5) Consulta il veterinario per problemi persistenti, 6) Usa i protocolli di training personalizzati.', 'wellness', ARRAY['miglioramento', 'suggerimenti', 'attività'], true, 15, 0, 0, 0),

('faq_016', 'Quando dovrei preoccuparmi per la salute del mio pet?', 'Contatta immediatamente il veterinario se: 1) Wellness Score scende sotto 30 per più giorni, 2) Cambiamenti comportamentali drastici, 3) Rifiuto del cibo per 24+ ore, 4) Letargia estrema, 5) L''AI rileva comportamenti di stress severo ripetutamente.', 'wellness', ARRAY['allerta', 'veterinario', 'emergenza'], true, 16, 0, 0, 0),

-- PROTOCOLLI DI TRAINING
('faq_017', 'Cosa sono i protocolli di training AI?', 'I protocolli sono programmi di addestramento personalizzati generati dall''AI basati sul profilo del tuo pet. Includono esercizi specifici, tecniche comportamentali, obiettivi progressivi e tracking dei risultati per migliorare comportamenti specifici.', 'training', ARRAY['protocolli', 'training', 'personalizzazione'], true, 17, 0, 0, 0),

('faq_018', 'Come creo un protocollo personalizzato?', 'Vai su "Training" → "Nuovo Protocollo", seleziona l''obiettivo (es. ridurre ansia, migliorare obbedienza), inserisci dettagli sul comportamento attuale, e l''AI genererà un protocollo su misura con esercizi quotidiani e milestone da raggiungere.', 'training', ARRAY['creazione', 'personalizzazione', 'obiettivi'], true, 18, 0, 0, 0),

('faq_019', 'Posso condividere i miei protocolli con altri utenti?', 'Sì, puoi rendere pubblici i tuoi protocolli più efficaci nella Community. Altri utenti potranno valutarli, commentarli e adattarli ai loro pet. Più un protocollo è valutato positivamente, più visibilità avrà.', 'training', ARRAY['condivisione', 'community', 'valutazioni'], true, 19, 0, 0, 0),

-- MUSICOTERAPIA AI
('faq_020', 'Come funziona la musicoterapia AI?', 'L''AI genera musica terapeutica personalizzata basata su: 1) Profilo del pet, 2) Stato emotivo attuale, 3) Obiettivi (rilassamento, energia, etc.), 4) Preferenze musicali rilevate. La musica si adatta in tempo reale alle risposte del tuo pet.', 'music', ARRAY['musicoterapia', 'personalizzazione', 'AI'], true, 20, 0, 0, 0),

('faq_021', 'Quando dovrei usare la musicoterapia?', 'Usa la musicoterapia per: 1) Ansia da separazione, 2) Stress durante temporali, 3) Rilassamento pre-nanna, 4) Recupero post-operatorio, 5) Socializzazione con altri animali, 6) Momenti di iperattivazione. Monitora sempre le reazioni del pet.', 'music', ARRAY['ansia', 'stress', 'rilassamento'], true, 21, 0, 0, 0),

-- COMMUNITY E SOCIAL
('faq_022', 'Come funziona la Community di PetVoice?', 'La Community è un social network per proprietari di pet dove puoi: 1) Condividere esperienze, 2) Cercare consigli, 3) Partecipare a discussioni, 4) Organizzare incontri, 5) Trovare pet-sitter, 6) Scambiare protocolli di training. Rispetta sempre le linee guida della community.', 'community', ARRAY['social', 'condivisione', 'network'], true, 22, 0, 0, 0),

('faq_023', 'Cos''è il Pet Matching?', 'Il Pet Matching usa l''AI per trovare pet compatibili con il tuo per carattere, energia, socialità. Suggerisce incontri e playdate basati su algoritmi di compatibilità comportamentale. Perfetto per socializzazione e nuove amicizie.', 'community', ARRAY['matching', 'compatibilità', 'socializzazione'], true, 23, 0, 0, 0),

-- STATISTICHE E REPORT
('faq_024', 'Come interpreto le statistiche del mio pet?', 'Le statistiche mostrano: 1) Trend umore nel tempo, 2) Frequenza comportamenti, 3) Efficacia protocolli, 4) Correlazioni attività-benessere, 5) Previsioni AI. Usa i grafici per identificare pattern e migliorare la cura del tuo pet.', 'stats', ARRAY['statistiche', 'grafici', 'trend'], true, 24, 0, 0, 0),

('faq_025', 'Posso generare report per il veterinario?', 'Sì, puoi generare report completi con: 1) Storico comportamentale, 2) Analisi AI dettagliate, 3) Trend salute, 4) Protocolli seguiti, 5) Foto e video significativi. Esporta in PDF e condividi con il veterinario per visite più produttive.', 'stats', ARRAY['report', 'veterinario', 'esportazione'], true, 25, 0, 0, 0),

-- ACCOUNT E ABBONAMENTI
('faq_026', 'Qual è la differenza tra piano Gratuito e Premium?', 'Piano Gratuito: 1 pet, funzionalità base, 5 analisi/mese. Piano Premium: pet illimitati, analisi illimitate, protocolli avanzati, musicoterapia, priorità supporto, esportazioni, API access. Upgrade quando vuoi dalla sezione Abbonamento.', 'account', ARRAY['piani', 'premium', 'differenze'], true, 26, 0, 0, 0),

('faq_027', 'Come cambio o cancello il mio abbonamento?', 'Vai su "Impostazioni" → "Abbonamento". Puoi: 1) Fare upgrade/downgrade, 2) Cancellare (mantieni accesso fino a fine periodo), 3) Riattivare abbonamento cancellato, 4) Aggiornare metodo di pagamento. Non perdi mai i tuoi dati.', 'account', ARRAY['abbonamento', 'cancellazione', 'upgrade'], true, 27, 0, 0, 0),

('faq_028', 'I miei dati sono sicuri?', 'Sì, usiamo crittografia end-to-end, backup automatici e compliance GDPR. I tuoi dati non vengono mai venduti a terzi. Puoi esportare o eliminare tutti i dati in qualsiasi momento dalla sezione Privacy nelle Impostazioni.', 'account', ARRAY['privacy', 'sicurezza', 'GDPR'], true, 28, 0, 0, 0),

-- SUPPORTO TECNICO
('faq_029', 'Come contatto il supporto tecnico?', 'Puoi contattarci tramite: 1) Chat AI live (disponibile 24/7), 2) Email support@petvoice.com, 3) Creazione ticket in questa sezione, 4) Community forum. Per emergenze veterinarie, contatta sempre il tuo veterinario.', 'support', ARRAY['contatto', 'supporto', 'assistenza'], true, 29, 0, 0, 0),

('faq_030', 'L''app è disponibile per mobile?', 'Stiamo sviluppando le app native iOS e Android. Attualmente puoi usare PetVoice dal browser mobile con un''esperienza ottimizzata. Iscriviti alla newsletter per essere notificato del rilascio delle app.', 'support', ARRAY['mobile', 'app', 'sviluppo'], true, 30, 0, 0, 0);

-- Update knowledge base with comprehensive guides
DELETE FROM public.support_knowledge_base;

INSERT INTO public.support_knowledge_base (id, title, content, category, tags, is_published, helpful_count, not_helpful_count, view_count) VALUES

('kb_001', 'Guida Completa: Primi Passi con PetVoice', 
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

## 3. Configurazione Diario

### Routine Quotidiana
- **Mattina:** Registra umore generale e energia
- **Durante il giorno:** Annota comportamenti particolari
- **Sera:** Valuta l''umore finale e attività svolte

### Best Practices
- Usa tag comportamentali specifici
- Aggiungi note dettagliate per eventi significativi
- Carica foto rappresentative del giorno
- Mantieni consistenza negli orari di registrazione

## 4. Ottimizzazione Wellness Score

### Fattori che Influenzano il Punteggio
- **Frequenza aggiornamenti diario:** +15 punti
- **Comportamenti positivi:** +10 punti per tag
- **Attività fisica regolare:** +12 punti
- **Analisi AI positive:** +8 punti
- **Protocolli completati:** +20 punti

### Strategie di Miglioramento
1. **Monitoraggio Costante:** Aggiorna il diario quotidianamente
2. **Attività Stimolanti:** Programma giochi e esercizi
3. **Socializzazione:** Usa Pet Matching per incontri
4. **Training Personalizzato:** Segui protocolli AI
5. **Veterinario:** Visite regolari programmate

## 5. Utilizzo Avanzato

### Protocolli di Training
- Crea protocolli per obiettivi specifici
- Monitora progressi giornalmente
- Adatta esercizi in base ai risultati
- Condividi successi con la community

### Musicoterapia Personalizzata
- Testa diverse playlist AI
- Osserva reazioni del pet
- Usa per situazioni specifiche (ansia, energia, relax)
- Combina con protocolli comportamentali

### Community e Supporto
- Partecipa a discussioni tematiche
- Condividi esperienze e ricevi consigli
- Organizza playdate tramite Pet Matching
- Collabora su protocolli di training

## 6. Risoluzione Problemi Comuni

### Wellness Score Basso
1. Verifica consistenza aggiornamenti
2. Identifica pattern comportamentali negativi
3. Implementa protocolli di miglioramento
4. Consulta veterinario se persistente

### Analisi AI Poco Accurate
1. Migliora qualità file (luce, audio)
2. Fornisci più contesto durante upload
3. Carica file in situazioni diverse
4. Aggiorna informazioni pet se cambiate

### Problemi Tecnici
1. Verifica connessione internet
2. Prova browser diverso o modalità incognito
3. Cancella cache e cookies
4. Contatta supporto tecnico

## 7. Suggerimenti Pro

### Fotografia e Video
- **Luce naturale:** Migliori risultati analisi
- **Angolazioni multiple:** Diversifica le prospettive
- **Momenti spontanei:** Cattura comportamenti naturali
- **Qualità HD:** Preferisci sempre alta risoluzione

### Gestione Dati
- **Backup regolari:** Esporta dati mensilmente
- **Organizzazione:** Usa tag e categorie coerenti
- **Condivisione:** Prepara report per veterinario
- **Privacy:** Controlla impostazioni condivisione

### Ottimizzazione Esperienza
- **Notifiche:** Configura promemoria personalizzati
- **Shortcuts:** Memorizza funzioni più usate
- **Integrazione:** Sincronizza con calendario
- **Community:** Costruisci rete di supporto',
'guide', ARRAY['guida', 'inizio', 'configurazione'], true, 0, 0, 0),

('kb_002', 'Analisi AI Avanzata: Guida Completa',
'# Analisi AI Avanzata: Guida Completa

## Introduzione all''AI di PetVoice

Il sistema di Intelligenza Artificiale di PetVoice utilizza algoritmi di machine learning avanzati per analizzare comportamenti, emozioni e stati fisici degli animali domestici attraverso contenuti multimediali.

## Tipi di Analisi Supportate

### 1. Analisi Video
**Cosa Analizza:**
- Movimenti corporei e postura
- Espressioni facciali
- Interazioni con ambiente e persone
- Livelli di energia e attività
- Comportamenti sociali

**Formati Supportati:** MP4, AVI, MOV, WEBM
**Durata Ottimale:** 10-120 secondi
**Qualità Raccomandata:** HD 720p+

### 2. Analisi Audio
**Cosa Analizza:**
- Tono e frequenza vocalizzazioni
- Intensità e pattern sonori
- Stato emotivo tramite voce
- Stress indicators
- Richieste comportamentali

**Formati Supportati:** MP3, WAV, M4A, OGG
**Durata Ottimale:** 5-60 secondi
**Qualità Raccomandata:** 44.1kHz, 16-bit

### 3. Analisi Fotografica
**Cosa Analizza:**
- Micro-espressioni facciali
- Postura e linguaggio corporeo
- Condizione fisica generale
- Stato degli occhi e orecchie
- Indicatori di stress o benessere

**Formati Supportati:** JPG, PNG, WEBP, HEIC
**Risoluzione Ottimale:** 1080p+

## Processo di Analisi

### 1. Pre-Elaborazione
- Normalizzazione qualità file
- Estrazione features multimodali
- Calibrazione algoritmi per specie
- Ottimizzazione per profilo pet

### 2. Analisi AI
- **Computer Vision:** Riconoscimento pattern visivi
- **Audio Processing:** Analisi spettrale e temporale
- **Behavioral Analysis:** Correlazione movimenti-emozioni
- **Pattern Recognition:** Confronto con database comportamentali

### 3. Post-Elaborazione
- Aggregazione risultati multi-fonte
- Calcolo confidence score
- Generazione insights personalizzati
- Correlazione con storico pet

## Interpretazione Risultati

### Emozioni Primarie Rilevate
- **Felicità** (90-100%): Comportamento positivo, gioco, affetto
- **Calma** (80-95%): Stato di riposo, rilassamento
- **Curiosità** (70-90%): Esplorazione, attenzione
- **Ansia** (60-85%): Stress, preoccupazione, disagio
- **Paura** (70-95%): Spavento, insicurezza
- **Aggressività** (80-98%): Minaccia, territorialità
- **Tristezza** (75-90%): Depressione, apatia

### Livelli di Confidenza
- **95-100%:** Certezza molto alta
- **85-94%:** Confidenza alta
- **70-84%:** Confidenza media
- **60-69%:** Confidenza bassa
- **<60%:** Risultato incerto

### Insights Comportamentali
Ogni analisi genera suggerimenti personalizzati basati su:
- Profilo specifico del pet
- Storico comportamentale
- Best practices veterinarie
- Pattern della razza
- Ambiente domestico

## Ottimizzazione Risultati

### Qualità File
**Video:**
- Illuminazione naturale uniforme
- Stabilità camera (evita tremolii)
- Messa a fuoco nitida
- Inquadratura completa dell''animale

**Audio:**
- Ambiente silenzioso
- Microfono vicino all''animale
- Evitare eco e riverbero
- Registrare vocalizzazioni spontanee

**Foto:**
- Luce naturale diretta
- Focus sul viso dell''animale
- Evitare ombre marcate
- Catturare espressioni naturali

### Contesto e Metadata
Fornisci sempre:
- Situazione specifica (gioco, riposo, cibo)
- Orario del giorno
- Presenza di altre persone/animali
- Eventi recenti significativi
- Stato di salute attuale

### Timing Ottimale
- **Mattina:** Energie fresche, comportamenti baseline
- **Pomeriggio:** Attività sociali, interazioni
- **Sera:** Stati di riposo, routine
- **Situazioni Specifiche:** Eventi particolari, stress, gioia

## Funzionalità Avanzate

### Analisi Comparativa
- Confronto con periodi precedenti
- Trend comportamentali a lungo termine
- Identificazione cambiamenti significativi
- Correlazioni con eventi esterni

### Machine Learning Personalizzato
- Adattamento algoritmi al singolo pet
- Apprendimento pattern comportamentali specifici
- Miglioramento accuracy nel tempo
- Personalizzazione insights

### Integrazione Diario
- Correlazione automatica con entries
- Validazione cross-reference
- Suggerimenti tag comportamentali
- Aggiornamento automatico wellness score

## Limitazioni e Considerazioni

### Limitazioni Tecniche
- Qualità file influenza accuracy
- Razze particolari possono avere variazioni
- Contesto ambientale importante
- Non sostituisce valutazione veterinaria

### Uso Responsabile
- Combinare sempre con osservazione diretta
- Consultare veterinario per preoccupazioni serie
- Non basare decisioni mediche solo su AI
- Utilizzare come strumento di supporto

### Privacy e Sicurezza
- Tutti i file vengono crittografati
- Analisi processate in cloud sicuro
- Dati non condivisi con terze parti
- Possibilità eliminazione completa

## Troubleshooting

### Problemi Comuni
**"Analisi non completata"**
- Verifica formato file supportato
- Controlla dimensione massima (50MB)
- Assicurati connessione stabile

**"Confidenza molto bassa"**
- Migliora qualità file
- Aggiungi più contesto
- Riprova in condizioni diverse

**"Nessuna emozione rilevata"**
- Assicurati che l''animale sia visibile
- Verifica durata minima (3 secondi)
- Controlla che non sia in movimento eccessivo

### Supporto Tecnico
- Chat AI live per assistenza immediata
- Email tecnico: ai-support@petvoice.com
- Video tutorial nella knowledge base
- Community forum per confronto esperienze',
'guide', ARRAY['AI', 'analisi', 'avanzata'], true, 0, 0, 0);