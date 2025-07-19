-- Completa tutti gli esercizi per il protocollo Ansia da Separazione (giorni 3-7)
DO $$
DECLARE
    protocol_uuid UUID;
BEGIN
    -- Trova l'ID del protocollo per l'ansia da separazione
    SELECT id INTO protocol_uuid 
    FROM ai_training_protocols 
    WHERE category = 'ansia' 
    AND (title ILIKE '%separazione%' OR title ILIKE '%ansia%')
    LIMIT 1;
    
    IF protocol_uuid IS NOT NULL THEN
        -- Inserisci gli esercizi rimanenti (giorni 3-7)
        INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, instructions, exercise_type, duration_minutes, materials) VALUES
        -- GIORNO 3
        (protocol_uuid, 3, 'Comando "Resta" Avanzato', 'Rafforzare l''autocontrollo e la capacità di rimanere fermo', ARRAY['Inizia con il pet seduto di fronte a te', 'Di "resta" e fai un passo indietro', 'Se rimane fermo per 5 secondi, torna e premia', 'Aumenta gradualmente la distanza e il tempo', 'Arriva fino a 2 metri di distanza per 30 secondi'], 'behavioral', 20, ARRAY['Treats premium', 'Spazio aperto']),
        (protocol_uuid, 3, 'Associazione Positiva Porta', 'Creare emozioni positive legate alla porta di uscita', ARRAY['Posiziona la ciotola del cibo vicino alla porta', 'Dai treats speciali solo vicino alla porta', 'Gioca con il toy preferito vicino alla porta', 'Fai questo per 15 minuti, 3 volte durante il giorno', 'La porta deve diventare un posto "fortunato"'], 'behavioral', 15, ARRAY['Treats speciali', 'Toy preferito', 'Ciotola']),
        (protocol_uuid, 3, 'Uscita di 3-5 Minuti', 'Estensione controllata del tempo di separazione', ARRAY['Prepara il gioco puzzle con treats molto appetitosi', 'Esci senza salutare o fare drammi', 'Rimani fuori per 3-5 minuti', 'Rientra con calma, ignora per 3 minuti', 'Premia solo quando il pet è completamente calmo'], 'behavioral', 30, ARRAY['Puzzle toys', 'Treats speciali', 'Cronometro']),

        -- GIORNO 4
        (protocol_uuid, 4, 'Variazione Orari di Uscita', 'Evitare che il pet anticipi sempre l''orario di uscita', ARRAY['Cambia l''orario degli esercizi di separazione', 'Fai uscite brevissime (1 minuto) a orari casuali', 'Alterna mattina, pomeriggio e sera', 'Non creare pattern prevedibili', 'Mantieni sempre la stessa procedura calma'], 'behavioral', 25, ARRAY['Timer casuale', 'Agenda']),
        (protocol_uuid, 4, 'Comfort Zone Expansion', 'Aumentare la fiducia del pet in spazi diversi della casa', ARRAY['Sposta il pet in una stanza diversa dal solito', 'Lascialo da solo in quella stanza per 2-3 minuti', 'Assicurati che abbia water, comfort toys', 'Torna senza fare storie', 'Ripeti con diverse stanze della casa'], 'behavioral', 20, ARRAY['Comfort toys', 'Ciotola acqua', 'Coperta familiare']),
        (protocol_uuid, 4, 'Separazione 5-8 Minuti', 'Aumento significativo del tempo di tolleranza', ARRAY['Usa ora 2-3 puzzle toys diversi', 'Esci per 5-8 minuti senza avvisaglie', 'Varia il punto di uscita (porta principale/secondaria)', 'Al rientro, ignora per 5 minuti completi', 'Premia solo la calma assoluta'], 'behavioral', 35, ARRAY['Puzzle toys multipli', 'Cronometro']),

        -- GIORNO 5
        (protocol_uuid, 5, 'Simulazione Uscita Lavoro', 'Prova realistica di una vera uscita lavorativa', ARRAY['Fai la routine completa del mattino come se andassi a lavoro', 'Includi doccia, colazione, vestiti da lavoro', 'Esci per 10-15 minuti massimo', 'Comportati esattamente come in un giorno normale', 'Non dare attenzioni speciali prima o dopo'], 'behavioral', 40, ARRAY['Routine normale', 'Timer', 'Vestiti da lavoro']),
        (protocol_uuid, 5, 'Rinforzo Positivo Intensivo', 'Consolidare i progressi con ricompense molto appetitose', ARRAY['Prepara treats eccezionali che usi solo per questo', 'Fai micro-uscite (30 secondi) seguite da mega-premio', 'Ripeti 10 volte in 30 minuti', 'Il pet deve associare la tua uscita a cose fantastiche', 'Usa il cibo più amato in assoluto'], 'behavioral', 30, ARRAY['Treats premium', 'Cibo super-appetitoso']),
        (protocol_uuid, 5, 'Test Resistenza', 'Verifica della capacità di rimanere calmo per periodi medio-lunghi', ARRAY['Esci per 15-20 minuti', 'Lascia telecamera o registratore se possibile', 'Non dare indicazioni particolari al pet', 'Rientra con massima calma', 'Analizza se ci sono stati episodi di ansia'], 'behavioral', 45, ARRAY['Telecamera/registratore opzionale', 'Cronometro']),

        -- GIORNO 6
        (protocol_uuid, 6, 'Gestione Imprevisti', 'Preparare il pet a cambiamenti di routine inaspettati', ARRAY['Cambia completamente l''orario degli esercizi', 'Fai uscite multiple brevi e casuali', 'Simula dimenticanze: rientra per prendere qualcosa', 'Varia la durata da 2 a 25 minuti', 'Mantieni sempre la stessa calma al rientro'], 'behavioral', 50, ARRAY['Flessibilità oraria', 'Oggetti da "dimenticare"']),
        (protocol_uuid, 6, 'Socializzazione Indipendente', 'Promuovere sicurezza anche in presenza di distrazioni esterne', ARRAY['Esci mentre ci sono rumori esterni (vicini, traffico)', 'Lascia finestre aperte per rumori naturali', 'Il pet deve rimanere calmo nonostante le distrazioni', 'Durata: 15 minuti con distrazioni', 'Premia la calma nonostante il "caos" esterno'], 'behavioral', 25, ARRAY['Ambiente con rumori naturali']),
        (protocol_uuid, 6, 'Consolidamento Serale', 'Ripasso intensivo di tutte le tecniche apprese', ARRAY['Combina tutti gli esercizi della settimana in uno', 'Routine pre-uscita + gioco + separazione di 20 minuti', 'Usa tutte le tecniche apprese', 'Deve essere l''esercizio più completo', 'Celebra i progressi con una sessione di coccole finali'], 'behavioral', 45, ARRAY['Tutti i materiali usati', 'Energia positiva']),

        -- GIORNO 7
        (protocol_uuid, 7, 'Test Finale Realistico', 'Simulazione completa di una giornata lavorativa', ARRAY['Fai la routine mattutina completa e realistica', 'Esci per 30-45 minuti come in una vera uscita', 'Non dare segnali diversi dal solito', 'Comportati come se fosse un giorno normale', 'Questo è il test finale del protocollo'], 'behavioral', 60, ARRAY['Routine completa', 'Pazienza', 'Timer']),
        (protocol_uuid, 7, 'Valutazione Progressi', 'Analisi completa dei miglioramenti ottenuti', ARRAY['Confronta il comportamento del primo giorno con oggi', 'Annota tutti i miglioramenti osservati', 'Identifica eventuali aree che necessitano ancora lavoro', 'Decidi se ripetere il protocollo o se passare oltre', 'Documenta tutto per il futuro'], 'behavioral', 20, ARRAY['Diario iniziale', 'Penna', 'Analisi comparativa']),
        (protocol_uuid, 7, 'Celebrazione e Pianificazione', 'Riconoscimento dei successi e pianificazione futura', ARRAY['Celebra i progressi con un''attività che il pet ama', 'Gioco speciale, passeggiata extra, o cibo speciale', 'Pianifica come mantenere i risultati ottenuti', 'Stabilisci una routine di "mantenimento"', 'Ricorda: i progressi vanno mantenuti con pratica regolare'], 'behavioral', 30, ARRAY['Attività speciale', 'Piano di mantenimento']);
    END IF;
END $$;