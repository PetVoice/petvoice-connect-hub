-- Creo tutti gli esercizi mancanti per i protocolli incompleti

-- ============ ESERCIZI PER "Superare la Paura" (6 giorni x 3 = 18 esercizi) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'pauroso' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Ambiente Sicuro', 'Creazione di uno spazio protetto dove il pet si sente al sicuro', 20, ARRAY['Scegli una stanza tranquilla', 'Posiziona oggetti familiari', 'Elimina rumori forti', 'Osserva i segnali di rilassamento'], ARRAY['Coperta familiare', 'Giocattolo preferito', 'Ciotole acqua e cibo']),
  (1, 'Presenza Rassicurante', 'Tecnica di presenza calma per trasmettere sicurezza', 15, ARRAY['Siediti vicino senza forzare contatto', 'Parla con voce calma e bassa', 'Evita movimenti bruschi', 'Rispetta i suoi tempi'], ARRAY['Snack calmanti', 'Voce dolce']),
  (1, 'Esposizione Minima', 'Prima esposizione molto graduale al trigger', 10, ARRAY['Introduci lo stimolo a distanza', 'Premia ogni momento di calma', 'Ferma se mostra stress', 'Ripeti solo se rimane calmo'], ARRAY['Guinzaglio lungo', 'Premi di alto valore']),
  
  -- Giorno 2
  (2, 'Gioco Calmante', 'Attività ludica rilassante per ridurre tensione', 25, ARRAY['Usa giochi lenti e prevedibili', 'Evita competizione', 'Premia la partecipazione', 'Termina prima che si stanchi'], ARRAY['Giocattoli morbidi', 'Premi piccoli']),
  (2, 'Desensibilizzazione Audio', 'Abituazione graduale ai suoni temuti', 15, ARRAY['Riproduci suoni a volume bassissimo', 'Aumenta gradualmente se rimane calmo', 'Abbassa se mostra stress', 'Associa a cose positive'], ARRAY['Diffusore musicale', 'Snack durante ascolto']),
  (2, 'Comandi di Base Rilassati', 'Training semplice per aumentare fiducia', 20, ARRAY['Insegna "seduto" e "resta"', 'Usa solo rinforzo positivo', 'Sessioni molto brevi', 'Celebra ogni successo'], ARRAY['Premi motivanti', 'Clicker se gradito']),
  
  -- Giorno 3
  (3, 'Passeggiata Sicura', 'Esplorazione controllata dell''ambiente esterno', 30, ARRAY['Scegli percorsi familiari', 'Evita zone trafficate', 'Permettigli di fermarsi e annusare', 'Torna dentro se troppo stressato'], ARRAY['Guinzaglio comodo', 'Acqua per strada']),
  (3, 'Socializzazione Protetta', 'Incontri controllati con persone fidate', 20, ARRAY['Invita una persona calma', 'Lascia che si avvicini lui', 'Non forzare interazioni', 'Premia comportamenti coraggiosi'], ARRAY['Premi condivisi con visitatore', 'Spazio di fuga sempre disponibile']),
  (3, 'Esercizio di Respirazione', 'Tecnica per calmare insieme pet e padrone', 10, ARRAY['Siediti accanto a lui', 'Respira lentamente e profondamente', 'Accarezza dolcemente se gradisce', 'Mantieni atmosfera zen'], ARRAY['Cuscino comodo', 'Musica rilassante']),
  
  -- Giorno 4
  (4, 'Sfida Graduata', 'Affrontare una paura specifica con supporto', 25, ARRAY['Scegli UNA paura da affrontare', 'Inizia da versione molto attenuata', 'Premia ogni piccolo progresso', 'Non superare la soglia di stress'], ARRAY['Trigger attenuato', 'Premi eccezionali']),
  (4, 'Gioco di Fiducia', 'Attività per costruire fiducia reciproca', 20, ARRAY['Nasconditi e chiamalo dolcemente', 'Premia quando viene', 'Usa il suo nome con affetto', 'Fai movimenti lenti e prevedibili'], ARRAY['Nascondiglio sicuro', 'Voce incoraggiante']),
  (4, 'Massaggio Anti-stress', 'Tocco terapeutico per rilassamento profondo', 15, ARRAY['Inizia dalle aree che preferisce', 'Movimenti circolari lenti', 'Fermati se si irrigidisce', 'Termina con carezze dolci'], ARRAY['Mani calde', 'Olio per massaggi pet-safe']),
  
  -- Giorno 5
  (5, 'Esplorazione Guidata', 'Scoperta di nuovi ambienti con sicurezza', 30, ARRAY['Esplora un posto nuovo ma tranquillo', 'Lascia che guidi lui il ritmo', 'Porta oggetti familiari', 'Mantieni sessioni brevi'], ARRAY['Trasportino familiare', 'Coperta che sa di casa']),
  (5, 'Training Positivo Avanzato', 'Comandi più complessi per aumentare sicurezza', 25, ARRAY['Insegna "cerca" o "porta"', 'Usa solo metodi positivi', 'Premia tentativi non solo successi', 'Fai pause frequenti'], ARRAY['Oggetti da cercare', 'Premi gustosi']),
  (5, 'Simulazione Controllata', 'Prova situazione temuta in sicurezza', 15, ARRAY['Ricrea situazione paura in miniatura', 'Tu rimani calmo e sicuro', 'Interrompi ai primi segni stress', 'Finisci sempre positivamente'], ARRAY['Scenario controllato', 'Via di fuga sempre aperta']),
  
  -- Giorno 6
  (6, 'Test di Progresso', 'Valutazione dei miglioramenti ottenuti', 20, ARRAY['Riesponi gradualmente al trigger originale', 'Osserva miglioramenti comportamentali', 'Documenta progressi', 'Premia ogni successo'], ARRAY['Diario progressi', 'Camera per video']),
  (6, 'Consolidamento', 'Rinforzo di tutte le tecniche apprese', 25, ARRAY['Ripeti esercizi preferiti dei giorni scorsi', 'Combina tecniche che hanno funzionato', 'Mantieni ambiente positivo', 'Celebra i progressi fatti'], ARRAY['Kit completo giorni precedenti']),
  (6, 'Pianificazione Futura', 'Preparazione per mantenere progressi', 15, ARRAY['Identifica strategie più efficaci', 'Pianifica routine di mantenimento', 'Preparati per possibili regressioni', 'Stabilisci promemoria regolari'], ARRAY['Piano scritto', 'Calendario promemoria'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- ============ ESERCIZI PER "Recupero dall'Apatia" (8 giorni x 3 = 24 esercizi) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'depresso' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Risveglio dell''Interesse', 'Stimolazione graduale della curiosità', 15, ARRAY['Mostra nuovi giocattoli senza forzare', 'Cambia posizione ciotole', 'Introduci odori interessanti', 'Premia ogni segnale di interesse'], ARRAY['Giocattoli nuovi', 'Snack profumati']),
  (1, 'Movimento Dolce', 'Attivazione fisica molto graduale', 10, ARRAY['Incoraggia piccoli movimenti', 'Premia alzarsi o camminare', 'Non forzare attività intense', 'Rispetta i suoi ritmi'], ARRAY['Guinzaglio morbido', 'Premi lungo il percorso']),
  (1, 'Presenza Energizzante', 'Trasmissione di energia positiva', 20, ARRAY['Siediti vicino con energia calma ma positiva', 'Parla con tono incoraggiante', 'Sorridi e mantieni linguaggio corporeo aperto', 'Condividi attività semplici'], ARRAY['Energia positiva', 'Voce incoraggiante']),
  
  -- Giorno 2
  (2, 'Gioco Motivazionale', 'Attività ludica per riaccendere entusiasmo', 25, ARRAY['Usa il suo gioco preferito del passato', 'Inizia con movimenti lenti', 'Premia ogni partecipazione', 'Aumenta intensità se risponde'], ARRAY['Giocattolo del cuore', 'Premi speciali']),
  (2, 'Stimolazione Sensoriale', 'Riattivazione dei sensi per combattere apatia', 15, ARRAY['Offri texture diverse da toccare', 'Porta nuovi odori da annusare', 'Suoni dolci e interessanti', 'Sapori nuovi ma appetitosi'], ARRAY['Materiali tattili', 'Essenze naturali', 'Snack vari']),
  (2, 'Socializzazione Leggera', 'Incontri sociali per stimolare interesse', 20, ARRAY['Invita amico peloso tranquillo', 'Organizza incontro in territorio neutro', 'Non forzare interazione', 'Premia interesse verso altri'], ARRAY['Amico a quattro zampe', 'Spazio neutro']),
  
  -- Giorno 3
  (3, 'Esplorazione Territoriale', 'Riscoperta dell''ambiente circostante', 30, ARRAY['Porta in posto nuovo ma non troppo stimolante', 'Lascia esplorare liberamente', 'Incoraggia annusare e investigare', 'Premia curiosità'], ARRAY['Nuovo territorio sicuro', 'Tempo libero']),
  (3, 'Attività Creativa', 'Stimolazione mentale attraverso problem-solving', 20, ARRAY['Nascondi snack in giocattoli puzzle', 'Crea percorsi semplici da seguire', 'Incoraggia "pensare" per ottenere cibo', 'Premia tentativi creativi'], ARRAY['Puzzle alimentari', 'Nascondigli facili']),
  (3, 'Routine Energizzante', 'Creazione di abitudini che aumentano energia', 15, ARRAY['Stabilisci orari fissi per attività positive', 'Associa routine a premi', 'Mantieni costanza nei tempi', 'Celebra completamento routine'], ARRAY['Orologio/timer', 'Premi routine']),
  
  -- Giorno 4
  (4, 'Sfida Mentale Progressiva', 'Compiti più complessi per stimolare mente', 25, ARRAY['Aumenta difficoltà puzzle precedenti', 'Insegna trick semplice nuovo', 'Usa clicker training se gradisce', 'Premia problem-solving'], ARRAY['Puzzle più complessi', 'Clicker', 'Premi graduati']),
  (4, 'Attività Fisica Moderata', 'Incremento graduale del movimento', 30, ARRAY['Passeggiata più lunga del solito', 'Introduci elementi di gioco durante cammino', 'Varia il percorso per interesse', 'Premia resistenza e energia'], ARRAY['Percorso variato', 'Giocattoli portatili']),
  (4, 'Interazione Intensa', 'Momenti di connessione profonda', 15, ARRAY['Dedica tempo solo a lui', 'Giochi di sguardi e comunicazione', 'Training personalizzato sui suoi punti forti', 'Celebra la connessione'], ARRAY['Attenzione totale', 'Comunicazione diretta']),
  
  -- Giorno 5
  (5, 'Avventura Controllata', 'Esperienza stimolante ma sicura', 35, ARRAY['Visita posto completamente nuovo', 'Porta kit sopravvivenza comfort', 'Documenta reazioni positive', 'Torna prima che si stanchi'], ARRAY['Nuova destinazione', 'Kit comfort']),
  (5, 'Gioco Sociale Attivo', 'Interazione dinamica con altri', 25, ARRAY['Organizza playdate con cane energico ma gentile', 'Supervisiona senza interferire troppo', 'Premia comportamenti giocosi', 'Gestisci energia crescente'], ARRAY['Partner di gioco', 'Spazio ampio']),
  (5, 'Stimolazione Multisensoriale', 'Attivazione completa di tutti i sensi', 20, ARRAY['Combina suoni, odori, texture, sapori', 'Crea percorso sensoriale', 'Premia esplorazione attiva', 'Mantieni ambiente sicuro'], ARRAY['Setup multisensoriale completo']),
  
  -- Giorno 6
  (6, 'Autonomia Guidata', 'Sviluppo di iniziativa personale', 30, ARRAY['Lascia più libertà di scelta nelle attività', 'Presenta opzioni e lascia scegliere', 'Premia decisioni autonome', 'Supporta senza dirigere'], ARRAY['Opzioni multiple', 'Supporto discreto']),
  (6, 'Training Motivazionale', 'Apprendimento che aumenta autostima', 25, ARRAY['Insegna tricks che gli riescono bene', 'Progredisci velocemente su punti forti', 'Celebra ogni successo apertamente', 'Costruisci fiducia nelle capacità'], ARRAY['Tricks favoriti', 'Rinforzi entusiastici']),
  (6, 'Energia Condivisa', 'Attività che coinvolgono tutta la famiglia', 20, ARRAY['Coinvolgi altri membri famiglia', 'Attività di gruppo divertenti', 'Premia partecipazione sociale', 'Crea momenti di gioia collettiva'], ARRAY['Coinvolgimento familiare', 'Attività gruppo']),
  
  -- Giorno 7
  (7, 'Sfida Personale', 'Obiettivo ambizioso ma raggiungibile', 30, ARRAY['Imposta obiettivo sfidante per lui', 'Suddividi in passi gestibili', 'Supporta senza sostituire', 'Celebra raggiungimento'], ARRAY['Obiettivo personalizzato', 'Piano step-by-step']),
  (7, 'Celebrazione Attiva', 'Festa per progressi ottenuti', 25, ARRAY['Organizza "festa" per i suoi progressi', 'Invita i suoi amici preferiti', 'Attività tutte positive e premianti', 'Documenta momenti felici'], ARRAY['Decorazioni festive', 'Amici del cuore', 'Premi speciali']),
  (7, 'Routine Energetica', 'Consolidamento nuove abitudini positive', 15, ARRAY['Ripeti le attività che l''hanno più motivato', 'Stabilisci routine giornaliera energetica', 'Pianifica continuità post-protocollo', 'Mantieni momentum positivo'], ARRAY['Piano routine', 'Promemoria motivazionali']),
  
  -- Giorno 8
  (8, 'Valutazione Progressi', 'Misurazione miglioramenti ottenuti', 20, ARRAY['Confronta energia attuale con giorno 1', 'Documenta comportamenti più attivi', 'Identifica trigger di motivazione', 'Celebra trasformazione'], ARRAY['Diario confronto', 'Metriche di progresso']),
  (8, 'Mantentimento Energia', 'Strategie per conservare vitalità', 25, ARRAY['Identifica attività che più lo motivano', 'Crea piano settimanale varietà', 'Stabilisci segnali di calo energia', 'Prepara interventi preventivi'], ARRAY['Piano mantenimento', 'Calendario attività']),
  (8, 'Futuro Energetico', 'Programmazione a lungo termine', 15, ARRAY['Stabilisci obiettivi energetici futuri', 'Pianifica nuove sfide progressive', 'Crea rete supporto sociale', 'Mantieni crescita continua'], ARRAY['Obiettivi futuri', 'Rete supporto'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);