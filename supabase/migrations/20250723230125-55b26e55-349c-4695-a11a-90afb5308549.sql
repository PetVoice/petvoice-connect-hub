-- Continuo con i restanti protocolli

-- ============ ESERCIZI PER "Calmare l'Agitazione" (7 giorni x 3 = 21 esercizi) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'agitato' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Ambiente di Calma', 'Creazione di uno spazio rilassante per ridurre agitazione', 20, ARRAY['Riduci luci intense', 'Elimina rumori improvvisi', 'Usa musica rilassante', 'Temperatura confortevole'], ARRAY['Musica soft', 'Luci soffuse', 'Tappetino antistress']),
  (1, 'Respirazione Sincronizzata', 'Tecnica di rilassamento attraverso il respiro', 15, ARRAY['Siediti accanto a lui', 'Respira lentamente e profondamente', 'Mantieni ritmo costante', 'Osserva se si sincronizza'], ARRAY['Cuscino comodo', 'Ambiente silenzioso']),
  (1, 'Movimenti Lenti', 'Attività fisica dolce per scaricare tensione', 25, ARRAY['Camminate molto lente', 'Evita stimoli eccessivi', 'Fermate frequenti', 'Premia calma e controllo'], ARRAY['Guinzaglio morbido', 'Percorso tranquillo']),
  
  -- Giorno 2
  (2, 'Massaggio Calmante', 'Tocco terapeutico per rilassare muscoli tesi', 20, ARRAY['Inizia da zone non sensibili', 'Movimenti circolari lenti', 'Pressione delicata', 'Fermati se si agita'], ARRAY['Mani calde', 'Olio rilassante pet-safe']),
  (2, 'Esercizi di Grounding', 'Tecniche per riportare attenzione al presente', 15, ARRAY['Fai annusare oggetti familiari', 'Concentrazione su texture', 'Comandi semplici e calmi', 'Premia focus e attenzione'], ARRAY['Oggetti texture varie', 'Profumi familiari']),
  (2, 'Gioco Strutturato', 'Attività controllata per canalizzare energia', 30, ARRAY['Giochi con regole chiare', 'Ritmo lento e prevedibile', 'Pause frequenti', 'Termina se aumenta agitazione'], ARRAY['Giocattoli non eccitanti', 'Spazio controllato']),
  
  -- Giorno 3
  (3, 'Training di Autocontrollo', 'Esercizi per gestire impulsi nervosi', 25, ARRAY['Comando "aspetta" prolungato', 'Incremento graduale tempi', 'Premia pazienza', 'Usa snack calmanti'], ARRAY['Timer', 'Snack rilassanti', 'Pazienza']),
  (3, 'Stimoli Graduati', 'Esposizione controllata a trigger di agitazione', 20, ARRAY['Introduci stimolo lievemente stressante', 'Distanza di sicurezza', 'Ricompensa calma', 'Rimuovi se si agita troppo'], ARRAY['Trigger controllato', 'Premi immediati']),
  (3, 'Routine Prevedibile', 'Stabilire pattern rassicuranti', 15, ARRAY['Crea sequenza di azioni sempre uguale', 'Stessi orari', 'Stesse posizioni', 'Rinforza prevedibilità'], ARRAY['Programma fisso', 'Oggetti sempre uguali']),
  
  -- Giorno 4
  (4, 'Mindfulness Guidata', 'Presenza consapevole per ridurre ansia', 30, ARRAY['Siediti in silenzio insieme', 'Concentrati su suoni ambiente', 'Non forzare interazione', 'Mantieni presenza calma'], ARRAY['Spazio silenzioso', 'Presenza totale']),
  (4, 'Esercizio Mentale Calmo', 'Attività cognitive che non eccitano', 20, ARRAY['Puzzle semplici', 'Ricerca odori nascosti', 'Problem solving lento', 'Premia pensiero tranquillo'], ARRAY['Puzzle facili', 'Nascondigli semplici']),
  (4, 'Socializzazione Controllata', 'Incontri calmanti con altri', 25, ARRAY['Solo con animali molto tranquilli', 'Territorio neutro e silenzioso', 'Sessioni brevi', 'Supervisione costante'], ARRAY['Partner calmo', 'Ambiente neutro']),
  
  -- Giorno 5
  (5, 'Desensibilizzazione Progressiva', 'Riduzione graduale reattività', 35, ARRAY['Esposizione minima a trigger', 'Associazione con cose positive', 'Incremento lentissimo', 'Stop immediato se regredisce'], ARRAY['Trigger graduato', 'Premi eccellenti']),
  (5, 'Attività di Grounding Avanzato', 'Ancoraggio più profondo al presente', 25, ARRAY['Concentrazione su 5 sensi', 'Identificare suoni, odori, texture', 'Esercizi di focus prolungato', 'Celebra momenti di calma'], ARRAY['Stimoli sensoriali vari', 'Ambiente ricco ma calmo']),
  (5, 'Training di Rilassamento', 'Insegnare posizioni e stati di calma', 20, ARRAY['Comando "rilassati" + posizione', 'Associa parola a stato calmo', 'Premia rilassamento volontario', 'Ripeti in contesti diversi'], ARRAY['Comando vocale', 'Spazi diversi']),
  
  -- Giorno 6
  (6, 'Test di Resistenza', 'Valutare capacità di mantenere calma', 30, ARRAY['Esposizione controllata a stress', 'Misura durata calma', 'Supporta senza sostituire', 'Documenta progressi'], ARRAY['Scenario test', 'Cronometro', 'Supporto discreto']),
  (6, 'Autonomia nel Relax', 'Sviluppo di autoregolazione', 25, ARRAY['Riduce supporto umano gradualmente', 'Lascia gestire stress da solo', 'Intervieni solo se necessario', 'Premia autocontrollo'], ARRAY['Spazio autonomo', 'Osservazione discreta']),
  (6, 'Consolidamento Tecniche', 'Rinforzo di tutte le strategie apprese', 20, ARRAY['Ripassa esercizi più efficaci', 'Combina tecniche multiple', 'Pratica in situazioni varie', 'Cementa abitudini positive'], ARRAY['Kit completo tecniche']),
  
  -- Giorno 7
  (7, 'Valutazione Finale', 'Misurazione miglioramenti ottenuti', 25, ARRAY['Confronta agitazione iniziale vs finale', 'Testa in situazioni prima problematiche', 'Documenta strategie più efficaci', 'Celebra progresso'], ARRAY['Diario progressi', 'Situazioni test']),
  (7, 'Piano di Mantenimento', 'Strategia per conservare calma acquisita', 20, ARRAY['Identifica trigger principali', 'Stabilisci routine anti-agitazione', 'Pianifica interventi preventivi', 'Prepara kit di emergenza'], ARRAY['Piano scritto', 'Kit anti-agitazione']),
  (7, 'Proiezione Futura', 'Preparazione per sfide future', 15, ARRAY['Anticipa situazioni potenzialmente stressanti', 'Prepara strategie specifiche', 'Stabilisci rete di supporto', 'Mantieni abitudini calmanti'], ARRAY['Strategia preventiva', 'Rete supporto'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- ============ ESERCIZI PER "Gestire l'Irritabilità" (9 giorni x 3 = 27 esercizi) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'irritabile' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Identificazione Trigger', 'Riconoscimento di ciò che scatena irritabilità', 20, ARRAY['Osserva quando si irrita', 'Annota circostanze scatenanti', 'Identifica pattern temporali', 'Nota intensità reazioni'], ARRAY['Diario osservazioni', 'Penna e carta']),
  (1, 'Creazione Zona Buffer', 'Spazio sicuro dove ritirarsi quando irritato', 15, ARRAY['Allestisci angolo tranquillo', 'Solo oggetti rilassanti', 'Accesso sempre libero', 'Rispetta quando si ritira'], ARRAY['Cuccia comoda', 'Barriere visive', 'Silenzio']),
  (1, 'Riconoscimento Segnali Precoci', 'Imparare a vedere irritazione che inizia', 25, ARRAY['Studia linguaggio corporeo', 'Riconosci tensione muscolare', 'Nota cambi respirazione', 'Intervieni ai primi segnali'], ARRAY['Attenzione focalizzata', 'Conoscenza corporea']),
  
  -- Giorno 2
  (2, 'Interruzione Pattern', 'Tecniche per fermare escalation', 25, ARRAY['Distrazione positiva quando inizia', 'Cambia ambiente immediatamente', 'Introduci elemento calmante', 'Non confrontare o sfidare'], ARRAY['Distrazioni pronte', 'Piani fuga']),
  (2, 'Training di Pazienza', 'Esercizi per aumentare tolleranza', 20, ARRAY['Ritarda gratificazione gradualmente', 'Premia attesa calma', 'Incrementa tempi lentamente', 'Usa rinforzi molto motivanti'], ARRAY['Timer', 'Premi eccezionali']),
  (2, 'Controllo Ambientale', 'Riduzione stimoli che irritano', 15, ARRAY['Elimina rumori fastidiosi', 'Riduci sovraffollamento', 'Evita competizione per risorse', 'Crea routine prevedibili'], ARRAY['Controllo ambiente', 'Routine fisse']),
  
  -- Giorno 3
  (3, 'Esercizi di Tolleranza', 'Aumentare soglia di irritazione', 30, ARRAY['Esposizione graduale a irritanti minori', 'Premia tolleranza anche breve', 'Aumenta durata molto lentamente', 'Interrompi se diventa troppo stressante'], ARRAY['Irritanti controllati', 'Cronometro']),
  (3, 'Training di Comunicazione', 'Modi alternativi per esprimere frustrazione', 20, ARRAY['Insegna segnali per comunicare disagio', 'Premia comunicazione calma', 'Ignora comunicazione aggressiva', 'Rispondi sempre ai segnali appropriati'], ARRAY['Segnali concordati', 'Risposte immediate']),
  (3, 'Tecniche di Redirezione', 'Canalizzare irritazione in modo costruttivo', 25, ARRAY['Offri attività fisica quando teso', 'Giochi che richiedono concentrazione', 'Attività che scaricano energia', 'Premia partecipazione positiva'], ARRAY['Giochi fisici', 'Attività concentrazione']),
  
  -- Giorno 4
  (4, 'Gestione Frustrazione', 'Strategie per when le cose non vanno come vuole', 35, ARRAY['Presenta sfide gestibili', 'Insegna a gestire fallimento', 'Premia tentativi anche se falliti', 'Mostra alternative quando bloccato'], ARRAY['Sfide graduate', 'Piani B sempre pronti']),
  (4, 'Training di Autocontrollo', 'Sviluppo di capacità di autoregolazione', 25, ARRAY['Esercizi "fermati e pensa"', 'Comando di autocontrollo', 'Premia quando si ferma da solo', 'Pratica in situazioni provocatorie'], ARRAY['Comandi chiari', 'Situazioni test']),
  (4, 'Socializzazione con Limiti', 'Interazione con altri rispettando limiti', 20, ARRAY['Incontri con regole chiare', 'Spazi personali rispettati', 'Supervisione costante', 'Rimozione prima di escalation'], ARRAY['Regole scritte', 'Supervisore']),
  
  -- Giorno 5
  (5, 'Desensibilizzazione Sistematica', 'Riduzione graduale reattività a trigger', 30, ARRAY['Esposizione molto graduale', 'Associazione con esperienze positive', 'Controllo intensità stimolo', 'Progressione basata su successi'], ARRAY['Trigger graduabili', 'Premi motivanti']),
  (5, 'Sviluppo Empatia', 'Comprensione di prospettive altrui', 25, ARRAY['Osservazione comportamento umano', 'Ricompensa per considerazione altri', 'Pratica in gruppo piccolo', 'Modellamento comportamento prosociale'], ARRAY['Gruppo controllato', 'Esempi positivi']),
  (5, 'Tecniche di Grounding', 'Ancoraggio al momento presente quando irritato', 20, ARRAY['Focus su sensazioni fisiche immediate', 'Concentrazione su respiro', 'Attenzione a suoni ambiente', 'Ritorno al qui e ora'], ARRAY['Guida concentrazione', 'Ambiente stabile']),
  
  -- Giorno 6
  (6, 'Problem Solving Collaborativo', 'Risoluzione problemi insieme al proprietario', 35, ARRAY['Presenta problemi semplici insieme', 'Lavorate come squadra', 'Celebrate successi condivisi', 'Sviluppate fiducia reciproca'], ARRAY['Problemi da risolvere', 'Spirito collaborativo']),
  (6, 'Pratica in Situazioni Reali', 'Test in contesti naturalmente irritanti', 30, ARRAY['Situazioni controllate ma realistiche', 'Supporto senza sostituire', 'Intervento solo se necessario', 'Documentazione reazioni'], ARRAY['Scenari reali', 'Supporto discreto']),
  (6, 'Rinforzo Comportamenti Alternativi', 'Consolidamento risposte positive', 15, ARRAY['Identifica comportamenti sostitutivi', 'Premia immediatamente alternative positive', 'Ignora completamente irritabilità', 'Mantieni coerenza assoluta'], ARRAY['Lista comportamenti target', 'Rinforzi immediati']),
  
  -- Giorno 7
  (7, 'Autonomia nell\'Autoregolazione', 'Sviluppo indipendenza nel controllo', 30, ARRAY['Riduci supporto esterno gradualmente', 'Lascia gestire situazioni da solo', 'Intervieni solo in emergenza', 'Premia autogestione'], ARRAY['Autonomia guidata', 'Osservazione discreta']),
  (7, 'Test di Resistenza', 'Valutazione capacità in situazioni stressanti', 25, ARRAY['Situazioni provocatorie controllate', 'Misura durata autocontrollo', 'Nota strategie che usa spontaneamente', 'Celebra progressi evidenti'], ARRAY['Test graduati', 'Metriche progresso']),
  (7, 'Costruzione Fiducia', 'Rafforzamento autostima e sicurezza', 20, ARRAY['Evidenzia miglioramenti ottenuti', 'Celebra momenti di autocontrollo', 'Costruisci su successi', 'Aumenta sfide gradualmente'], ARRAY['Riconoscimento successi', 'Sfide progressive']),
  
  -- Giorno 8
  (8, 'Integrazione Sociale', 'Pratica in contesti sociali vari', 35, ARRAY['Interazioni con diversi tipi di individui', 'Situazioni sociali graduali', 'Supporto nella navigazione sociale', 'Premia comportamenti appropriati'], ARRAY['Contesti sociali vari', 'Supporto sociale']),
  (8, 'Mantenimento Progressi', 'Strategie per conservare miglioramenti', 25, ARRAY['Routine giornaliera di controllo', 'Check-in regolari stato emotivo', 'Pratica costante tecniche apprese', 'Adattamento strategie se necessario'], ARRAY['Routine mantenimento', 'Sistema monitoraggio']),
  (8, 'Preparazione Sfide Future', 'Anticipazione e preparazione per stress futuri', 15, ARRAY['Identificazione potenziali trigger futuri', 'Sviluppo piani contingenza', 'Preparazione kit di supporto', 'Rete di aiuto in caso bisogno'], ARRAY['Piani contingenza', 'Kit emergenza']),
  
  -- Giorno 9
  (9, 'Valutazione Complessiva', 'Misurazione trasformazione ottenuta', 30, ARRAY['Confronto comportamento iniziale vs finale', 'Test in situazioni precedentemente problematiche', 'Documentazione strategie più efficaci', 'Celebrazione trasformazione'], ARRAY['Diario confronto', 'Test finali']),
  (9, 'Pianificazione Mantenimento', 'Strategia a lungo termine per conservare risultati', 20, ARRAY['Piano settimanale di pratica', 'Identificazione segnali di pericolo', 'Strategia intervento precoce', 'Rete supporto attivabile'], ARRAY['Piano lungo termine', 'Sistema allerta']),
  (9, 'Proiezione Crescita Futura', 'Impostazione obiettivi di sviluppo continuo', 15, ARRAY['Definizione obiettivi crescita', 'Pianificazione nuove sfide', 'Sviluppo continuo competenze', 'Mantenimento momentum positivo'], ARRAY['Obiettivi futuri', 'Piano crescita'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);