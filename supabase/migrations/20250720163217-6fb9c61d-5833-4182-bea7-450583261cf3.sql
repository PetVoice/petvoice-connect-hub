-- Inserimento protocollo "Riattivazione Energia e Motivazione"
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  triggers,
  required_materials,
  status,
  is_public,
  ai_generated,
  veterinary_approved,
  estimated_cost,
  success_rate,
  community_rating,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  'Riattivazione Energia e Motivazione',
  'Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell''interesse sociale.',
  'comportamento',
  'principiante',
  8,
  'Riattivazione motivazione, energia e interesse',
  ARRAY['depressione', 'apatia', 'letargia', 'perdita interesse', 'scarsa motivazione', 'isolamento sociale'],
  ARRAY['snack speciali ad alto valore', 'giocattoli nuovi e stimolanti', 'tessuti con texture diverse', 'profumi/essenze naturali', 'puzzle alimentari', 'tappetini antiscivolo', 'guinzaglio morbido', 'spazzola delicata'],
  'available',
  true,
  true,
  false,
  25.50,
  0,
  0,
  now(),
  now()
);

-- GIORNO 1: Risveglio Sensoriale - Stimoli Olfattivi
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  1,
  '🌸 Risveglio Olfattivo Delicato',
  'Stimolazione graduale attraverso profumi naturali per riattivare i sensi e l''interesse verso l''ambiente circostante.',
  'behavioral',
  8,
  ARRAY[
    'Prepara 3-4 profumi diversi (lavanda, menta, camomilla)',
    'Avvicinati lentamente all''animale con movimenti calmi',
    'Presenta un profumo alla volta a 30cm dal naso',
    'Osserva le reazioni: movimento orecchie, annusare, alzare la testa',
    'Premia ogni piccola reazione con voce dolce',
    'Se mostra interesse, lascia annusare più a lungo',
    'Termina con il profumo preferito'
  ],
  ARRAY['essenze naturali (lavanda, menta, camomilla)', 'fazzoletti di carta', 'snack speciali'],
  85
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  1,
  '🤲 Tesoro Nascosto Semplice',
  'Caccia al tesoro base per stimolare curiosità e movimento volontario attraverso l''olfatto.',
  'behavioral',
  10,
  ARRAY[
    'Nascondi 5 snack speciali in luoghi facilmente accessibili',
    'Inizia con snack parzialmente visibili',
    'Guida l''animale verso il primo snack con voce incoraggiante',
    'Celebra ogni scoperta con entusiasmo moderato',
    'Aumenta gradualmente la difficoltà dei nascondigli',
    'Termina quando l''animale trova almeno 3 snack',
    'Se si stanca, riduci il numero di nascondigli'
  ],
  ARRAY['snack ad alto valore (pollo, formaggio)', 'contenitori piccoli', 'voce calma e incoraggiante'],
  80
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  1,
  '🎵 Risveglio Sonoro Dolce',
  'Stimolazione uditiva graduale per riattivare l''attenzione e l''interesse verso i suoni dell''ambiente.',
  'behavioral',
  7,
  ARRAY[
    'Inizia con suoni molto bassi (carillon, musica classica)',
    'Osserva se l''animale muove orecchie o testa',
    'Prova suoni della natura (uccellini, acqua che scorre)',
    'Alterna momenti di silenzio con suoni dolci',
    'Premia qualsiasi segno di attenzione con carezze',
    'Termina con il suono che ha provocato più reazione',
    'Mantieni sempre volume basso per non spaventare'
  ],
  ARRAY['speaker bluetooth a basso volume', 'playlist suoni rilassanti', 'carezze come ricompensa'],
  75
);

