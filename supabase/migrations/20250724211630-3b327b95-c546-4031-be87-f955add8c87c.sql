UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  'Prepara ambiente silenzioso con tappeto comodo',
  'Posiziona pet sul tappeto, siediti a 1 metro di distanza',
  'Pronuncia "calmo" quando pet è rilassato, premia immediatamente',
  'Introduci distrazioni graduali (suoni bassi → rumori domestici)',
  'Aumenta durata: 5 min → 10 min → 15 min → 30 min progressivamente',
  'Premia solo stati di calma completa, ignora agitazione',
  'Termina con pet calmo, riduci distrazioni gradualmente',
  'Monitora segnali stress, adatta intensità se necessario'
]
WHERE id = 'a0651e98-6f89-4a26-8001-53fbf8e3121f';