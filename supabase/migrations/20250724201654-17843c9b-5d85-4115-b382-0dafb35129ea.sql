-- Aggiorna l'esercizio "Training di Calma Avanzato" con istruzioni più dettagliate
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. PREPARAZIONE AMBIENTE: Scegli uno spazio tranquillo e familiare, rimuovi distrazioni evidenti e prepara premi ad alto valore.',
    '2. POSIZIONE BASE: Fai assumere al cane la posizione "seduto" o "terra" in un punto fisso che diventerà il "posto della calma".',
    '3. COMANDO CALMO: Introduci il comando "CALMO" con voce ferma ma dolce, mantenendo il contatto visivo con il cane.',
    '4. INTRODUZIONE DISTRAZIONI: Inizia con distrazioni lievi (rumore di chiavi) e aumenta gradualmente l''intensità solo se il cane mantiene la calma.',
    '5. RINFORZO POSITIVO: Premia immediatamente ogni comportamento calmo con il comando "BRAVO, CALMO" seguito da un premio.',
    '6. TEMPO DI MANTENIMENTO: Aumenta progressivamente il tempo in cui il cane deve rimanere calmo prima di ricevere il premio.',
    '7. FINE POSITIVA: Termina sempre la sessione quando il cane è ancora calmo e concentrato, mai durante uno stato di agitazione.'
  ],
  description = 'Esercizi avanzati per sviluppare autocontrollo e mantenere la calma in situazioni di stress crescente, utilizzando distrazioni graduate e rinforzo positivo.',
  updated_at = NOW()
WHERE protocol_id = '213bb613-ce0a-4db9-9c51-155d3c56e048'
  AND title = 'Training di Calma Avanzato';