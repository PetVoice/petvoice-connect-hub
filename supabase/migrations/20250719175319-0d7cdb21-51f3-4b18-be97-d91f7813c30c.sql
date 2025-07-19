-- Aggiorna tutti i protocolli esistenti per avere durate più realistiche e crea esercizi specifici

-- Prima aggiorniamo le durate dei protocolli esistenti
UPDATE ai_training_protocols SET duration_days = 14 WHERE duration_days > 14;
UPDATE ai_training_protocols SET duration_days = 7 WHERE category IN ('ansia', 'aggressivita') AND duration_days < 7;

-- Eliminiamo eventuali esercizi esistenti per ricrearli
DELETE FROM ai_training_exercises;

-- Creiamo esercizi per il protocollo "Gestione Ansia da Separazione" (7 giorni, 21 esercizi)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, instructions, exercise_type, duration_minutes, materials) 
SELECT 
  id,
  day_info.day_number,
  day_info.title,
  day_info.description,
  day_info.instructions,
  'behavioral',
  day_info.duration_minutes,
  day_info.materials
FROM ai_training_protocols,
(VALUES
  -- GIORNO 1
  (1, 'Osservazione Baseline Mattina', 'Valutazione iniziale del comportamento quando ti prepari per uscire', ARRAY['Osserva il tuo pet per 10 minuti mentre fai le normali routine mattutine', 'Annota ogni segno di ansia: ansimare, camminare avanti e indietro, piagnucolare', 'Non reagire ai comportamenti ansiosi, comportati normalmente', 'Registra tutto su un diario'], 10, ARRAY['Diario', 'Penna']),
  (1, 'Test Separazione Breve', 'Prima prova di separazione molto breve per stabilire la tolleranza', ARRAY['Prepara tutto per uscire ma non uscire ancora', 'Vai verso la porta, aprila e chiudila senza uscire', 'Osserva la reazione del pet', 'Se rimane calmo, esci per soli 30 secondi', 'Rientra in silenzio, ignora comportamenti eccessivi'], 15, ARRAY['Cronometro', 'Chiavi']),
  (1, 'Rilassamento Serale', 'Esercizio di rilassamento per terminare la giornata positivamente', ARRAY['Crea un ambiente calmo con luci soffuse', 'Siediti vicino al tuo pet e accarezzalo dolcemente', 'Parla con voce bassa e rassicurante', 'Pratica respirazione profonda anche tu', 'Durata: 15 minuti di calma totale'], 15, ARRAY['Luci soffuse', 'Coperta']),
  
  -- GIORNO 2
  (2, 'Routine Pre-Uscita Desensibilizzazione', 'Abituare il pet ai segnali di partenza senza ansia', ARRAY['Ripeti le azioni di preparazione per uscire senza effettivamente uscire', 'Prendi le chiavi, metti la giacca, prendi la borsa', 'Fai queste azioni 5 volte in 20 minuti', 'Premia la calma con un treat ogni volta', 'Ignora completamente i segni di ansia'], 20, ARRAY['Chiavi', 'Giacca', 'Borsa', 'Treats']),
  (2, 'Gioco di Distrazione Intensivo', 'Creare associazioni positive con giochi mentalmente stimolanti', ARRAY['Introduci un puzzle toy o gioco di intelligenza', 'Fai giocare il pet per 15 minuti con supervisione', 'Usa solo questo gioco speciale quando pratichi la separazione', 'Rimuovi il gioco quando finisce l''esercizio', 'Il gioco deve essere davvero interessante e coinvolgente'], 20, ARRAY['Puzzle toy', 'Treats nascosti', 'Timer']),
  (2, 'Separazione Incrementale', 'Aumento graduale del tempo di separazione', ARRAY['Prepara il gioco speciale per il pet', 'Esci per 1-2 minuti massimo', 'Rientra prima che il pet mostri ansia estrema', 'Ignora completamente il pet per 2 minuti al rientro', 'Ripeti 3 volte con pause di 10 minuti'], 25, ARRAY['Gioco speciale', 'Cronometro']),

  -- GIORNO 3
  (3, 'Comando "Resta" Avanzato', 'Rafforzare l''autocontrollo e la capacità di rimanere fermo', ARRAY['Inizia con il pet seduto di fronte a te', 'Di "resta" e fai un passo indietro', 'Se rimane fermo per 5 secondi, torna e premia', 'Aumenta gradualmente la distanza e il tempo', 'Arriva fino a 2 metri di distanza per 30 secondi'], 20, ARRAY['Treats premium', 'Spazio aperto']),
  (3, 'Associazione Positiva Porta', 'Creare emozioni positive legate alla porta di uscita', ARRAY['Posiziona la ciotola del cibo vicino alla porta', 'Dai treats speciali solo vicino alla porta', 'Gioca con il toy preferito vicino alla porta', 'Fai questo per 15 minuti, 3 volte durante il giorno', 'La porta deve diventare un posto "fortunato"'], 15, ARRAY['Treats speciali', 'Toy preferito', 'Ciotola']),
  (3, 'Uscita di 3-5 Minuti', 'Estensione controllata del tempo di separazione', ARRAY['Prepara il gioco puzzle con treats molto appetitosi', 'Esci senza salutare o fare drammi', 'Rimani fuori per 3-5 minuti', 'Rientra con calma, ignora per 3 minuti', 'Premia solo quando il pet è completamente calmo'], 30, ARRAY['Puzzle toys', 'Treats speciali', 'Cronometro']),

  -- GIORNO 4
  (4, 'Variazione Orari di Uscita', 'Evitare che il pet anticipi sempre l''orario di uscita', ARRAY['Cambia l''orario degli esercizi di separazione', 'Fai uscite brevissime (1 minuto) a orari casuali', 'Alterna mattina, pomeriggio e sera', 'Non creare pattern prevedibili', 'Mantieni sempre la stessa procedura calma'], 25, ARRAY['Timer casuale', 'Agenda']),
  (4, 'Comfort Zone Expansion', 'Aumentare la fiducia del pet in spazi diversi della casa', ARRAY['Sposta il pet in una stanza diversa dal solito', 'Lascialo da solo in quella stanza per 2-3 minuti', 'Assicurati che abbia water, comfort toys', 'Torna senza fare storie', 'Ripeti con diverse stanze della casa'], 20, ARRAY['Comfort toys', 'Ciotola acqua', 'Coperta familiare']),
  (4, 'Separazione 5-8 Minuti', 'Aumento significativo del tempo di tolleranza', ARRAY['Usa ora 2-3 puzzle toys diversi', 'Esci per 5-8 minuti senza avvisaglie', 'Varia il punto di uscita (porta principale/secondaria)', 'Al rientro, ignora per 5 minuti completi', 'Premia solo la calma assoluta'], 35, ARRAY['Puzzle toys multipli', 'Cronometro']),

  -- GIORNO 5
  (5, 'Simulazione Uscita Lavoro', 'Prova realistica di una vera uscita lavorativa', ARRAY['Fai la routine completa del mattino come se andassi a lavoro', 'Inclugi doccia, colazione, vestiti da lavoro', 'Esci per 10-15 minuti massimo', 'Comportati esattamente come in un giorno normale', 'Non dare attenzioni speciali prima o dopo'], 40, ARRAY['Routine normale', 'Timer', 'Vestiti da lavoro']),
  (5, 'Rinforzo Positivo Intensivo', 'Consolidare i progressi con ricompense molto appetitose', ARRAY['Prepara treats eccezionali che usi solo per questo', 'Fai micro-uscite (30 secondi) seguite da mega-premio', 'Ripeti 10 volte in 30 minuti', 'Il pet deve associare la tua uscita a cose fantastiche', 'Usa il cibo più amato in assoluto'], 30, ARRAY['Treats premium', 'Cibo super-appetitoso']),
  (5, 'Test Resistenza', 'Verifica della capacità di rimanere calmo per periodi medio-lunghi', ARRAY['Esci per 15-20 minuti', 'Lascia telecamera o registratore se possibile', 'Non dare indicazioni particolari al pet', 'Rientra con massima calma', 'Analizza se ci sono stati episodi di ansia'], 45, ARRAY['Telecamera/registratore opzionale', 'Cronometro']),

  -- GIORNO 6
  (6, 'Gestione Imprevisti', 'Preparare il pet a cambiamenti di routine inaspettati', ARRAY['Cambia completamente l''orario degli esercizi', 'Fai uscite multiple brevi e casuali', 'Simula dimenticanze: rientra per prendere qualcosa', 'Varia la durata da 2 a 25 minuti', 'Mantieni sempre la stessa calma al rientro'], 50, ARRAY['Flessibilità oraria', 'Oggetti da "dimenticare"']),
  (6, 'Socializzazione Indipendente', 'Promuovere sicurezza anche in presenza di distrazioni esterne', ARRAY['Esci mentre ci sono rumori esterni (vicini, traffico)', 'Lascia finestre aperte per rumori naturali', 'Il pet deve rimanere calmo nonostante le distrazioni', 'Durata: 15 minuti con distrazioni', 'Premia la calma nonostante il "caos" esterno'], 25, ARRAY['Ambiente con rumori naturali']),
  (6, 'Consolidamento Serale', 'Ripasso intensivo di tutte le tecniche apprese', ARRAY['Combina tutti gli esercizi della settimana in uno', 'Routine pre-uscita + gioco + separazione di 20 minuti', 'Usa tutte le tecniche apprese', 'Deve essere l''esercizio più completo', 'Celebra i progressi con una sessione di coccole finali'], 45, ARRAY['Tutti i materiali usati', 'Energia positiva']),

  -- GIORNO 7
  (7, 'Test Finale Realistico', 'Simulazione completa di una giornata lavorativa', ARRAY['Fai la routine mattutina completa e realistica', 'Esci per 30-45 minuti come in una vera uscita', 'Non dare segnali diversi dal solito', 'Comportati come se fosse un giorno normale', 'Questo è il test finale del protocollo'], 60, ARRAY['Routine completa', 'Pazienza', 'Timer']),
  (7, 'Valutazione Progressi', 'Analisi completa dei miglioramenti ottenuti', ARRAY['Confronta il comportamento del primo giorno con oggi', 'Annota tutti i miglioramenti osservati', 'Identifica eventuali aree che necessitano ancora lavoro', 'Decidi se ripetere il protocollo o se passare oltre', 'Documenta tutto per il futuro'], 20, ARRAY['Diario iniziale', 'Penna', 'Analisi comparativa']),
  (7, 'Celebrazione e Pianificazione', 'Riconoscimento dei successi e pianificazione futura', ARRAY['Celebra i progressi con un''attività che il pet ama', 'Gioco speciale, passeggiata extra, o cibo speciale', 'Pianifica come mantenere i risultati ottenuti', 'Stabilisci una routine di "mantenimento"', 'Ricorda: i progressi vanno mantenuti con pratica regolare'], 30, ARRAY['Attività speciale', 'Piano di mantenimento'])
) AS day_info(day_number, title, description, instructions, duration_minutes, materials)
WHERE title = 'Gestione Ansia da Separazione';