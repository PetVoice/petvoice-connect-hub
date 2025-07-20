-- Creazione protocollo "Ottimizzazione Ciclo Sonno-Veglia" - 7 giorni, livello principiante
-- IMPORTANTE: Configurato correttamente fin dall'inizio per evitare problemi

INSERT INTO ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  status,
  is_public,
  user_id,
  ai_generated,
  veterinary_approved,
  estimated_cost,
  community_rating,
  community_usage,
  required_materials,
  triggers,
  current_day,
  progress_percentage,
  success_rate,
  notifications_enabled,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Ottimizzazione Ciclo Sonno-Veglia',
  'Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.',
  'comportamento',
  'facile',
  7,
  'Stabilire cicli sonno-veglia regolari e ridurre disturbi del sonno',
  'available',  -- CORRETTO fin dall'inizio
  true,         -- PUBBLICO fin dall'inizio
  NULL,         -- Nessun proprietario specifico
  true,
  true,
  15.00,
  8.5,
  156,
  ARRAY['Cuccia comoda', 'Luci soffuse/dimmerabili', 'Musica rilassante pet-safe', 'Aromatherapy pet-safe', 'Coperte morbide', 'Timer per routine'],
  ARRAY['Irrequietezza notturna', 'Risvegli frequenti', 'Difficoltà addormentamento', 'Attività notturna eccessiva', 'Stress da cambi orari'],
  1,
  0,
  85.0,
  true,
  now(),
  now()
);

-- Recupera l'ID del protocollo appena creato
-- Useremo questo ID per creare gli esercizi
DO $$
DECLARE
    protocol_id UUID;
