-- Translate all remaining Italian instructions to English in ai_training_exercises

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Start from 8% volume if previous day ok at 5%',
  'Increase 2-3% only if animal remains calm',
  'If showing stress, reduce to previous level',
  'Keep exposures brief (3-5 seconds)',
  'Reward immediately every success',
  'Document maximum volume reached'
]
WHERE title = 'Gradual Audio Intensity Scale';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Ask a family member to stay at visible but non-threatening distance',
  'Person must completely ignore the animal initially',
  'Offer treat rewards when animal notices presence without stress',
  'Maintain distance until animal shows curiosity',
  'Person can gradually make slow and predictable movements',
  'BODY LANGUAGE: Look for curiosity instead of fear or aggression',
  'BODY LANGUAGE: Observe if animal orients toward person',
  'BODY LANGUAGE: Assess muscle tension - should decrease'
]
WHERE title = 'Human Presence Introduction at Distance';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Choose specific time of day (e.g. after dinner)',
  'Create sequence of 3 pleasant activities',
  'Include: special snack, cuddles, favorite game',
  'Always maintain the same sequence',
  'Make the moment predictable and anticipated',
  'Observe if animal starts to anticipate',
  'Celebrate the establishment of routine'
]
WHERE title = 'Morning Positive Routine';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Organize small group (2-3 people/animals) in controlled space',
  'All participants must be calm and well-socialized',
  'Keep activities simple like group walk or sit together',
  'Reward appropriate and calm social behaviors',
  'Constantly monitor stress levels of all participants',
  'BODY LANGUAGE: Observe ability to relax in group',
  'BODY LANGUAGE: Look for spontaneous positive interactions',
  'BODY LANGUAGE: Assess overstimulation and adapt accordingly'
]
WHERE title = 'Supervised Group Activity';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Place appetizing food in sight but out of reach',
  'Require 30 seconds of calm before access',
  'Gradually increase waiting time',
  'Use high-value treats as reward'
]
WHERE title = 'Temptation Resistance Training';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Use 3 different food puzzles simultaneously',
  'Distribute daily meal among puzzles',
  'Position puzzles at different heights and distances',
  'Do not help: let pet solve autonomously',
  'Observe for safety but intervene only if necessary',
  'Time limit: 15 minutes to complete all puzzles'
]
WHERE title = 'Complex Food Puzzle';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Sit next to in relaxed position',
  'Breathe slowly and deeply audibly',
  'Count mentally: 4 seconds inhalation, 6 seconds exhalation',
  'Keep rhythm constant throughout session',
  'Speak softly only if necessary to reassure'
]
WHERE title = 'Breathing Harmony Technique';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Immediately after intense exercise, bring pet to mat',
  'Start with deep breaths and calm voice',
  'Gently massage shoulders and neck for 3 minutes',
  'Use "relax" and "calm" commands with whispered voice',
  'Keep environment silent and lights soft',
  'Goal: achieve relaxed down position for 3 minutes'
]
WHERE title = 'Post-Exercise Relaxation';