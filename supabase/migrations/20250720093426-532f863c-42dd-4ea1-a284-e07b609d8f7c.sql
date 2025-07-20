-- Crea protocollo "Gestione Iperattività e Deficit Attenzione"
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
    ai_generated,
    is_public,
    success_rate,
    community_rating,
    community_usage,
    veterinary_approved,
    mentor_recommended,
    estimated_cost
) VALUES (
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    'Gestione Iperattività e Deficit Attenzione',
    'Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.',
    'comportamento',
    'intermedio',
    10,
    'Riduzione iperattività, miglioramento concentrazione e autocontrollo',
    ARRAY['energia_eccessiva', 'difficolta_concentrazione', 'irrequietezza', 'impulsi_incontrollati', 'ansia_da_separazione'],
    ARRAY['giocattoli_puzzle', 'snack_training', 'ostacoli_casalinghi', 'tappetino_rilassamento', 'clicker', 'guinzaglio_lungo'],
    'available',
    true,
    true,
    85,
    8.5,
    245,
    true,
    true,
    15.50
);

-- Inserisci tutti i 30 esercizi (3 per ogni giorno)

-- GIORNI 1-3: SCARICA ENERGIA COSTRUTTIVA

-- Giorno 1
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    1,
    'Circuito Agility Casa Base',
    'Percorso di ostacoli casalinghi per scaricare energia fisica in modo costruttivo',
    'physical',
    12,
    ARRAY[
        'Crea un percorso con 5-6 ostacoli usando cuscini, sedie e scatole',
        'Inizia con il pet al guinzaglio corto per mantenere controllo',
        'Guida lentamente attraverso ogni ostacolo con comandi chiari',
        'Premia immediatamente ogni completamento corretto',
        'Ripeti il circuito 3-4 volte aumentando gradualmente la velocità',
        'Termina con 2 minuti di cammino lento per defaticamento'
    ],
    ARRAY['cuscini', 'sedie', 'scatole', 'guinzaglio', 'premi_snack'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    1,
    'Ricerca Attiva Premi',
    'Gioco di ricerca per stimolare mente e corpo simultaneamente',
    'mental',
    10,
    ARRAY[
        'Nascondi 8-10 premi in diverse stanze della casa',
        'Inizia mostrando dove ne nascondi 2-3 per far capire il gioco',
        'Usa comando "cerca" e accompagna inizialmente il pet',
        'Celebra ogni ritrovamento con entusiasmo',
        'Aumenta gradualmente la difficoltà dei nascondigli',
        'Termina quando tutti i premi sono stati trovati'
    ],
    ARRAY['premi_piccoli', 'nascondigli_vari'],
    80
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    1,
    'Tiro alla Fune Controllato',
    'Gioco fisico con regole precise per insegnare autocontrollo durante il gioco',
    'physical',
    8,
    ARRAY[
        'Usa una corda robusta lunga circa 50cm',
        'Inizia il gioco solo quando il pet è seduto e calmo',
        'Gioca per 30 secondi poi dai comando "lascia"',
        'Il pet deve rilasciare immediatamente per continuare',
        'Ripeti 4-5 sessioni di gioco intervallate da pause',
        'Termina sempre con il pet che rilascia volontariamente'
    ],
    ARRAY['corda_gioco', 'timer'],
    75
);

