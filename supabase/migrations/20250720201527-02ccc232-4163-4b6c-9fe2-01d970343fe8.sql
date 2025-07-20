-- Insert Gestione Gelosia e Possessività protocol (corrected difficulty)
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  difficulty,
  category,
  duration_days,
  target_behavior,
  is_public,
  ai_generated,
  veterinary_approved,
  required_materials,
  triggers,
  success_rate,
  community_rating,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Gestione Gelosia e Possessività',
  'Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.',
  'difficile',
  'comportamento',
  10,
  'Riduzione resource guarding, gelosia e possessività',
  true,
  true,
  true,
  ARRAY['Ciotole multiple', 'Snack alto valore', 'Giocattoli vari', 'Barriere di sicurezza', 'Guinzagli di controllo', 'Tappetini separatori'],
  ARRAY['Resource guarding', 'Gelosia verso altri pet', 'Possessività con il proprietario', 'Aggressività durante i pasti', 'Protezione territoriale'],
  85.0,
  4.2,
  now(),
  now()
);

-- Get the protocol ID for the exercises
WITH protocol_data AS (
  SELECT id as protocol_id 
  FROM public.ai_training_protocols 
  WHERE title = 'Gestione Gelosia e Possessività' 
  ORDER BY created_at DESC 
  LIMIT 1
)