-- GIORNO 2: Risveglio Sensoriale - Stimoli Tattili
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  2,
  '🪶 Esplorazione Texture Morbide',
  'Stimolazione tattile attraverso diverse superfici per risvegliare la curiosità e il piacere del contatto.',
  'behavioral',
  10,
  ARRAY[
    'Prepara 4-5 tessuti diversi (velluto, pelliccia sintetica, seta)',
    'Posiziona i tessuti a terra in cerchio',
    'Invita l''animale ad avvicinarsi senza forzare',
    'Mostra tu stesso come toccare i tessuti',
    'Premia qualsiasi esplorazione spontanea',
    'Se mostra preferenza per un tessuto, lascialo riposare sopra',
    'Termina con coccole sul tessuto preferito'
  ],
  ARRAY['tessuti vari (velluto, pelliccia, seta, lana)', 'tappetino base', 'pazienza e dolcezza'],
  88
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  2,
  '🌈 Gioco Colori Stimolanti',
  'Stimolazione visiva attraverso oggetti colorati per riattivare l''interesse e l''attenzione visiva.',
  'behavioral',
  8,
  ARRAY[
    'Disponi oggetti colorati (rosso, giallo, blu) a distanze diverse',
    'Inizia muovendo lentamente un oggetto colorato',
    'Osserva se l''animale segue con lo sguardo',
    'Avvicina gradualmente l''oggetto più interessante',
    'Permetti di annusare e esplorare a suo ritmo',
    'Cambia oggetto se perde interesse',
    'Termina con l''oggetto che ha attirato di più'
  ],
  ARRAY['palline colorate', 'nastri colorati', 'giocattoli vivaci', 'movimento lento delle mani'],
  82
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  2,
  '💆 Massaggio Rilassante Motivante',
  'Massaggio delicato per riattivare la connessione positiva con il tocco umano e stimolare benessere.',
  'physical',
  12,
  ARRAY[
    'Inizia con carezze leggere sulla testa',
    'Procedi con movimenti circolari dolci su collo e spalle',
    'Osserva le zone che l''animale preferisce',
    'Aumenta gradualmente la pressione se gradita',
    'Parla con voce calma e rassicurante',
    'Se l''animale si rilassa, continua più a lungo',
    'Termina con coccole nella zona preferita'
  ],
  ARRAY['mani pulite e calde', 'olio naturale per massaggi (opzionale)', 'voce dolce e rassicurante'],
  90
);

-- GIORNO 3: Attivazione Fisica Dolce - Movimento Base
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  3,
  '🚶 Passi di Risveglio',
  'Movimento dolce e graduale per riattivare la muscolatura e stimolare la circolazione senza affaticare.',
  'physical',
  10,
  ARRAY[
    'Inizia con l''animale seduto o sdraiato',
    'Incoraggia a alzarsi con snack a poca distanza',
    'Celebra ogni movimento, anche piccolo',
    'Guida per 3-4 passi lenti verso il premio',
    'Permetti pause frequenti',
    'Aumenta gradualmente la distanza se possibile',
    'Termina sempre prima che mostri stanchezza'
  ],
  ARRAY['snack appetitosi', 'superficie antiscivolo', 'guinzaglio morbido (se necessario)', 'pazienza infinita'],
  85
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  3,
  '🎾 Gioco Palla Dolce',
  'Introduzione graduale al gioco con palla per stimolare istinti naturali e movimento coordinato.',
  'physical',
  8,
  ARRAY[
    'Usa una palla morbida e colorata',
    'Mostra la palla a distanza ravvicinata',
    'Falla rotolare lentamente verso l''animale',
    'Premia qualsiasi interesse (guardare, annusare, toccare)',
    'Se tocca la palla, celebra con entusiasmo',
    'Non forzare il "riporto", è sufficiente l''interesse',
    'Termina con gioco libero con la palla'
  ],
  ARRAY['palla morbida colorata', 'spazio sicuro', 'snack di rinforzo', 'voce incoraggiante'],
  78
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  3,
  '🌿 Esplorazione Guidata Indoor',
  'Esplorazione dolce di nuovi angoli della casa per stimolare curiosità e movimento volontario.',
  'behavioral',
  12,
  ARRAY[
    'Scegli una stanza poco frequentata dall''animale',
    'Entra per primo e siediti a terra',
    'Invita con voce dolce senza forzare',
    'Nascondi piccoli snack in angoli interessanti',
    'Accompagna l''esplorazione senza guidare troppo',
    'Premia ogni step esplorativo',
    'Termina quando ha esplorato almeno 2 nuovi posti'
  ],
  ARRAY['snack nascosti', 'voce calma', 'ambiente sicuro', 'tempo senza fretta'],
  87
);