-- Giorno 2
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    2,
    'Caccia al Tesoro Multi-Livello',
    'Percorso di ricerca progressivo che combina attività fisica e problem-solving',
    'mental',
    15,
    ARRAY[
        'Prepara 3 livelli di difficoltà: facile, medio, difficile',
        'Livello 1: premi visibili ma in posti alti/bassi',
        'Livello 2: premi semi-nascosti in contenitori aperti',
        'Livello 3: premi in puzzle box o sotto ostacoli',
        'Accompagna il pet solo nei primi 2 tentativi per livello',
        'Celebra ogni successo prima di passare al livello successivo'
    ],
    ARRAY['premi_vari', 'contenitori', 'puzzle_box', 'ostacoli_bassi'],
    90
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    2,
    'Slalom Velocità Controllata',
    'Esercizio di agilità per migliorare coordinazione e controllo della velocità',
    'physical',
    10,
    ARRAY[
        'Posiziona 6 oggetti in linea distanti 1 metro l\'uno dall\'altro',
        'Inizia camminando lentamente attraverso lo slalom',
        'Aumenta gradualmente la velocità mantenendo precisione',
        'Fermati e ricomincia se il pet salta ostacoli',
        'Premia la precisione più della velocità',
        'Completa 5 passaggi perfetti per terminare'
    ],
    ARRAY['coni_o_bottiglie', 'guinzaglio_lungo', 'cronometro'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    2,
    'Gioco Pausa e Vai',
    'Alternanza tra attività intensa e controllo per sviluppare autoregolazione',
    'behavioral',
    12,
    ARRAY[
        'Inizia con gioco intenso (lancio palla) per 45 secondi',
        'Dai comando "stop" e richiedi posizione seduto',
        'Mantieni pausa per 15 secondi (aumenta gradualmente)',
        'Riprendi il gioco solo quando il pet è completamente calmo',
        'Ripeti sequenza gioco-pausa 6 volte',
        'Termina sempre nella fase di pausa e calma'
    ],
    ARRAY['palla_o_giocattolo', 'timer', 'tappetino'],
    80
);

-- Giorno 3
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    3,
    'Percorso Ostacoli Temporizzato',
    'Circuito complesso per massimizzare scarica energetica con controllo temporale',
    'physical',
    15,
    ARRAY[
        'Crea percorso con 8 stazioni: salto, tunnel, slalom, equilibrio',
        'Cronometra ogni completamento per misurare miglioramenti',
        'Obiettivo: completare in 2-3 minuti mantenendo precisione',
        'Ripeti 3 volte con pause di 2 minuti tra ogni round',
        'Aumenta difficoltà solo se precisione rimane alta',
        'Registra tempo migliore e celebra i progressi'
    ],
    ARRAY['ostacoli_vari', 'cronometro', 'tunnel_improvvisato', 'asse_equilibrio'],
    95
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    3,
    'Puzzle Alimentare Complesso',
    'Sfida mentale intensa per stancare la mente e ridurre iperattività',
    'mental',
    12,
    ARRAY[
        'Usa 3 diversi puzzle alimentari simultaneamente',
        'Distribuisci il pasto giornaliero tra i puzzle',
        'Posiziona i puzzle a diverse altezze e distanze',
        'Non aiutare: lascia che il pet risolva autonomamente',
        'Osserva per safety ma intervieni solo se necessario',
        'Tempo limite: 15 minuti per completare tutti i puzzle'
    ],
    ARRAY['puzzle_alimentari_3_tipi', 'cibo_secco', 'timer'],
    90
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    3,
    'Rilassamento Post-Esercizio',
    'Prima introduzione alle tecniche di calming dopo attività intensa',
    'relaxation',
    8,
    ARRAY[
        'Subito dopo esercizio intenso, porta il pet su tappetino',
        'Inizia con respiri profondi e voce calma',
        'Massaggia delicatamente spalle e collo per 3 minuti',
        'Usa comandi "rilassa" e "calma" con voce sussurrata',
        'Mantieni ambiente silenzioso e luci soffuse',
        'Obiettivo: ottenere posizione down rilassata per 3 minuti'
    ],
    ARRAY['tappetino_rilassamento', 'ambiente_silenzioso'],
    70
);

-- GIORNI 4-6: CONTROLLO DEGLI IMPULSI

-- Giorno 4
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    4,
    'Comando Aspetta Progressivo',
    'Sviluppo controllo impulsi attraverso attese graduali',
    'behavioral',
    12,
    ARRAY[
        'Inizia con cibo nella ciotola, pet deve aspettare comando "ok"',
        'Inizia con attese di 5 secondi, aumenta di 5 secondi ogni successo',
        'Obiettivo: raggiungere 45 secondi di attesa',
        'Se il pet anticipa, ricomincia da tempo più basso',
        'Varia posizione: seduto, down, in piedi',
        'Termina sempre con successo, anche se tempo più breve'
    ],
    ARRAY['ciotola_cibo', 'cronometro', 'premi_high_value'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    4,
    'Controllo Impulsi Porta',
    'Gestione dell\'eccitazione in situazioni trigger come l\'uscita',
    'behavioral',
    10,
    ARRAY[
        'Pet deve sedersi prima che tu tocchi la maniglia',
        'Apri porta solo quando pet mantiene posizione seduta',
        'Se pet si alza, chiudi porta e ricomincia',
        'Aumenta gradualmente tempo porta aperta prima di uscire',
        'Esci solo quando pet aspetta comando "andiamo"',
        'Ripeti 5 volte con successi crescenti'
    ],
    ARRAY['porta_di_casa', 'guinzaglio'],
    80
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    4,
    'Gioco Stop Improvviso',
    'Interruzione immediata dell\'attività su comando per sviluppare autocontrollo',
    'behavioral',
    8,
    ARRAY[
        'Inizia gioco preferito del pet (palla, corda, etc.)',
        'Dopo 30 secondi di gioco intenso, dai comando "STOP"',
        'Pet deve fermarsi immediatamente e guardare te',
        'Pausa di 10 secondi, poi riprendi gioco',
        'Ripeti 6 cicli aumentando durata pause',
        'Premia generosamente ogni stop immediato'
    ],
    ARRAY['giocattolo_preferito', 'timer', 'premi_speciali'],
    75
);

