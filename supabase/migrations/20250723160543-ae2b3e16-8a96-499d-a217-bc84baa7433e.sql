-- Reset protocol titles and descriptions back to Italian
UPDATE ai_training_protocols 
SET title = 'Socializzazione Progressiva'
WHERE title = 'Progressive Socialization';

UPDATE ai_training_protocols 
SET title = 'Controllo Aggressività Reattiva'
WHERE title = 'Reactive Aggression Control';

UPDATE ai_training_protocols 
SET title = 'Gestione Ansia da Separazione'
WHERE title = 'Separation Anxiety Management';

UPDATE ai_training_protocols 
SET title = 'Rieducazione Alimentare Comportamentale'
WHERE title = 'Behavioral Food Re-education';

UPDATE ai_training_protocols 
SET title = 'Ottimizzazione Ciclo Sonno-Veglia'
WHERE title = 'Sleep-Wake Cycle Optimization';

UPDATE ai_training_protocols 
SET title = 'Superare Fobie e Paure Specifiche'
WHERE title = 'Overcoming Specific Phobias and Fears';

UPDATE ai_training_protocols 
SET title = 'Stop Comportamenti Distruttivi'
WHERE title = 'Stop Destructive Behaviors';

UPDATE ai_training_protocols 
SET title = 'Gestione Gelosia e Possessività'
WHERE title = 'Jealousy and Possessiveness Management';

UPDATE ai_training_protocols 
SET title = 'Riattivazione Energia e Motivazione'
WHERE title = 'Energy and Motivation Reactivation';

UPDATE ai_training_protocols 
SET title = 'Gestione Iperattività e Deficit Attenzione'
WHERE title = 'Hyperactivity and Attention Deficit Management';

UPDATE ai_training_protocols 
SET title = 'Creazione Safe Space Personale'
WHERE title = 'Personal Safe Space Creation';

-- Reset protocol descriptions back to Italian  
UPDATE ai_training_protocols 
SET description = 'Protocollo di 5 giorni per migliorare le competenze sociali dell''animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.'
WHERE description LIKE '%5-day protocol to improve%';

UPDATE ai_training_protocols 
SET description = 'Protocollo avanzato per la gestione sicura dell''aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.'
WHERE description LIKE '%Advanced protocol for safe management%';

UPDATE ai_training_protocols 
SET description = 'Protocollo scientifico per ridurre l''ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.'
WHERE description LIKE '%Scientific protocol to reduce separation anxiety%';

UPDATE ai_training_protocols 
SET description = 'Protocollo intermedio per risolvere disturbi comportamentali legati all''alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.'
WHERE description LIKE '%Intermediate protocol to resolve behavioral disorders%';

UPDATE ai_training_protocols 
SET description = 'Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.'
WHERE description LIKE '%Specialized protocol to establish healthy sleep%';

UPDATE ai_training_protocols 
SET description = 'Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali.'
WHERE description LIKE '%Advanced systematic desensitization program%';

UPDATE ai_training_protocols 
SET description = 'Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.'
WHERE description LIKE '%Intensive protocol to eliminate destructive%';

UPDATE ai_training_protocols 
SET description = 'Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.'
WHERE description LIKE '%Specialized protocol to reduce possessive behaviors%';

UPDATE ai_training_protocols 
SET description = 'Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell''interesse sociale.'
WHERE description LIKE '%Gradual protocol to combat depression%';

UPDATE ai_training_protocols 
SET description = 'Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.'
WHERE description LIKE '%Complete protocol to reduce hyperactivity%';