-- GIORNO 4: Attivazione Fisica Dolce - Coordinazione
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  4,
  '🎯 Target Training Base',
  'Esercizio di precisione dolce per migliorare coordinazione e concentrazione attraverso target semplici.',
  'behavioral',
  9,
  ARRAY[
    'Usa la tua mano aperta come target iniziale',
    'Mostra la mano a 10cm dal naso dell''animale',
    'Premia qualsiasi avvicinamento al target',
    'Gradualmente richiedi tocco con naso o zampa',
    'Sposta leggermente il target per creare movimento',
    'Mantieni sessioni brevi per non affaticare',
    'Termina sempre con successo'
  ],
  ARRAY['mano come target', 'snack piccoli e frequenti', 'clicker (opzionale)', 'pazienza e costanza'],
  83
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  4,
  '🌊 Percorso Ondulato Semplice',
  'Percorso base con ostacoli bassi per stimolare coordinazione e fiducia nei movimenti.',
  'physical',
  11,
  ARRAY[
    'Crea percorso con cuscini bassi (5-10cm)',
    'Dimostra tu il percorso camminando lentamente',
    'Invita l''animale a seguirti con snack',
    'Premia ogni superamento di ostacolo',
    'Se evita ostacolo, va bene camminare attorno',
    'Aumenta difficoltà solo se molto a suo agio',
    'Termina con coccole e premio speciale'
  ],
  ARRAY['cuscini bassi', 'tappetini antiscivolo', 'snack motivanti', 'incoraggiamento vocale'],
  80
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  4,
  '🎪 Trick Facili Motivanti',
  'Insegnamento di trick semplici per aumentare autostima e connessione positiva con l''addestramento.',
  'behavioral',
  10,
  ARRAY[
    'Inizia con "seduto" se già lo conosce',
    'Se non conosce comandi, prova "tocca la mano"',
    'Usa rinforzo positivo massiccio',
    'Spezza il comportamento in micro-passi',
    'Celebra ogni piccolo progresso',
    'Non correggere errori, ignora e riprova',
    'Termina sempre con un successo'
  ],
  ARRAY['snack di alto valore', 'clicker (opzionale)', 'molta pazienza', 'celebrazioni entusiastiche'],
  86
);

-- GIORNO 5: Stimolazione Mentale - Puzzle Semplici
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  5,
  '🧩 Puzzle Alimentare Facile',
  'Introduzione a puzzle alimentari semplici per stimolare problem-solving e mantenere l''interesse prolungato.',
  'mental',
  12,
  ARRAY[
    'Inizia con puzzle molto semplice (distributore a palline)',
    'Mostra come funziona facendolo tu stesso',
    'Metti snack appetitosi all''interno',
    'Assisti l''animale senza risolvere per lui',
    'Premia qualsiasi tentativo di interazione',
    'Se frustrato, semplifica il puzzle',
    'Termina con successo garantito'
  ],
  ARRAY['puzzle alimentare semplice', 'snack di diversa dimensione', 'supervisione paziente', 'aiuto graduale'],
  89
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  5,
  '🎁 Scatola Sorpresa Motivante',
  'Gioco di apertura scatole per stimolare curiosità e persistenza attraverso ricompense nascoste.',
  'mental',
  10,
  ARRAY[
    'Usa scatola di cartone con coperchio facile',
    'Nascondi snack e piccolo giocattolo dentro',
    'Mostra la scatola chiusa e scuotila leggermente',
    'Incoraggia a investigare con naso e zampe',
    'Aiuta ad aprire se ha difficoltà',
    'Celebra la scoperta del contenuto',
    'Ripeti con scatole diverse per mantenere interesse'
  ],
  ARRAY['scatole di cartone varie', 'snack speciali', 'piccoli giocattoli', 'carta velina per imballaggio'],
  85
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  5,
  '🔍 Ricerca Olfattiva Guidata',
  'Ricerca guidata di oggetti nascosti per sviluppare concentrazione e utilizzo attivo dell''olfatto.',
  'mental',
  8,
  ARRAY[
    'Nascondi 3 oggetti profumati in stanza piccola',
    'Inizia con oggetti parzialmente visibili',
    'Guida verso il primo oggetto con incoraggiamento',
    'Premia la scoperta con entusiasmo',
    'Aumenta gradualmente la difficoltà',
    'Se perde interesse, rendi più facile',
    'Termina con ricerca del suo snack preferito'
  ],
  ARRAY['oggetti profumati', 'snack nascosti', 'ambiente controllato', 'guida vocale dolce'],
  88
);