BEGIN
    -- Ottieni l'ID del protocollo appena creato
    SELECT id INTO protocol_id 
    FROM ai_training_protocols 
    WHERE title = 'Ottimizzazione Ciclo Sonno-Veglia' 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- GIORNO 1: Creazione Routine Pre-Sonno Costante
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 1, 'Ritual del Tramonto Rilassante', 'Stabilire una routine serale costante che segnali l''arrivo del momento del riposo. Creare associazioni positive con l''ora di andare a dormire attraverso attività calmanti e prevedibili.', 15, 'behavioral', 
     ARRAY['Inizia la routine sempre alla stessa ora (2 ore prima del sonno)', 'Riduci gradualmente luci e rumori nell''ambiente', 'Parla con voce calma e rassicurante', 'Evita giochi stimolanti o attività eccitanti', 'Mantieni la sequenza sempre uguale ogni sera'], 
     ARRAY['Luci dimmerabili', 'Ambiente silenzioso', 'Voce calma'], 8),
    
    (protocol_id, 1, 'Massaggio Serale Anti-Stress', 'Sessione di massaggio delicato per rilassare muscoli e mente, favorendo il rilascio di endorfine naturali che inducono calma e sonnolenza.', 12, 'physical', 
     ARRAY['Inizia con carezze leggere su collo e spalle', 'Massaggia delicatamente dietro le orecchie con movimenti circolari', 'Accarezza lentamente dalla testa verso la coda', 'Usa pressione leggera e costante', 'Termina con carezze su pancia se gradite'], 
     ARRAY['Mani pulite e calde', 'Ambiente tranquillo', 'Posizione comoda'], 9),
    
    (protocol_id, 1, 'Breathing Harmony Technique', 'Tecnica di sincronizzazione respiratoria che calma il sistema nervoso e prepara corpo e mente al riposo notturno.', 10, 'behavioral', 
     ARRAY['Siediti accanto in posizione rilassata', 'Respira lentamente e profondamente in modo udibile', 'Conta mentalmente: 4 secondi inspirazione, 6 secondi espirazione', 'Mantieni il ritmo costante per tutta la sessione', 'Parla dolcemente solo se necessario per tranquillizzare'], 
     ARRAY['Posizione comoda', 'Ambiente silenzioso', 'Pazienza e costanza'], 8);

    -- GIORNO 2: Consolidamento Routine Pre-Sonno
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 2, 'Sleep Command Training', 'Insegnare un comando specifico associato al momento di andare a dormire, creando un trigger verbale per il rilassamento.', 18, 'behavioral', 
     ARRAY['Scegli una parola specifica come "nanna" o "riposo"', 'Pronuncia il comando solo quando è veramente ora di dormire', 'Accompagna sempre con gesti calmi verso la cuccia', 'Ricompensa immediatamente quando si dirige verso l''area riposo', 'Ripeti con pazienza e costanza ogni sera'], 
     ARRAY['Comando verbale scelto', 'Snack piccoli per ricompensa', 'Cuccia designata'], 8),
    
    (protocol_id, 2, 'Sanctuary Setup Rituale', 'Preparazione rituale dell''area notte per creare un ambiente ottimale che favorisca il sonno profondo e riposante.', 14, 'behavioral', 
     ARRAY['Sistema la cuccia sempre nello stesso posto', 'Aggiungi una coperta morbida con odore familiare', 'Riduci illuminazione a livello minimo necessario', 'Elimina fonti di rumore o distrazione', 'Controlla temperatura per comfort ottimale (18-22°C)'], 
     ARRAY['Cuccia preferita', 'Coperta morbida', 'Controllo illuminazione', 'Termometro ambiente'], 9),
    
    (protocol_id, 2, 'Progressive Muscle Relaxation', 'Tecnica di rilassamento muscolare progressivo per sciogliere tensioni accumulate durante il giorno.', 16, 'physical', 
     ARRAY['Inizia con massaggio leggero delle zampe anteriori', 'Procedi verso spalle e collo con movimenti circolari', 'Massaggia delicatamente i muscoli della schiena', 'Concludi con carezze rilassanti su tutto il corpo', 'Mantieni sempre pressione leggera e movimenti lenti'], 
     ARRAY['Superficie comoda per sdraiarsi', 'Mani calde', 'Olio per massaggi pet-safe (opzionale)'], 9);

    -- GIORNO 3: Ottimizzazione Ambiente e Comfort
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 3, 'Perfect Sleep Environment', 'Ottimizzazione completa dell''ambiente per creare le condizioni ideali per un sonno ristoratore e ininterrotto.', 20, 'behavioral', 
     ARRAY['Elimina tutte le fonti di luce diretta nell''area riposo', 'Usa tende oscuranti o coperture se necessario', 'Posiziona la cuccia lontano da passaggi frequenti', 'Assicurati che la temperatura sia stabile (18-22°C)', 'Rimuovi oggetti che potrebbero cadere o fare rumore'], 
     ARRAY['Tende oscuranti', 'Termometro', 'Cuccia di qualità', 'Isolamento acustico'], 9),
    
    (protocol_id, 3, 'Aromatherapy Evening Calm', 'Utilizzo sicuro di aromi naturali pet-friendly per creare un''atmosfera rilassante che favorisce il sonno.', 12, 'behavioral', 
     ARRAY['Usa solo oli essenziali sicuri per animali (lavanda diluita)', 'Applica 2-3 gocce su un panno a distanza di sicurezza', 'Mai applicare direttamente sulla pelle o pelliccia', 'Osserva attentamente reazioni allergiche o fastidio', 'Rimuovi immediatamente se mostra disagio'], 
     ARRAY['Oli essenziali pet-safe', 'Diffusore sicuro o panno', 'Ventilazione adeguata'], 8),
    
    (protocol_id, 3, 'Sound Sleep Therapy', 'Terapia sonora per creare un ambiente acustico che induce calma e blocca rumori disturbanti.', 25, 'behavioral', 
     ARRAY['Scegli musica classica o suoni della natura a volume basso', 'Mantieni volume costante per tutta la notte se necessario', 'Evita musica con ritmi troppo vivaci o improvvisi', 'Testa diverse opzioni per trovare la preferita', 'Posiziona la fonte audio a distanza adeguata'], 
     ARRAY['Speaker o dispositivo audio', 'Playlist di musica rilassante', 'Controllo volume'], 8);

    -- GIORNO 4: Perfezionamento Comfort Notturno
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 4, 'Comfort Zone Optimization', 'Perfezionamento della zona notte per massimizzare comfort fisico e sicurezza emotiva durante il riposo.', 18, 'behavioral', 
     ARRAY['Valuta la qualità del supporto della cuccia per articolazioni', 'Aggiungi cuscini extra se necessario per comfort', 'Posiziona una coperta con il tuo odore per sicurezza emotiva', 'Assicurati che l''area sia libera da correnti d''aria', 'Verifica che possa vedere l''uscita per sentirsi sicuro'], 
     ARRAY['Cuccia ergonomica', 'Cuscini aggiuntivi', 'Coperta personale', 'Valutazione spazi'], 9),
    
    (protocol_id, 4, 'Night Security Routine', 'Routine di sicurezza serale per ridurre ansia e preoccupazioni che possono disturbare il sonno.', 15, 'behavioral', 
     ARRAY['Controlla insieme tutte le porte e finestre prima di dormire', 'Assicurati che conosca la posizione della sua area riposo', 'Lascia una luce notturna tenue se necessario', 'Stabilisci dove dormirai tu per la sua tranquillità', 'Crea un rituale di "controllo sicurezza" rassicurante'], 
     ARRAY['Routine di controllo', 'Luce notturna tenue', 'Comunicazione rassicurante'], 8),
    
    (protocol_id, 4, 'Deep Sleep Induction', 'Tecnica avanzata di induzione del sonno profondo attraverso stimolazione di punti di pressione rilassanti.', 20, 'physical', 
     ARRAY['Massaggia delicatamente il punto tra gli occhi con movimento circolare', 'Applica pressione leggera alla base del cranio', 'Accarezza lentamente le orecchie dall''alto verso il basso', 'Massaggia dolcemente i cuscinetti delle zampe', 'Termina con carezze lunghe e lente su tutto il corpo'], 
     ARRAY['Conoscenza punti di pressione', 'Tocco delicato', 'Pazienza e concentrazione'], 9);

    -- GIORNO 5: Regolazione Attività Diurna/Notturna
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 5, 'Circadian Light Therapy', 'Regolazione dell''esposizione alla luce per sincronizzare il ritmo circadiano naturale con l''alternanza giorno-notte.', 22, 'behavioral', 
     ARRAY['Esponi alla luce naturale brillante al mattino (30+ minuti)', 'Riduci gradualmente intensità luminosa dal pomeriggio', 'Evita luci forti 2 ore prima del sonno programmato', 'Usa luci calde (gialle) invece di fredde (blu) la sera', 'Mantieni buio completo durante le ore notturne'], 
     ARRAY['Accesso luce naturale', 'Luci dimmerabili', 'Timer per illuminazione', 'Tende oscuranti'], 9),
    
    (protocol_id, 5, 'Energy Balance Training', 'Bilanciamento delle attività diurne per garantire stanchezza sana la sera senza sovrastimolazione.', 25, 'physical', 
     ARRAY['Programma attività fisica moderata al mattino o primo pomeriggio', 'Evita esercizi intensi nelle 3 ore prima del sonno', 'Includi stimolazione mentale durante il giorno', 'Riduci gradualmente attività verso sera', 'Termina la giornata con attività calme e rilassanti'], 
     ARRAY['Piano attività giornaliere', 'Giochi per stimolazione mentale', 'Controllo timing attività'], 8),
    
    (protocol_id, 5, 'Night Distraction Management', 'Gestione delle distrazioni notturne per mantenere focus sul riposo e ridurre risvegli.', 16, 'behavioral', 
     ARRAY['Identifica e rimuovi fonti di rumore o movimento notturno', 'Blocca la vista di finestre verso strade trafficate', 'Usa suoni bianchi o rosa per mascherare rumori esterni', 'Stabilisci che le attività notturne non sono permesse', 'Ignora comportamenti di richiesta attenzione notturna'], 
     ARRAY['Identificazione distrazioni', 'Suoni mascheranti', 'Blocco stimoli visivi'], 8);

    -- GIORNO 6: Stabilizzazione Pattern Naturali
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 6, 'Natural Rhythm Reinforcement', 'Rinforzo dei ritmi naturali attraverso timing ottimale di pasti, attività e riposo.', 20, 'behavioral', 
     ARRAY['Stabilisci orari fissi per pasti mattutini e serali', 'Mantieni intervalli regolari tra attività e riposo', 'Usa l''ora del pasto serale come segnale pre-sonno', 'Evita spuntini tardivi che possono disturbare il sonno', 'Sincronizza tutti gli aspetti della routine con il ciclo sonno-veglia'], 
     ARRAY['Orari fissi pasti', 'Piano routine giornaliera', 'Controllo timing attività'], 9),
    
    (protocol_id, 6, 'Self-Regulation Skills', 'Sviluppo di abilità di autoregolazione per gestire autonomamente l''ansia o agitazione notturna.', 18, 'behavioral', 
     ARRAY['Insegna tecniche di auto-calmamento come leccarsi o sistemarsi', 'Rinforza positivamente quando si calma spontaneamente', 'Crea associazioni positive con la sua area riposo', 'Non intervenire immediatamente se si sveglia, lascia auto-regolarsi', 'Premia comportamenti di rilassamento autonomo'], 
     ARRAY['Rinforzi positivi', 'Osservazione paziente', 'Area riposo confortevole'], 8),
    
    (protocol_id, 6, 'Sleep Quality Assessment', 'Valutazione e monitoraggio della qualità del sonno per identificare miglioramenti e aree di ottimizzazione.', 15, 'behavioral', 
     ARRAY['Osserva durata del sonno ininterrotto (obiettivo: 6+ ore)', 'Nota frequenza di risvegli e loro cause', 'Valuta la facilità di addormentamento (< 20 minuti)', 'Osserva il comportamento al risveglio (riposato vs stanco)', 'Documenta progressi e pattern identificati'], 
     ARRAY['Diario del sonno', 'Timer per monitoraggio', 'Osservazione sistematica'], 8);

    -- GIORNO 7: Consolidamento Pattern Sonno Naturale
    INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, effectiveness_score) VALUES
    (protocol_id, 7, 'Master Sleep Routine Integration', 'Integrazione completa di tutti gli elementi appresi per creare una routine di sonno ottimale e sostenibile.', 25, 'behavioral', 
     ARRAY['Combina tutti gli elementi più efficaci delle sessioni precedenti', 'Esegui la routine completa senza interruzioni', 'Mantieni timing preciso per ogni fase della routine', 'Osserva quale combinazione produce i migliori risultati', 'Stabilisci questa come routine standard per il futuro'], 
     ARRAY['Tutti i materiali precedenti', 'Routine consolidata', 'Timer per fasi'], 9),
    
    (protocol_id, 7, 'Independent Sleep Mastery', 'Sviluppo dell''autonomia nel sonno, riducendo la dipendenza da interventi esterni per addormentarsi.', 20, 'behavioral', 
     ARRAY['Riduci gradualmente la tua presenza fisica durante l''addormentamento', 'Lascia che si addormenti autonomamente nella sua area', 'Intervieni solo se mostra vera distress, non semplice agitazione', 'Rinforza positivamente l''addormentamento indipendente', 'Celebra i successi di sonno autonomo'], 
     ARRAY['Graduale riduzione assistenza', 'Rinforzi positivi', 'Monitoraggio discreto'], 9),
    
    (protocol_id, 7, 'Long-term Sleep Success Plan', 'Creazione di un piano a lungo termine per mantenere i risultati ottenuti e continuare il miglioramento.', 22, 'behavioral', 
     ARRAY['Documenta tutti gli elementi che hanno funzionato meglio', 'Stabilisci una routine quotidiana sostenibile', 'Identifica segnali di allarme per regressioni del sonno', 'Pianifica controlli periodici della qualità del sonno', 'Crea strategie per gestire situazioni speciali (viaggi, cambiamenti)'], 
     ARRAY['Piano scritto', 'Lista controllo routine', 'Strategie emergenza'], 10);

END $$;