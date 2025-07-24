-- Aggiorna le descrizioni degli esercizi che hanno ancora descrizioni generiche

UPDATE ai_training_exercises 
SET description = 'Valuta e testa gradualmente l''autonomia del pet riducendo progressivamente il supporto umano mentre si mantiene l''osservazione a distanza di sicurezza.'
WHERE title = 'Test di Autonomia Graduale';

UPDATE ai_training_exercises 
SET description = 'Consolida e rinforza tutte le routine apprese durante il protocollo, creando automatismi stabili per il mantenimento a lungo termine.'
WHERE title = 'Consolidamento Routine';