-- Mass translation of Italian instructions to English

-- First, let's create a function to translate common Italian phrases
CREATE OR REPLACE FUNCTION translate_italian_to_english(italian_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE 
    -- Common starting words
    WHEN italian_text LIKE 'Scegli %' THEN REPLACE(italian_text, 'Scegli ', 'Choose ')
    WHEN italian_text LIKE 'Posiziona %' THEN REPLACE(italian_text, 'Posiziona ', 'Position ')
    WHEN italian_text LIKE 'Mantieni %' THEN REPLACE(italian_text, 'Mantieni ', 'Maintain ')
    WHEN italian_text LIKE 'Inizia %' THEN REPLACE(italian_text, 'Inizia ', 'Start ')
    WHEN italian_text LIKE 'Organizza %' THEN REPLACE(italian_text, 'Organizza ', 'Organize ')
    WHEN italian_text LIKE 'Chiedi %' THEN REPLACE(italian_text, 'Chiedi ', 'Ask ')
    WHEN italian_text LIKE 'Offri %' THEN REPLACE(italian_text, 'Offri ', 'Offer ')
    WHEN italian_text LIKE 'Osserva %' THEN REPLACE(italian_text, 'Osserva ', 'Observe ')
    WHEN italian_text LIKE 'Controlla %' THEN REPLACE(italian_text, 'Controlla ', 'Check ')
    WHEN italian_text LIKE 'Verifica %' THEN REPLACE(italian_text, 'Verifica ', 'Verify ')
    WHEN italian_text LIKE 'Usa %' THEN REPLACE(italian_text, 'Usa ', 'Use ')
    WHEN italian_text LIKE 'Assicurati %' THEN REPLACE(italian_text, 'Assicurati ', 'Make sure ')
    WHEN italian_text LIKE 'Evita %' THEN REPLACE(italian_text, 'Evita ', 'Avoid ')
    WHEN italian_text LIKE 'Ricompensa %' THEN REPLACE(italian_text, 'Ricompensa ', 'Reward ')
    WHEN italian_text LIKE 'Premia %' THEN REPLACE(italian_text, 'Premia ', 'Reward ')
    WHEN italian_text LIKE 'Documenta %' THEN REPLACE(italian_text, 'Documenta ', 'Document ')
    WHEN italian_text LIKE 'Aumenta %' THEN REPLACE(italian_text, 'Aumenta ', 'Increase ')
    WHEN italian_text LIKE 'Riduci %' THEN REPLACE(italian_text, 'Riduci ', 'Reduce ')
    WHEN italian_text LIKE 'Monitora %' THEN REPLACE(italian_text, 'Monitora ', 'Monitor ')
    WHEN italian_text LIKE 'Ripeti %' THEN REPLACE(italian_text, 'Ripeti ', 'Repeat ')
    WHEN italian_text LIKE 'Crea %' THEN REPLACE(italian_text, 'Crea ', 'Create ')
    WHEN italian_text LIKE 'Stabilisci %' THEN REPLACE(italian_text, 'Stabilisci ', 'Establish ')
    WHEN italian_text LIKE 'Permetti %' THEN REPLACE(italian_text, 'Permetti ', 'Allow ')
    WHEN italian_text LIKE 'Ignora %' THEN REPLACE(italian_text, 'Ignora ', 'Ignore ')
    -- Body language phrases
    WHEN italian_text LIKE 'BODY LANGUAGE: Osserva %' THEN REPLACE(italian_text, 'BODY LANGUAGE: Osserva ', 'BODY LANGUAGE: Observe ')
    WHEN italian_text LIKE 'BODY LANGUAGE: Cerca %' THEN REPLACE(italian_text, 'BODY LANGUAGE: Cerca ', 'BODY LANGUAGE: Look for ')
    WHEN italian_text LIKE 'BODY LANGUAGE: Valuta %' THEN REPLACE(italian_text, 'BODY LANGUAGE: Valuta ', 'BODY LANGUAGE: Assess ')
    ELSE italian_text
  END;
END;
$$;

-- Now update all exercises with this function
UPDATE ai_training_exercises 
SET instructions = ARRAY(
  SELECT translate_italian_to_english(unnest(instructions))
);

-- Additional common word replacements
UPDATE ai_training_exercises 
SET instructions = ARRAY(
  SELECT REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      element,
      'animale', 'animal'),
      'ambiente', 'environment'),
      'comportamento', 'behavior'),
      'allenamento', 'training'),
      'sessione', 'session'),
      'minuti', 'minutes'),
      'secondi', 'seconds'),
      'distanza', 'distance'),
      'calma', 'calm'),
      'stress', 'stress'),
      'premio', 'reward'),
      'snack', 'treat'),
      'gioco', 'game'),
      'rilassato', 'relaxed'),
      'tranquillo', 'quiet'),
      'sicuro', 'safe'),
      'gradualmente', 'gradually'),
      'immediatamente', 'immediately'),
      'costantemente', 'constantly'),
      'completamente', 'completely')
  FROM unnest(instructions) AS element
);