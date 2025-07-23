-- Create comprehensive function to translate back to Italian
CREATE OR REPLACE FUNCTION translate_english_to_italian(english_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN CASE 
    -- Common starting words
    WHEN english_text LIKE 'Choose %' THEN REPLACE(english_text, 'Choose ', 'Scegli ')
    WHEN english_text LIKE 'Position %' THEN REPLACE(english_text, 'Position ', 'Posiziona ')
    WHEN english_text LIKE 'Maintain %' THEN REPLACE(english_text, 'Maintain ', 'Mantieni ')
    WHEN english_text LIKE 'Start %' THEN REPLACE(english_text, 'Start ', 'Inizia ')
    WHEN english_text LIKE 'Organize %' THEN REPLACE(english_text, 'Organize ', 'Organizza ')
    WHEN english_text LIKE 'Ask %' THEN REPLACE(english_text, 'Ask ', 'Chiedi ')
    WHEN english_text LIKE 'Offer %' THEN REPLACE(english_text, 'Offer ', 'Offri ')
    WHEN english_text LIKE 'Observe %' THEN REPLACE(english_text, 'Observe ', 'Osserva ')
    WHEN english_text LIKE 'Check %' THEN REPLACE(english_text, 'Check ', 'Controlla ')
    WHEN english_text LIKE 'Verify %' THEN REPLACE(english_text, 'Verify ', 'Verifica ')
    WHEN english_text LIKE 'Use %' THEN REPLACE(english_text, 'Use ', 'Usa ')
    WHEN english_text LIKE 'Make sure %' THEN REPLACE(english_text, 'Make sure ', 'Assicurati ')
    WHEN english_text LIKE 'Avoid %' THEN REPLACE(english_text, 'Avoid ', 'Evita ')
    WHEN english_text LIKE 'Reward %' THEN REPLACE(english_text, 'Reward ', 'Ricompensa ')
    WHEN english_text LIKE 'Document %' THEN REPLACE(english_text, 'Document ', 'Documenta ')
    WHEN english_text LIKE 'Increase %' THEN REPLACE(english_text, 'Increase ', 'Aumenta ')
    WHEN english_text LIKE 'Reduce %' THEN REPLACE(english_text, 'Reduce ', 'Riduci ')
    WHEN english_text LIKE 'Monitor %' THEN REPLACE(english_text, 'Monitor ', 'Monitora ')
    WHEN english_text LIKE 'Repeat %' THEN REPLACE(english_text, 'Repeat ', 'Ripeti ')
    WHEN english_text LIKE 'Create %' THEN REPLACE(english_text, 'Create ', 'Crea ')
    WHEN english_text LIKE 'Establish %' THEN REPLACE(english_text, 'Establish ', 'Stabilisci ')
    WHEN english_text LIKE 'Allow %' THEN REPLACE(english_text, 'Allow ', 'Permetti ')
    WHEN english_text LIKE 'Ignore %' THEN REPLACE(english_text, 'Ignore ', 'Ignora ')
    -- Body language phrases
    WHEN english_text LIKE 'BODY LANGUAGE: Observe %' THEN REPLACE(english_text, 'BODY LANGUAGE: Observe ', 'BODY LANGUAGE: Osserva ')
    WHEN english_text LIKE 'BODY LANGUAGE: Look for %' THEN REPLACE(english_text, 'BODY LANGUAGE: Look for ', 'BODY LANGUAGE: Cerca ')
    WHEN english_text LIKE 'BODY LANGUAGE: Assess %' THEN REPLACE(english_text, 'BODY LANGUAGE: Assess ', 'BODY LANGUAGE: Valuta ')
    ELSE english_text
  END;
END;
$$;

-- Reset all exercises back to Italian using the translation function
UPDATE ai_training_exercises 
SET instructions = ARRAY(
  SELECT translate_english_to_italian(unnest(instructions))
);

-- Additional word replacements back to Italian
UPDATE ai_training_exercises 
SET instructions = ARRAY(
  SELECT REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      element,
      'animal', 'animale'),
      'environment', 'ambiente'),
      'behavior', 'comportamento'),
      'training', 'allenamento'),
      'session', 'sessione'),
      'minutes', 'minuti'),
      'seconds', 'secondi'),
      'distance', 'distanza'),
      'calm', 'calma'),
      'stress', 'stress'),
      'reward', 'premio'),
      'treat', 'snack'),
      'game', 'gioco'),
      'relaxed', 'rilassato'),
      'quiet', 'tranquillo'),
      'safe', 'sicuro'),
      'gradually', 'gradualmente'),
      'immediately', 'immediatamente'),
      'constantly', 'costantemente'),
      'completely', 'completamente')
  FROM unnest(instructions) AS element
);