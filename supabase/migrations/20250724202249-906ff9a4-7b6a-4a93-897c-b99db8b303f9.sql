-- Continua con gli altri esercizi del protocollo "Superare la Paura"

-- 7. Socializzazione Protetta
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SELEZIONE PERSONA: Scegli una persona molto calma che conosce i cani e può seguire istruzioni precise.',
    '2. BRIEFING VISITATORE: Spiega che deve ignorare completamente il pet, non guardarlo, non parlare, non muoversi verso di lui.',
    '3. POSIZIONE INIZIALE: Il visitatore si siede nella stanza adiacente, porta aperta, pet nella zona sicura.',
    '4. DISTANZA PROGRESSIVA: Solo se il pet è rilassato, il visitatore si avvicina di 1 metro ogni 10 minuti.',
    '5. PREMIAZIONE CORAGGIO: Ogni volta che il pet guarda il visitatore senza stress, premio immediato.',
    '6. CONTROLLO APPROCCIO: Se il pet si avvicina spontaneamente, il visitatore resta immobile come una statua.',
    '7. DURATA LIMITATA: Massimo 30 minuti totali, termina sempre prima che il pet mostri stanchezza o stress.'
  ],
  description = 'Incontri controllati per abituare gradualmente il pet alla presenza di estranei, costruendo fiducia attraverso esperienze positive.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Socializzazione Protetta';

-- 8. Esercizio di Respirazione
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. POSIZIONE COMODA: Siediti sul pavimento vicino al pet, preferibilmente nella zona sicura che conosce.',
    '2. CONTROLLO PERSONALE: Prima calma te stesso - se sei agitato il pet lo percepisce immediatamente.',
    '3. RESPIRAZIONE VISIBILE: Respira lentamente e profondamente, fai in modo che sia visibile il movimento del petto.',
    '4. RITMO GUIDATO: 4 secondi inspira, 2 secondi pausa, 6 secondi espira - ripeti per 5 minuti.',
    '5. CONTATTO OPZIONALE: Se il pet è a suo agio, appoggia delicatamente una mano sul suo fianco seguendo la sua respirazione.',
    '6. SINCRONIZZAZIONE: Cerca di sincronizzare gradualmente la tua respirazione con la sua.',
    '7. AMBIENTE ZEN: Aggiungi musica rilassante a volume basso e aromi naturali calmanti se graditi.'
  ],
  description = 'Tecnica di rilassamento condiviso che calma sia pet che proprietario, creando un momento di connessione profonda.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Esercizio di Respirazione';

-- 9. Passeggiata Sicura
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. PERCORSO PIANIFICATO: Scegli un percorso molto familiare, preferibilmente lo stesso ogni giorno per creare routine.',
    '2. ORARI STRATEGICI: Evita orari di punta, scegli momenti tranquilli con meno traffico e meno persone.',
    '3. EQUIPAGGIAMENTO: Usa pettorina confortevole (mai collare), guinzaglio non retrattile di 1,5 metri.',
    '4. RITMO LENTO: Cammina molto lentamente, lascia che sia il pet a dettare la velocità.',
    '5. PAUSE FREQUENTI: Fermati ogni 50 metri per permettere annusate e orientamento ambientale.',
    '6. LETTURA SEGNALI: Se vedi orecchie indietro o coda bassa, fermati e fai un passo indietro.',
    '7. RIENTRO SICURO: Al primo segno di stress eccessivo, torna immediatamente a casa senza forzature.'
  ],
  description = 'Esplorazione controllata dell''ambiente esterno per abituare gradualmente agli stimoli esterni mantenendo sicurezza.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Passeggiata Sicura';

-- 10. Gioco di Fiducia
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SETUP INIZIALE: Scegli un nascondiglio molto ovvio (dietro divano) dove il pet può vederti parzialmente.',
    '2. CHIAMATA DOLCE: Usa il suo nome con voce dolcissima e invitante, mai imperativa o ansiosa.',
    '3. ATTESA PAZIENTE: Dopo aver chiamato, aspetta anche 2-3 minuti senza ripetere o insistere.',
    '4. MOVIMENTO LENTO: Quando si avvicina, resta fermo e lascia che sia lui a raggiungerti.',
    '5. PREMIO ENORME: Nel momento in cui arriva, festa grande con premi eccezionali e carezze.',
    '6. VARIAZIONE GRADUALE: Nascondiglio leggermente più difficile solo dopo 5-6 successi consecutivi.',
    '7. COSTRUZIONE FIDUCIA: Ogni volta che viene dimostra che chiamarlo porta sempre cose belle.'
  ],
  description = 'Attività per costruire fiducia reciproca e rafforzare il richiamo, fondamentale per la sicurezza del pet.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Gioco di Fiducia';

-- 11. Massaggio Anti-stress
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. PREPARAZIONE MANI: Riscalda le mani sfregandole, mani fredde possono essere spiacevoli.',
    '2. ZONA PREFERITA: Inizia dalla zona che ama di più (spesso testa o sotto il mento).',
    '3. PRESSIONE LEGGERA: Usa pressione molto delicata, come se stessi accarezzando un neonato.',
    '4. MOVIMENTI CIRCOLARI: Fai cerchi piccoli e lenti con i polpastrelli, evita movimenti lineari.',
    '5. LETTURA REAZIONI: Se si irrigidisce o si allontana, fermati immediatamente e riprova più tardi.',
    '6. ZONE PROGRESSIVE: Solo se rilassato, espandi gradualmente ad altre zone (spalle, schiena).',
    '7. FINALE DOLCE: Termina sempre con carezze lunghe e dolci dalle orecchie fino alla coda.'
  ],
  description = 'Tocco terapeutico per favorire rilassamento profondo e rafforzare il legame attraverso il contatto fisico positivo.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Massaggio Anti-stress';

-- 12. Sfida Graduata
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. FOCUS SINGOLO: Scegli UNA sola paura specifica su cui lavorare, non mischiare mai più trigger.',
    '2. SCALA INTENSITÀ: Crea una scala da 1 a 10 dell''intensità del trigger (1=quasi impercettibile, 10=intensità massima).',
    '3. PARTENZA MINIMA: Inizia sempre dal livello 1, anche se sembra ridicolmente basso.',
    '4. CRITERIO SUCCESSO: Passa al livello successivo solo dopo 3 giorni consecutivi di calma totale.',
    '5. PREMI STRAORDINARI: Usa i premi più buoni che hai solo per questo esercizio specifico.',
    '6. MONITORAGGIO STRESS: Al primo segno di stress torna immediatamente al livello precedente.',
    '7. PAZIENZA ASSOLUTA: Non avere fretta, alcuni livelli potrebbero richiedere settimane di lavoro.'
  ],
  description = 'Affrontamento sistematico di una paura specifica attraverso esposizione molto graduale e supporto costante.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Sfida Graduata';