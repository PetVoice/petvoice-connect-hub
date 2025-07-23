-- Aggiorna tutti gli esercizi "Confidence Building con Handler" con traduzioni inglesi
UPDATE ai_training_exercises 
SET 
  description = 'Strengthen the bond with the owner through positive activities that increase confidence. Essential foundation for extending socialization to others.',
  instructions = ARRAY[
    'Start with simple commands that the animal knows well',
    'Immediately reward every success with treats and praise', 
    'Gradually introduce small positive novelties (new toy)',
    'Always maintain a calm and encouraging tone of voice',
    'Always end with a success and positive reinforcement',
    'BODY LANGUAGE: Look for voluntary eye contact and spontaneous approach',
    'BODY LANGUAGE: Observe tail wagging in a relaxed manner',
    'BODY LANGUAGE: Notice open posture and willingness to interact'
  ],
  materials = ARRAY[
    'reward treats',
    'new toy', 
    'calm voice'
  ]
WHERE title = 'Confidence Building con Handler';