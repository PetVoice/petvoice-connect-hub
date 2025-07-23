-- Reset exercise titles back to Italian
UPDATE ai_training_exercises 
SET title = 'Controllo Eccitazione Sociale'
WHERE title = 'Social Excitement Control';

UPDATE ai_training_exercises 
SET title = 'Anticipazione Positiva'
WHERE title = 'Positive Anticipation';

UPDATE ai_training_exercises 
SET title = 'Incontro Controllato'
WHERE title = 'Controlled Meet-and-Greet';

UPDATE ai_training_exercises 
SET title = 'Rilassamento Profondo Guidato'
WHERE title = 'Guided Deep Relaxation';

UPDATE ai_training_exercises 
SET title = 'Rinforzo Intermittente Strategico'
WHERE title = 'Strategic Intermittent Reinforcement';

UPDATE ai_training_exercises 
SET title = 'Scala Intensità Audio Graduale'
WHERE title = 'Gradual Audio Intensity Scale';

UPDATE ai_training_exercises 
SET title = 'Introduzione Presenza Umana a Distanza'
WHERE title = 'Human Presence Introduction at Distance';

UPDATE ai_training_exercises 
SET title = 'Routine Positiva Mattutina'
WHERE title = 'Morning Positive Routine';

UPDATE ai_training_exercises 
SET title = 'Attività di Gruppo Supervisionata'
WHERE title = 'Supervised Group Activity';

UPDATE ai_training_exercises 
SET title = 'Training Resistenza alla Tentazione'
WHERE title = 'Temptation Resistance Training';

UPDATE ai_training_exercises 
SET title = 'Puzzle Alimentare Complesso'
WHERE title = 'Complex Food Puzzle';

UPDATE ai_training_exercises 
SET title = 'Tecnica Armonia Respiratoria'
WHERE title = 'Breathing Harmony Technique';

UPDATE ai_training_exercises 
SET title = 'Rilassamento Post-Esercizio'
WHERE title = 'Post-Exercise Relaxation';

UPDATE ai_training_exercises 
SET title = 'Protocollo Sicurezza Emergenza'
WHERE title = 'Emergency Safety Protocol';

-- Reset exercise descriptions to Italian
UPDATE ai_training_exercises 
SET description = 'Gestione iperattività in presenza di nuove persone'
WHERE description = 'Managing hyperactivity in presence of new people';

UPDATE ai_training_exercises 
SET description = 'Sviluppo di eccitazione positiva alla presentazione del trigger invece che paura'
WHERE description = 'Development of positive excitement at trigger presentation instead of fear';

UPDATE ai_training_exercises 
SET description = 'Primo incontro diretto con persona sconosciuta seguendo protocolli precisi per garantire esperienza positiva e costruire fiducia sociale.'
WHERE description = 'First direct encounter with unknown person following precise protocols to ensure positive experience and build social confidence.';

UPDATE ai_training_exercises 
SET description = 'Sessione di rilassamento profondo con massaggio terapeutico e controllo respiratorio'
WHERE description LIKE 'Deep relaxation session with therapeutic massage%' OR description LIKE '%massage and breathing control%';

UPDATE ai_training_exercises 
SET description = 'Rinforzo strategico non costante per consolidare comportamenti appresi'
WHERE description LIKE 'Strategic non-constant reinforcement%' OR description LIKE '%consolidate learned behaviors%';

UPDATE ai_training_exercises 
SET description = 'Esposizione graduale a stimoli sonori con aumento controllato dell''intensità'
WHERE description LIKE 'Gradual exposure to sound stimuli%' OR description LIKE '%controlled intensity increase%';