-- Giorno 5
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    5,
    'Autocontrollo Multi-Distrazione',
    'Mantenimento controllo in presenza di stimoli distraenti',
    'behavioral',
    15,
    ARRAY[
        'Pet in posizione "resta" mentre tu crei distrazioni moderate',
        'Distrazioni: rumori, movimenti, oggetti che cadono',
        'Inizia con distrazioni lievi a 3 metri di distanza',
        'Aumenta intensità solo se pet mantiene posizione',
        'Ogni successo = premio e pausa rilassamento',
        'Obiettivo: mantenere "resta" per 2 minuti con distrazioni'
    ],
    ARRAY['oggetti_rumorosi', 'giocattoli_distraenti', 'timer'],
    90
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    5,
    'Pazienza Ricompensa Ritardata',
    'Esercizio avanzato per controllo impulsi con rinforzo ritardato',
    'behavioral',
    12,
    ARRAY[
        'Mostra premio al pet ma non darlo immediatamente',
        'Pet deve mantenere contatto visivo per ricevere premio',
        'Inizia con attese di 10 secondi, aumenta gradualmente',
        'Se pet distoglie sguardo o si muove, ricomincia',
        'Usa diversi tipi di premi per generalizzare l\'esercizio',
        'Obiettivo finale: 1 minuto di attesa con contatto visivo'
    ],
    ARRAY['premi_vari', 'cronometro'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    5,
    'Camminata Controllo Velocità',
    'Gestione dell\'impulso a tirare e mantenimento andatura controllata',
    'physical',
    10,
    ARRAY[
        'Camminata con cambio di velocità ogni 30 secondi',
        'Sequenza: lento, normale, veloce, stop, ripeti',
        'Pet deve adeguarsi al tuo ritmo senza tirare',
        'Premia immediatamente ogni adeguamento corretto',
        'Se pet tira, fermati finché guinzaglio non è lento',
        'Completa 3 giri completi di tutti i ritmi'
    ],
    ARRAY['guinzaglio', 'spazio_camminata', 'timer'],
    80
);

-- Giorno 6
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    6,
    'Challenge Impulsi Avanzato',
    'Test intensivo di controllo impulsi con multiple tentazioni',
    'behavioral',
    15,
    ARRAY[
        'Crea scenario con cibo, giocattoli e stimoli interessanti',
        'Pet deve attraversare area senza toccare nulla',
        'Usa comando "lascia" per ogni oggetto',
        'Permettiti solo 3 ripetizioni del comando per oggetto',
        'Se pet cede alla tentazione, ricomincia da inizio',
        'Obiettivo: attraversare senza comandi aggiuntivi'
    ],
    ARRAY['cibo_appetitoso', 'giocattoli_vari', 'oggetti_interessanti'],
    95
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    6,
    'Meditazione Guidata Pet',
    'Introduzione al rilassamento profondo e controllo respiratorio',
    'relaxation',
    12,
    ARRAY[
        'Pet in posizione down su tappetino confortevole',
        'Inizia con la tua respirazione lenta e profonda',
        'Massaggia ritmicamente seguendo il tuo respiro',
        'Sussurra dolcemente "rilassa" ad ogni espirazione',
        'Mantieni ambiente silenzioso e temperatura confortevole',
        'Obiettivo: 8 minuti di rilassamento profondo'
    ],
    ARRAY['tappetino_morbido', 'ambiente_silenzioso', 'timer'],
    75
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    6,
    'Controllo Eccitazione Sociale',
    'Gestione dell\'iperattività in presenza di persone nuove',
    'behavioral',
    10,
    ARRAY[
        'Simula arrivo di ospiti (campanello, bussare)',
        'Pet deve sedersi e aspettare prima che tu apra',
        'Mantieni pet in posizione durante "saluti" simulati',
        'Premia calma e controllo, ignora eccitazione',
        'Ripeti scenario 4-5 volte per sessione',
        'Aumenta gradualmente durata dell\'interazione'
    ],
    ARRAY['campanello_o_app_suoni', 'premi_tranquillizzanti'],
    85
);