-- Insert all exercises for the 10-day protocol
INSERT INTO public.ai_training_exercises (
  id,
  protocol_id,
  day_number,
  title,
  description,
  exercise_type,
  duration_minutes,
  instructions,
  materials,
  effectiveness_score,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  protocol_data.protocol_id,
  day_num,
  exercise_title,
  exercise_description,
  'behavioral',
  duration,
  instructions_array,
  materials_array,
  effectiveness,
  now(),
  now()
FROM protocol_data,
(VALUES 
  -- GIORNI 1-3: Desensibilizzazione Possessività
  (1, 'Avvicinamento Graduale alle Risorse', 'Esercizio di desensibilizzazione per ridurre la tensione quando qualcuno si avvicina durante i pasti o al gioco', 12,
   ARRAY[
     'Inizia a distanza di 3 metri mentre l''animale mangia o gioca',
     'Avvicinati di un passo ogni 30 secondi solo se l''animale rimane calmo',
     'Se mostra tensione, fermati e aspetta che si rilassi',
     'Premia la calma con snack alto valore lanciati da distanza',
     'Ripeti 3 volte, riducendo gradualmente la distanza finale',
     'Non forzare mai l''avvicinamento se l''animale mostra stress'
   ],
   ARRAY['Ciotola o giocattolo preferito', 'Snack alto valore', 'Cronometro'],
   8),

  (1, 'Comando "Drop It" Avanzato', 'Training intensivo del comando per il rilascio volontario di oggetti senza tensione', 15,
   ARRAY[
     'Inizia con oggetti di basso valore e snack premium',
     'Pronuncia "drop it" una sola volta con voce calma',
     'Aspetta che l''animale rilasci volontariamente l''oggetto',
     'Premia immediatamente con snack e lodi entusiastiche',
     'Restituisci l''oggetto come premio aggiuntivo',
     'Progredisci gradualmente verso oggetti di valore maggiore'
   ],
   ARRAY['Vari oggetti di diverso valore', 'Snack premium', 'Guinzaglio di controllo'],
   9),

  (1, 'Presenza Calma Durante i Pasti', 'Abituare l''animale alla presenza umana durante l''alimentazione senza reazioni difensive', 10,
   ARRAY[
     'Posiziona la ciotola e allontanati di 2 metri',
     'Rimani immobile e calmo mentre l''animale mangia',
     'Occasionalmente aggiungi cibo nella ciotola da distanza',
     'Se l''animale ti guarda, premia con uno snack extra',
     'Mantieni il linguaggio del corpo rilassato',
     'Termina sempre l''esercizio prima che finisca tutto il cibo'
   ],
   ARRAY['Ciotola cibo', 'Cibo extra appetitoso', 'Posizione fissa segnata'],
   7),

  (2, 'Tecnica dello Scambio Positivo', 'Insegnare che cedere un oggetto porta sempre a qualcosa di migliore', 14,
   ARRAY[
     'Offri un giocattolo di medio valore',
     'Quando l''animale lo prende, mostra uno snack premium',
     'Attendi che mostri interesse per lo snack',
     'Pronuncia "scambia" e offri lo snack',
     'Quando rilascia il giocattolo, premia immediatamente',
     'Ripeti variando oggetti per generalizzare il comportamento'
   ],
   ARRAY['Giocattoli vari', 'Snack premium diversi', 'Superficie neutra'],
   8),

  (2, 'Desensibilizzazione Mani Vicino al Cibo', 'Ridurre la reattività alla presenza delle mani durante l''alimentazione', 16,
   ARRAY[
     'Inizia tenendo la mano a 50cm dalla ciotola',
     'Muovi lentamente la mano verso la ciotola',
     'Se l''animale continua a mangiare calmo, premia verbalmente',
     'Tocca brevemente il bordo della ciotola',
     'Aggiungi cibo extra come ricompensa per la calma',
     'Ripeti aumentando gradualmente il contatto con la ciotola'
   ],
   ARRAY['Ciotola trasparente', 'Cibo appetitoso', 'Snack extra'],
   9),

  (2, 'Controllo Impulsi Vicino a Risorse', 'Sviluppare autocontrollo quando sono presenti oggetti desiderabili', 12,
   ARRAY[
     'Posiziona un giocattolo attraente a terra',
     'Chiedi "aspetta" mantenendo l''animale a distanza',
     'Conta fino a 5 prima di dare il permesso',
     'Usa "ok" come comando di rilascio',
     'Premia l''autocontrollo con snack e lodi',
     'Aumenta gradualmente il tempo di attesa'
   ],
   ARRAY['Giocattolo molto appetibile', 'Guinzaglio corto', 'Cronometro'],
   8),

  (3, 'Training "Leave It" con Distrazioni', 'Insegnare a ignorare risorse anche in presenza di tentazioni multiple', 18,
   ARRAY[
     'Posiziona diversi oggetti attraenti sul pavimento',
     'Cammina con l''animale al guinzaglio tra gli oggetti',
     'Pronuncia "leave it" quando si avvicina a un oggetto',
     'Redireziona dolcemente se necessario',
     'Premia generosamente quando ignora gli oggetti',
     'Termina con una sessione di gioco libero come ricompensa'
   ],
   ARRAY['Vari oggetti attraenti', 'Guinzaglio lungo', 'Snack premio'],
   9),

  (3, 'Rotazione Controllata dei Giocattoli', 'Abituare all''idea che i giocattoli sono temporanei e condivisibili', 14,
   ARRAY[
     'Prepara 5 giocattoli diversi in fila',
     'Permetti 2 minuti di gioco con il primo giocattolo',
     'Utilizza "drop it" per il cambio al secondo giocattolo',
     'Premia ogni transizione pacifica',
     'Continua la rotazione completa',
     'Termina restituendo il giocattolo preferito'
   ],
   ARRAY['5 giocattoli diversi', 'Cronometro', 'Snack premio'],
   7),

  (3, 'Presenza di Estranei Durante l''Alimentazione', 'Desensibilizzare alla presenza di persone sconosciute durante i pasti', 15,
   ARRAY[
     'Un familiare funge da "estraneo" mantenendo distanza',
     'L''animale inizia a mangiare normalmente',
     'L''"estraneo" si avvicina gradualmente solo se tutto rimane calmo',
     'Ferma immediatamente se ci sono segni di tensione',
     'Premia la calma con snack extra aggiunti alla ciotola',
     'Ripeti con persone diverse per generalizzare'
   ],
   ARRAY['Ciotola cibo', 'Persona ausiliaria', 'Snack extra'],
   8),

  -- GIORNI 4-6: Training Condivisione
  (4, 'Condivisione Ciotole Multiple', 'Insegnare a mangiare pacificamente da ciotole multiple senza competition', 16,
   ARRAY[
     'Posiziona 3 ciotole con cibo a distanza di 1 metro',
     'Permetti all''animale di scegliere da quale iniziare',
     'Rimani vicino per supervisionare senza interferire',
     'Se si dirige verso una seconda ciotola, permettilo',
     'Premia la transizione pacifica tra ciotole',
     'Aggiungi cibo extra nella ciotola che sta utilizzando'
   ],
   ARRAY['3 ciotole identiche', 'Porzioni di cibo uguali', 'Spazio ampio'],
   8),

  (4, 'Gioco Cooperativo "Tira e Molla"', 'Sviluppare capacità di gioco condiviso senza possessività', 12,
   ARRAY[
     'Utilizza una corda lunga per il tira e molla',
     'Inizia tu da un lato, l''animale dall''altro',
     'Gioca per 1 minuto poi comanda "drop it"',
     'Premia immediatamente quando rilascia',
     'Ricomincia il gioco come ricompensa per aver rilasciato',
     'Termina sempre quando l''animale è ancora motivato'
   ],
   ARRAY['Corda lunga e resistente', 'Cronometro', 'Snack premio'],
   9),

  (4, 'Esercizio "Aspetta il Tuo Turno"', 'Insegnare pazienza e alternanza nell''accesso alle risorse', 14,
   ARRAY[
     'Utilizza due giocattoli identici',
     'Mostra entrambi ma permetti l''accesso solo a uno',
     'Comanda "aspetta" per il secondo giocattolo',
     'Dopo 30 secondi, permetti lo scambio con "cambia"',
     'Premia la pazienza durante l''attesa',
     'Aumenta gradualmente il tempo di attesa'
   ],
   ARRAY['2 giocattoli identici', 'Cronometro', 'Snack premio'],
   8),

  (5, 'Training Multi-Risorsa Simultanea', 'Gestire l''accesso a multiple risorse contemporaneamente presenti', 18,
   ARRAY[
     'Disponi cibo, acqua, giocattoli in zone diverse',
     'Permetti movimento libero tra le risorse',
     'Osserva i pattern di comportamento senza interferire',
     'Premia i momenti di calma e non-possessività',
     'Intervieni dolcemente solo se c''è tensione eccessiva',
     'Concludi con una sessione di relax condiviso'
   ],
   ARRAY['Multiple risorse varie', 'Spazio ampio', 'Osservazione attenta'],
   7),

  (5, 'Condivisione Guidata con Proprietario', 'Sviluppare comfort nella condivisione diretta con il proprietario', 15,
   ARRAY[
     'Siediti a terra con l''animale e un giocattolo',
     'Giocate insieme tenendo entrambi il giocattolo',
     'Occasionalmente prendi completamente il controllo',
     'Restituisci sempre dopo 10-15 secondi',
     'Premia la calma durante i tuoi "turni"',
     'Termina lasciando il controllo completo all''animale'
   ],
   ARRAY['Giocattolo condivisibile', 'Superficie comoda', 'Pazienza'],
   9),

  (5, 'Scambio Volontario Avanzato', 'Perfezionare lo scambio spontaneo senza comandi', 13,
   ARRAY[
     'Mostra simultaneamente due oggetti di valore simile',
     'Permetti all''animale di scegliere il primo',
     'Mostra interesse per il secondo oggetto senza comandare',
     'Aspetta che mostri curiosità per lo scambio',
     'Quando avviene lo scambio naturale, premia intensamente',
     'Ripeti variando la posizione degli oggetti'
   ],
   ARRAY['Oggetti di valore simile', 'Snack premium', 'Spazio neutro'],
   8),

  -- GIORNI 7-8: Gestione Gelosia Sociale
  (6, 'Introduzione Graduale Secondo Animale', 'Desensibilizzare alla presenza di altri animali durante le attività', 16,
   ARRAY[
     'Utilizza un peluche che simula un altro animale',
     'Posizionalo a 2 metri durante il pasto dell''animale',
     'Gradualmente riduci la distanza nelle sessioni successive',
     'Premia la calma e l''indifferenza verso il "intruso"',
     'Se possibile, usa un vero secondo animale ben socializzato',
     'Mantieni sempre controllo della situazione per sicurezza'
   ],
   ARRAY['Peluche realistico o secondo animale', 'Ciotole separate', 'Guinzagli di sicurezza'],
   9),

  (6, 'Attenzione Condivisa con il Proprietario', 'Ridurre la gelosia quando il proprietario interagisce con altri', 14,
   ARRAY[
     'Un familiare riceve attenzioni dal proprietario',
     'L''animale deve rimanere in posizione "seduto" a distanza',
     'Ogni 30 secondi di calma, riceve attenzioni uguali',
     'Se mostra gelosia, ignora fino al ritorno della calma',
     'Premia generosamente i momenti di pazienza',
     'Termina sempre dando attenzioni esclusive all''animale'
   ],
   ARRAY['Persona ausiliaria', 'Comando "seduto" consolidato', 'Snack premio'],
   8),

  (7, 'Gioco Parallelo con Altri Animali', 'Sviluppare tolleranza per attività simultanee con altri pet', 18,
   ARRAY[
     'Due animali giocano con giocattoli identici a distanza sicura',
     'Mantieni distanza di almeno 3 metri inizialmente',
     'Supervisiona attentamente i linguaggi del corpo',
     'Premia entrambi per il gioco pacifico parallelo',
     'Riduci gradualmente la distanza solo se tutto rimane calmo',
     'Termina prima che sorga qualsiasi tensione'
   ],
   ARRAY['2 set di giocattoli identici', 'Secondo animale socializzato', 'Spazio ampio'],
   9),

  (7, 'Alimentazione Controllata Multi-Pet', 'Gestire l''alimentazione contemporanea di più animali', 15,
   ARRAY[
     'Posiziona ciotole a distanza di almeno 2 metri',
     'Alimenta entrambi gli animali simultaneamente',
     'Rimani in posizione centrale per supervisionare',
     'Premia chi mantiene la concentrazione sulla propria ciotola',
     'Intervieni immediatamente se uno si avvicina all''altro',
     'Rimuovi le ciotole quando hanno finito'
   ],
   ARRAY['2 ciotole identiche', 'Secondo animale', 'Posizione di controllo'],
   8),

  (8, 'Rotazione Spazi e Risorse Multi-Pet', 'Insegnare la condivisione territoriale e di risorse', 16,
   ARRAY[
     'Dividi lo spazio in 2 zone con risorse identiche',
     'Ogni animale inizia nella propria zona',
     'Dopo 5 minuti, scambia le posizioni',
     'Premia l''adattamento pacifico al cambio',
     'Ripeti lo scambio più volte durante la sessione',
     'Termina permettendo libertà di movimento'
   ],
   ARRAY['2 zone delimitate', 'Risorse duplicate', 'Cronometro'],
   7),

  (8, 'Comando "Ognuno al Suo Posto"', 'Stabilire routine di posizionamento per evitare conflitti', 12,
   ARRAY[
     'Insegna un comando specifico per andare al proprio posto',
     'Utilizza tappetini o cucce designate per ogni animale',
     'Pratica il comando quando c''è tensione tra animali',
     'Premia generosamente l''obbedienza immediata',
     'Gradualmente usa il comando in situazioni più sfidanti',
     'Mantieni coerenza nell''uso del comando'
   ],
   ARRAY['Tappetini designati', 'Comandi vocali chiari', 'Premi alto valore'],
   9),

  -- GIORNI 9-10: Rinforzo Comportamenti Prosociali
  (9, 'Sharing Spontaneo Guidato', 'Incoraggiare comportamenti di condivisione naturale', 15,
   ARRAY[
     'Presenta una risorsa molto appetibile',
     'Non dare comandi ma osserva il comportamento naturale',
     'Premia intensamente ogni momento di condivisione spontanea',
     'Ignora comportamenti possessivi senza punire',
     'Crea opportunità multiple per il sharing volontario',
     'Documenta i progressi comportamentali'
   ],
   ARRAY['Risorsa molto desiderabile', 'Osservazione paziente', 'Premi eccezionali'],
   8),

  (9, 'Gioco Cooperativo Complesso', 'Attività che richiedono collaborazione tra animali o con il proprietario', 18,
   ARRAY[
     'Utilizza giochi che richiedono cooperazione (puzzle food)',
     'Entrambi gli animali devono collaborare per il successo',
     'Premia i momenti di collaborazione effettiva',
     'Scoraggia dolcemente i tentativi di monopolizzazione',
     'Celebra i successi di gruppo',
     'Varia i tipi di gioco cooperativo'
   ],
   ARRAY['Puzzle food cooperativi', 'Spazio di gioco', 'Premi condivisi'],
   9),

  (9, 'Sessione di Relax Sociale', 'Sviluppare comfort nella vicinanza rilassata con altri', 14,
   ARRAY[
     'Crea un ambiente rilassante con tutti gli animali presenti',
     'Ognuno ha il proprio spazio confortevole ma nella stessa area',
     'Mantieni attività calme e non competitive',
     'Premia la presenza pacifica e rilassata',
     'Intervieni minimamente, lascia che si abituino naturalmente',
     'Termina con attenzioni individuali per ognuno'
   ],
   ARRAY['Spazi comfort multipli', 'Ambiente tranquillo', 'Supervisione discreta'],
   7),

  (10, 'Test di Consolidamento Completo', 'Valutazione finale dei progressi in situazione complessa', 20,
   ARRAY[
     'Crea uno scenario che include tutte le sfide precedenti',
     'Presenta risorse multiple, altri animali, distrazioni',
     'Osserva e documenta i comportamenti senza interventi',
     'Premia solo i comportamenti prosociali spontanei',
     'Nota le aree che necessitano ancora lavoro',
     'Pianifica strategie per il mantenimento futuro'
   ],
   ARRAY['Setup completo multi-risorsa', 'Scheda osservazione', 'Ambiente realistico'],
   8),

  (10, 'Celebrazione e Rinforzo Finale', 'Consolidare tutti i progressi con una sessione positiva conclusiva', 16,
   ARRAY[
     'Organizza una "festa" con tutti gli animali coinvolti',
     'Presenta le attività più riuscite del percorso',
     'Permetti maggiore libertà nelle interazioni',
     'Documenta con foto/video i comportamenti positivi',
     'Premia abbondantemente tutti i successi',
     'Stabilisci un programma di mantenimento settimanale'
   ],
   ARRAY['Ambiente festoso', 'Camera per documentazione', 'Premi speciali'],
   9),

  (10, 'Pianificazione Mantenimento', 'Stabilire routine per mantenere i progressi raggiunti', 12,
   ARRAY[
     'Rivedi tutti gli esercizi che hanno dato migliori risultati',
     'Pratica versioni abbreviate degli esercizi chiave',
     'Stabilisci una routine settimanale di rinforzo',
     'Identifica i trigger che potrebbero causare regressioni',
     'Pratica strategie di intervento rapido',
     'Programma sessioni di rinforzo mensili'
   ],
   ARRAY['Agenda mantenimento', 'Lista esercizi chiave', 'Piano di emergenza'],
   8)

) AS exercises(day_num, exercise_title, exercise_description, duration, instructions_array, materials_array, effectiveness);