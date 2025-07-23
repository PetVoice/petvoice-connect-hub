-- Translate Italian instructions to English in ai_training_exercises
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Choose a quiet and familiar space for the animal',
  'Position the comfort mat in a safe corner',
  'Offer treat rewards when the animal approaches spontaneously',
  'Keep distance and let the animal explore freely',
  'Positively reinforce every calm and relaxed behavior',
  'BODY LANGUAGE: Observe relaxed posture, tail in neutral position',
  'BODY LANGUAGE: Look for regular breathing and relaxed ears',
  'BODY LANGUAGE: Avoid stress signals like panting or trembling'
]
WHERE title = 'Creazione Safe Space Personale';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Practice rapid withdrawal maneuver from trigger',
  'Test effectiveness of "away" command for immediate exit',
  'Verify leash and equipment are 100% secure',
  'Establish safe escape route in every training environment'
]
WHERE title = 'Emergency Safety Protocol';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Position yourself near a window or glass door',
  'Let the animal observe outside from their safe space',
  'Reward calm curiosity towards external stimuli',
  'Do not force approach, respect the animal timing',
  'Offer positive distractions if showing stress',
  'BODY LANGUAGE: Observe forward ears indicating interest',
  'BODY LANGUAGE: Look for balanced posture, not tense or rigid',
  'BODY LANGUAGE: Assess if animal approaches voluntarily'
]
WHERE title = 'Osservazione Passiva Ambiente';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Start with silent environment and soft lights',
  'Pet in down position on soft surface',
  'Systematic massage: start from head, descend gradually',
  'Synchronize massage with slow breathing',
  'Whisper "relax" and "calm" rhythmically',
  'Goal: 12 minutes of deep relaxation'
]
WHERE title = 'Guided Deep Relaxation';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Reinforce 7 out of 10 exposures instead of all',
  'Vary which exposure is not reinforced',
  'Observe if behavior remains stable',
  'Increase reward quality when given',
  'Maintain social reinforcement (praise) always',
  'Target: animal maintains calm even without immediate reward'
]
WHERE title = 'Strategic Intermittent Reinforcement';