-- GIORNI 7-8: FOCUS E CONCENTRAZIONE

-- Giorno 7
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    7,
    'Contatto Visivo Intensivo',
    'Sviluppo focus prolungato attraverso esercizi di sguardo',
    'mental',
    12,
    ARRAY[
        'Seduto di fronte al pet a 1 metro di distanza',
        'Inizia con contatto visivo di 5 secondi, aumenta gradualmente',
        'Premia ogni mantenimento del contatto visivo',
        'Ignora completamente se pet guarda altrove',
        'Aggiungi gradualmente distrazioni lievi',
        'Obiettivo: 45 secondi di contatto visivo continuo'
    ],
    ARRAY['premi_piccoli', 'sedia', 'timer'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    7,
    'Sequenze Comandi Complesse',
    'Catene di comportamenti per migliorare concentrazione e memoria',
    'mental',
    15,
    ARRAY[
        'Insegna sequenza: seduto → down → rotola → seduto',
        'Dai tutti i comandi in sequenza prima di premiare',
        'Inizia con 2 comandi, aggiungi uno per volta',
        'Se pet sbaglia un passaggio, ricomincia da capo',
        'Varia l\'ordine per mantenere attenzione alta',
        'Obiettivo: eseguire 4 comandi consecutivi perfettamente'
    ],
    ARRAY['premi_high_value', 'spazio_libero'],
    90
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    7,
    'Tracking Mentale',
    'Esercizio di concentrazione attraverso seguimento di target',
    'mental',
    10,
    ARRAY[
        'Usa target (bastoncino con pallina) per guidare movimento',
        'Pet deve seguire target solo con gli occhi inizialmente',
        'Muovi target lentamente in diverse direzioni',
        'Premia quando pet mantiene focus sul target',
        'Aggiungi movimento fisico seguendo target',
        'Termina con 2 minuti di tracking continuo'
    ],
    ARRAY['target_stick', 'spazio_aperto', 'premi'],
    80
);

-- Giorno 8
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    8,
    'Problem Solving Avanzato',
    'Puzzle complessi per massimo impegno mentale e concentrazione',
    'mental',
    15,
    ARRAY[
        'Prepara 3 puzzle di difficoltà crescente',
        'Pet deve risolvere in sequenza senza aiuto',
        'Tempo limite: 5 minuti per puzzle',
        'Se non risolve, riduci difficoltà ma non aiutare',
        'Celebra ogni risoluzione con pausa gioco',
        'Obiettivo: risolvere tutti e 3 i puzzle'
    ],
    ARRAY['puzzle_multipli', 'timer', 'premi_speciali'],
    95
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    8,
    'Focus in Movimento',
    'Mantenimento concentrazione durante attività dinamiche',
    'mental',
    12,
    ARRAY[
        'Cammina in pattern complessi (quadrati, otto, zigzag)',
        'Pet deve mantenere posizione heel e contatto visivo',
        'Cambia direzione ogni 20 secondi',
        'Premia mantenimento posizione durante i cambi',
        'Aumenta velocità mantenendo precisione',
        'Completa 3 pattern diversi perfettamente'
    ],
    ARRAY['spazio_ampio', 'premi_facili', 'cronometro'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    8,
    'Discriminazione Avanzata',
    'Scelta tra multiple opzioni per migliorare decision-making',
    'mental',
    10,
    ARRAY[
        'Presenta 4 oggetti diversi, solo uno è "corretto"',
        'Pet deve selezionare oggetto giusto solo toccandolo',
        'Cambia posizione oggetti tra ogni tentativo',
        'Premia solo selezione corretta, ignora errori',
        'Cambia oggetto target ogni 3 successi',
        'Obiettivo: 80% di scelte corrette'
    ],
    ARRAY['oggetti_4_diversi', 'premi_immediati'],
    90
);