-- GIORNO 6: Stimolazione Mentale - Giochi Cognitivi
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  6,
  '🎲 Gioco delle Scelte Multiple',
  'Gioco di scelta tra opzioni diverse per stimolare processo decisionale e aumentare fiducia.',
  'mental',
  9,
  ARRAY[
    'Presenta 3 contenitori chiusi con premi diversi',
    'Mostra il contenuto di uno alla volta',
    'Invita l''animale a scegliere avvicinandosi',
    'Premia qualsiasi scelta senza correggere',
    'Varia la posizione dei contenitori',
    'Osserva se sviluppa preferenze',
    'Termina lasciando accesso a tutti i premi'
  ],
  ARRAY['3 contenitori identici', 'snack di valore diverso', 'giocattoli vari', 'pazienza nelle scelte'],
  84
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  6,
  '🔄 Sequenze Semplici Motivanti',
  'Insegnamento di sequenze base di azioni per sviluppare memoria e concentrazione sostenuta.',
  'mental',
  11,
  ARRAY[
    'Inizia con sequenza a 2 step: "seduto" poi "zampa"',
    'Premia ogni step completato',
    'Ripeti la sequenza 3-4 volte',
    'Se va bene, aggiungi terzo step semplice',
    'Mantieni ritmo lento e rilassato',
    'Se confuso, torna alla sequenza più semplice',
    'Termina con sequenza eseguita perfettamente'
  ],
  ARRAY['snack per ogni step', 'comandi vocali chiari', 'gestualità consistente', 'celebrazioni graduali'],
  87
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  6,
  '🎨 Attività Creativa Libera',
  'Tempo di gioco libero con materiali diversi per stimolare creatività e espressione spontanea.',
  'mental',
  10,
  ARRAY[
    'Disponi vari materiali sicuri a terra',
    'Include: palline, corde, tessuti, contenitori',
    'Osserva senza dirigere il gioco',
    'Unisciti solo se invitato dall''animale',
    'Premia qualsiasi interazione spontanea',
    'Segui il suo lead nelle attività',
    'Termina quando mostra soddisfazione'
  ],
  ARRAY['materiali vari sicuri', 'osservazione attenta', 'partecipazione spontanea', 'rinforzo delle iniziative'],
  82
);

