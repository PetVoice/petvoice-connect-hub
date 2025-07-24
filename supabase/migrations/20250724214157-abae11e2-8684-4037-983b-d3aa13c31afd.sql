-- Aggiorna gli esercizi del protocollo "Calmare l'Agitazione" per avere parole in MAIUSCOLO nelle istruzioni
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'PREPARA ambiente silenzioso con TAPPETO COMODO', 
  'POSIZIONA pet sul tappeto, SIEDITI a 1 metro di distanza',
  'PRONUNCIA "calmo" quando pet è rilassato, PREMIA immediatamente',
  'INTRODUCI distrazioni graduali (SUONI BASSI → rumori domestici)',
  'AUMENTA durata: 5 min → 10 min → 15 min → 30 min PROGRESSIVAMENTE',
  'PREMIA solo stati di CALMA COMPLETA, IGNORA agitazione',
  'TERMINA con pet calmo, RIDUCI distrazioni gradualmente',
  'MONITORA segnali stress, ADATTA intensità se necessario'
],
updated_at = NOW()
WHERE title = 'Training di Calma Avanzato' OR title LIKE '%Ambiente di Calma%';