-- GIORNI 9-10: RILASSAMENTO E AUTOCONTROLLO

-- Giorno 9
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    9,
    'Rilassamento Profondo Guidato',
    'Tecnica avanzata di rilassamento per autoregolazione completa',
    'relaxation',
    15,
    ARRAY[
        'Inizia con ambiente silenzioso e luci soffuse',
        'Pet in posizione down su superficie morbida',
        'Massaggio sistematico: inizia da testa, scendi gradualmente',
        'Sincronizza massaggio con respirazione lenta',
        'Sussurra "rilassa" e "calma" ritmicamente',
        'Obiettivo: 12 minuti di rilassamento profondo'
    ],
    ARRAY['tappetino_memory_foam', 'ambiente_silenzioso', 'olio_rilassante'],
    90
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    9,
    'Autocontrollo Situazioni Reali',
    'Test di gestione iperattività in scenari quotidiani',
    'behavioral',
    12,
    ARRAY[
        'Simula situazioni trigger: campanello, visite, rumori',
        'Pet deve mantenere calma e posizione assegnata',
        'Non intervenire se pet reagisce, lascia autoregolarsi',
        'Premia solo dopo che pet si è calmato autonomamente',
        'Aumenta intensità stimoli gradualmente',
        'Registra tempo necessario per autoregolazione'
    ],
    ARRAY['stimoli_audio', 'tappetino_posto', 'cronometro'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    9,
    'Meditation Walking',
    'Camminata meditativa per integrare calma e movimento',
    'relaxation',
    10,
    ARRAY[
        'Camminata molto lenta (1 passo ogni 3 secondi)',
        'Pet deve adeguarsi al ritmo senza tirare',
        'Concentrati sulla respirazione durante cammino',
        'Fermati ogni 10 passi per pausa rilassamento',
        'Pet deve sedersi automaticamente ad ogni fermata',
        'Completa 3 cicli di camminata-pausa'
    ],
    ARRAY['guinzaglio_morbido', 'percorso_tranquillo'],
    75
);

-- Giorno 10
INSERT INTO public.ai_training_exercises (
    id, protocol_id, day_number, title, description, exercise_type, duration_minutes,
    instructions, materials, effectiveness_score
) VALUES 
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    10,
    'Test Completo Autocontrollo',
    'Valutazione finale delle competenze acquisite',
    'behavioral',
    15,
    ARRAY[
        'Combina tutti gli elementi: attesa, controllo impulsi, focus',
        'Scenario complesso: cibo presente, distrazioni, stimoli sociali',
        'Pet deve navigare situazione usando solo competenze apprese',
        'Non dare comandi aggiuntivi, osserva comportamenti',
        'Premia autoregolazione e scelte corrette',
        'Documenta miglioramenti rispetto al giorno 1'
    ],
    ARRAY['setup_complesso', 'video_recording', 'checklist_valutazione'],
    95
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    10,
    'Rilassamento Autonomo',
    'Capacità di rilassarsi su comando senza assistenza',
    'relaxation',
    12,
    ARRAY[
        'Comando "relax" in ambiente normale (non setup speciale)',
        'Pet deve raggiungere stato calmo entro 3 minuti',
        'Testa in diverse stanze e con distrazioni moderate',
        'Non usare massaggi o aiuti esterni',
        'Pet deve mantenere rilassamento per 8 minuti',
        'Celebra successo con attività piacevole ma calma'
    ],
    ARRAY['cronometro', 'ambienti_diversi'],
    85
),
(
    gen_random_uuid(),
    'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f',
    10,
    'Sessione Integrazione Completa',
    'Combinazione armoniosa di energia, controllo e rilassamento',
    'comprehensive',
    15,
    ARRAY[
        'Inizia con 3 minuti di attività fisica moderata',
        'Transizione diretta a 5 minuti di esercizi focus',
        'Termina con 7 minuti di rilassamento profondo',
        'Pet deve gestire transizioni autonomamente',
        'Osserva capacità di adattamento ai cambi di ritmo',
        'Documenta livello di autoregolazione raggiunto'
    ],
    ARRAY['attrezzatura_completa', 'cronometro', 'diario_progressi'],
    90
);