-- GIORNO 7: Ripristino Interesse Sociale - Interazioni Positive
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  7,
  '👥 Socializzazione Dolce Controllata',
  'Introduzione graduale a interazioni sociali positive per ricostruire fiducia nelle relazioni.',
  'social',
  12,
  ARRAY[
    'Invita una persona calma e paziente',
    'Inizia con la persona seduta a distanza',
    'Permetti all''animale di avvicinarsi liberamente',
    'La persona deve ignorare inizialmente l''animale',
    'Premia qualsiasi avvicinamento spontaneo',
    'Gradualmente introduce carezze delicate',
    'Termina con interazione positiva breve'
  ],
  ARRAY['persona fidata e calma', 'snack per rinforzo', 'ambiente familiare', 'tempo senza fretta'],
  91
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  7,
  '🎪 Gioco Interattivo Motivante',
  'Giochi condivisi per ricostruire il piacere dell''interazione e della collaborazione.',
  'social',
  10,
  ARRAY[
    'Inizia con gioco di rimorchiello delicato',
    'Usa giocattolo morbido e interessante',
    'Lascia vincere spesso l''animale',
    'Alterna momenti di gioco attivo e pause',
    'Premia l''engagement con entusiasmo moderato',
    'Se si disinteressa, cambia gioco',
    'Termina sempre con vittoria dell''animale'
  ],
  ARRAY['giocattoli interattivi morbidi', 'energia positiva controllata', 'varietà di giochi', 'rinforzi frequenti'],
  88
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  7,
  '🌅 Routine Positiva Nuova',
  'Creazione di nuova routine piacevole per associare momenti specifici a esperienze positive.',
  'behavioral',
  8,
  ARRAY[
    'Scegli momento specifico del giorno (es. dopo cena)',
    'Crea sequenza di 3 attività piacevoli',
    'Include: snack speciale, coccole, gioco preferito',
    'Mantieni sempre la stessa sequenza',
    'Rendi il momento prevedibile e atteso',
    'Osserva se l''animale inizia ad anticipare',
    'Celebra l''instaurarsi della routine'
  ],
  ARRAY['timer per costanza', 'snack rituali', 'attività consolidate piacevoli', 'coerenza temporale'],
  89
);

-- GIORNO 8: Ripristino Interesse Sociale - Autonomia Motivata
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score
) VALUES 
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  8,
  '🎊 Celebrazione Progressi',
  'Sessione di riconoscimento e celebrazione di tutti i progressi fatti durante il protocollo.',
  'social',
  15,
  ARRAY[
    'Ripeti brevemente tutti gli esercizi preferiti',
    'Documenta i miglioramenti osservati',
    'Organizza "festa" con snack speciali',
    'Invita familiari a partecipare alle celebrazioni',
    'Mostra orgoglio genuino per ogni progresso',
    'Scatta foto/video dei momenti felici',
    'Pianifica mantenimento routine positive'
  ],
  ARRAY['snack festa speciali', 'decorazioni allegre', 'fotocamera', 'famiglia partecipe', 'energia festosa'],
  95
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  8,
  '🚀 Test Autonomia Motivata',
  'Valutazione finale delle capacità acquisite e del livello di motivazione raggiunto.',
  'mental',
  12,
  ARRAY[
    'Presenta scelta libera tra diverse attività',
    'Include: puzzle, giochi, esplorazione, socializzazione',
    'Osserva quali attività sceglie spontaneamente',
    'Non dirigere ma supporta le sue scelte',
    'Documenta preferenze e livello di engagement',
    'Nota miglioramenti in energia e curiosità',
    'Termina con attività che lo rende più felice'
  ],
  ARRAY['varietà di opzioni', 'osservazione attenta', 'documentazione progressi', 'rispetto delle preferenze'],
  92
),
(
  'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  8,
  '💫 Pianificazione Futuro Positivo',
  'Sessione di pianificazione per mantenere e sviluppare ulteriormente la motivazione riconquistata.',
  'behavioral',
  10,
  ARRAY[
    'Identifica le 3 attività che ha amato di più',
    'Pianifica come integrarle nella routine quotidiana',
    'Stabilisci momenti fissi per attività preferite',
    'Crea calendario visivo dei "momenti felici"',
    'Prepara kit di emergenza per giorni difficili',
    'Coinvolgi famiglia nel piano di mantenimento',
    'Termina con promessa di continuità'
  ],
  ARRAY['calendario attività', 'kit emergenza motivazione', 'coinvolgimento famiglia', 'pianificazione a lungo termine'],
  90
);