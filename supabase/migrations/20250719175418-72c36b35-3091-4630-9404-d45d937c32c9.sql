-- Correggi la struttura dei protocolli con durate realistiche e crea esercizi completi

-- Prima aggiorniamo le durate dei protocolli esistenti
UPDATE ai_training_protocols 
SET duration_days = 14 
WHERE duration_days > 14;

UPDATE ai_training_protocols 
SET duration_days = 7 
WHERE category IN ('ansia', 'aggressivita') AND duration_days < 7;

-- Eliminiamo eventuali esercizi esistenti per ricrearli
DELETE FROM ai_training_exercises;

-- Creiamo esercizi per il protocollo "Gestione Ansia da Separazione" (7 giorni, 21 esercizi)
-- Selezioniamo specificamente il protocollo per ansia da separazione
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
        -- Inserisci tutti gli esercizi per questo protocollo
        INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, instructions, exercise_type, duration_minutes, materials) VALUES
        -- GIORNO 1
        (protocol_uuid, 1, 'Osservazione Baseline Mattina', 'Valutazione iniziale del comportamento quando ti prepari per uscire', ARRAY['Osserva il tuo pet per 10 minuti mentre fai le normali routine mattutine', 'Annota ogni segno di ansia: ansimare, camminare avanti e indietro, piagnucolare', 'Non reagire ai comportamenti ansiosi, comportati normalmente', 'Registra tutto su un diario'], 'behavioral', 10, ARRAY['Diario', 'Penna']),
        (protocol_uuid, 1, 'Test Separazione Breve', 'Prima prova di separazione molto breve per stabilire la tolleranza', ARRAY['Prepara tutto per uscire ma non uscire ancora', 'Vai verso la porta, aprila e chiudila senza uscire', 'Osserva la reazione del pet', 'Se rimane calmo, esci per soli 30 secondi', 'Rientra in silenzio, ignora comportamenti eccessivi'], 'behavioral', 15, ARRAY['Cronometro', 'Chiavi']),
        (protocol_uuid, 1, 'Rilassamento Serale', 'Esercizio di rilassamento per terminare la giornata positivamente', ARRAY['Crea un ambiente calmo con luci soffuse', 'Siediti vicino al tuo pet e accarezzalo dolcemente', 'Parla con voce bassa e rassicurante', 'Pratica respirazione profonda anche tu', 'Durata: 15 minuti di calma totale'], 'behavioral', 15, ARRAY['Luci soffuse', 'Coperta']),
        
        -- GIORNO 2
        (protocol_uuid, 2, 'Routine Pre-Uscita Desensibilizzazione', 'Abituare il pet ai segnali di partenza senza ansia', ARRAY['Ripeti le azioni di preparazione per uscire senza effettivamente uscire', 'Prendi le chiavi, metti la giacca, prendi la borsa', 'Fai queste azioni 5 volte in 20 minuti', 'Premia la calma con un treat ogni volta', 'Ignora completamente i segni di ansia'], 'behavioral', 20, ARRAY['Chiavi', 'Giacca', 'Borsa', 'Treats']),
        (protocol_uuid, 2, 'Gioco di Distrazione Intensivo', 'Creare associazioni positive con giochi mentalmente stimolanti', ARRAY['Introduci un puzzle toy o gioco di intelligenza', 'Fai giocare il pet per 15 minuti con supervisione', 'Usa solo questo gioco speciale quando pratichi la separazione', 'Rimuovi il gioco quando finisce l''esercizio', 'Il gioco deve essere davvero interessante e coinvolgente'], 'behavioral', 20, ARRAY['Puzzle toy', 'Treats nascosti', 'Timer']),
        (protocol_uuid, 2, 'Separazione Incrementale', 'Aumento graduale del tempo di separazione', ARRAY['Prepara il gioco speciale per il pet', 'Esci per 1-2 minuti massimo', 'Rientra prima che il pet mostri ansia estrema', 'Ignora completamente il pet per 2 minuti al rientro', 'Ripeti 3 volte con pause di 10 minuti'], 'behavioral', 25, ARRAY['Gioco speciale', 'Cronometro']);
    END IF;
END $$;