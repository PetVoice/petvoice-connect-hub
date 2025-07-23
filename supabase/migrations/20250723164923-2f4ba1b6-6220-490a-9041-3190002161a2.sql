-- RICREAZIONE ESERCIZI PER GLI ALTRI 9 PROTOCOLLI

WITH protocol_data AS (
  SELECT p.id, p.title, p.duration_days FROM ai_training_protocols p WHERE p.is_public = true AND p.title != 'Controllo Aggressività Reattiva'
)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  pd.id as protocol_id,
  generate_series(1, pd.duration_days) as day_number,
  CASE pd.title
    WHEN 'Gestione Ansia da Separazione' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Desensibilizzazione Graduale'
    WHEN 'Gestione Gelosia e Possessività' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Condivisione Risorse'
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Controllo Impulsi'
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Routine Relax'
    WHEN 'Riattivazione Energia e Motivazione' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Stimolazione Positiva'
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Abitudini Alimentari'
    WHEN 'Socializzazione Progressiva' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Interazione Sociale'
    WHEN 'Stop Comportamenti Distruttivi' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Redirezione Positiva'
    WHEN 'Superare Fobie e Paure Specifiche' THEN 'Esercizio Giorno ' || generate_series(1, pd.duration_days) || ' - Desensibilizzazione Fobie'
  END as title,
  CASE pd.title
    WHEN 'Gestione Ansia da Separazione' THEN 'Lavoro graduale per ridurre l\'ansia durante le separazioni con tecniche di desensibilizzazione progressive.'
    WHEN 'Gestione Gelosia e Possessività' THEN 'Tecniche per ridurre comportamenti possessivi e migliorare la condivisione delle risorse.'
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 'Esercizi mirati per migliorare autocontrollo e ridurre iperattività attraverso attività strutturate.'
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 'Routine per stabilire pattern di sonno salutari e ridurre disturbi notturni.'
    WHEN 'Riattivazione Energia e Motivazione' THEN 'Attività stimolanti per combattere apatia e risvegliare interesse e motivazione.'
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 'Correzione di comportamenti alimentari problematici attraverso tecniche graduali.'
    WHEN 'Socializzazione Progressiva' THEN 'Sviluppo di competenze sociali attraverso interazioni controllate e positive.'
    WHEN 'Stop Comportamenti Distruttivi' THEN 'Strategie per eliminare comportamenti distruttivi e reindirizzare energia positivamente.'
    WHEN 'Superare Fobie e Paure Specifiche' THEN 'Desensibilizzazione sistematica per superare fobie specifiche attraverso esposizione graduale.'
  END as description,
  CASE pd.title
    WHEN 'Gestione Ansia da Separazione' THEN 'behavioral'
    WHEN 'Gestione Gelosia e Possessività' THEN 'behavioral'
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 'behavioral'
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 'behavioral'
    WHEN 'Riattivazione Energia e Motivazione' THEN 'physical'
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 'behavioral'
    WHEN 'Socializzazione Progressiva' THEN 'behavioral'
    WHEN 'Stop Comportamenti Distruttivi' THEN 'behavioral'
    WHEN 'Superare Fobie e Paure Specifiche' THEN 'behavioral'
  END as exercise_type,
  CASE pd.title
    WHEN 'Gestione Ansia da Separazione' THEN 15
    WHEN 'Gestione Gelosia e Possessività' THEN 20
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 25
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 10
    WHEN 'Riattivazione Energia e Motivazione' THEN 20
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 15
    WHEN 'Socializzazione Progressiva' THEN 30
    WHEN 'Stop Comportamenti Distruttivi' THEN 25
    WHEN 'Superare Fobie e Paure Specifiche' THEN 20
  END as duration_minutes,
  CASE pd.title
    WHEN 'Gestione Ansia da Separazione' THEN 
      ARRAY['Iniziare con separazioni molto brevi (30 secondi)', 'Rimanere calmi e positivi durante le partenze', 'Utilizzare oggetti comfort per rassicurare', 'Aumentare gradualmente i tempi di separazione']
    WHEN 'Gestione Gelosia e Possessività' THEN 
      ARRAY['Praticare comandi di base per autocontrollo', 'Insegnare a condividere spazi e risorse', 'Premiare comportamenti non possessivi', 'Creare routine positive per la condivisione']
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 
      ARRAY['Esercizi di rilassamento e controllo respiratorio', 'Attività mentali per focalizzare l\'attenzione', 'Giochi strutturati per incanalare energia', 'Training di impulse control con rewards']
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 
      ARRAY['Stabilire routine pre-sonno rilassante', 'Creare ambiente ottimale per il riposo', 'Utilizzare musica o suoni calmanti', 'Mantenere orari regolari per sonno e veglia']
    WHEN 'Riattivazione Energia e Motivazione' THEN 
      ARRAY['Attività fisiche leggere e divertenti', 'Giochi stimolanti per risvegliare interesse', 'Interazioni sociali positive', 'Utilizzo di rinforzi motivazionali']
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 
      ARRAY['Stabilire orari fissi per i pasti', 'Utilizzare puzzle feeder per rallentare l\'alimentazione', 'Praticare autocontrollo durante i pasti', 'Creare associazioni positive con il cibo']
    WHEN 'Socializzazione Progressiva' THEN 
      ARRAY['Incontri controllati con persone familiari', 'Esposizione graduale a nuovi ambienti', 'Interazioni positive con altri animali', 'Rinforzo di comportamenti sociali appropriati']
    WHEN 'Stop Comportamenti Distruttivi' THEN 
      ARRAY['Identificare trigger dei comportamenti distruttivi', 'Fornire alternative appropriate per masticare/scavare', 'Reindirizzare energia verso attività positive', 'Aumentare stimolazione mentale e fisica']
    WHEN 'Superare Fobie e Paure Specifiche' THEN 
      ARRAY['Identificare con precisione i trigger della fobia', 'Esposizione molto graduale al trigger a distanza sicura', 'Associare il trigger con esperienze positive', 'Mantenere sempre controllo e possibilità di fuga']
  END as instructions,
  CASE pd.title
    WHEN 'Gestione Ansia da Separazione' THEN 
      ARRAY['comfort objects', 'timer', 'camera per monitoraggio', 'giocattoli puzzle']
    WHEN 'Gestione Gelosia e Possessività' THEN 
      ARRAY['ciotole multiple', 'snack high-value', 'giocattoli separati', 'barriere di sicurezza']
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 
      ARRAY['giocattoli puzzle', 'tappetino rilassante', 'clicker', 'snack per training']
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 
      ARRAY['cuccia comoda', 'luci soffuse', 'musica rilassante', 'coperte morbide']
    WHEN 'Riattivazione Energia e Motivazione' THEN 
      ARRAY['giocattoli stimolanti', 'snack speciali', 'puzzle alimentari', 'textures diverse']
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 
      ARRAY['puzzle feeder', 'ciotole anti-ingozzamento', 'timer pasti', 'snack training']
    WHEN 'Socializzazione Progressiva' THEN 
      ARRAY['guinzaglio lungo', 'snack premio', 'tappetino comfort', 'giocattoli sociali']
    WHEN 'Stop Comportamenti Distruttivi' THEN 
      ARRAY['giochi da masticare', 'spray amaro', 'puzzle feeder', 'giocattoli interattivi']
    WHEN 'Superare Fobie e Paure Specifiche' THEN 
      ARRAY['trigger controllato', 'snack alto valore', 'safe space', 'metro per distanze']
  END as materials
FROM protocol_data pd;

-- Aggiorna statistiche
UPDATE ai_training_protocols 
SET 
  success_rate = CASE title
    WHEN 'Gestione Ansia da Separazione' THEN 85
    WHEN 'Gestione Gelosia e Possessività' THEN 78
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 82
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 90
    WHEN 'Riattivazione Energia e Motivazione' THEN 88
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 75
    WHEN 'Socializzazione Progressiva' THEN 92
    WHEN 'Stop Comportamenti Distruttivi' THEN 80
    WHEN 'Superare Fobie e Paure Specifiche' THEN 73
    ELSE 85
  END,
  community_rating = CASE title
    WHEN 'Gestione Ansia da Separazione' THEN 8.5
    WHEN 'Gestione Gelosia e Possessività' THEN 7.8
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 8.2
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 9.0
    WHEN 'Riattivazione Energia e Motivazione' THEN 8.8
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 7.5
    WHEN 'Socializzazione Progressiva' THEN 9.2
    WHEN 'Stop Comportamenti Distruttivi' THEN 8.0
    WHEN 'Superare Fobie e Paure Specifiche' THEN 7.3
    ELSE 8.0
  END
WHERE is_public = true;

-- Log finale
SELECT 
  'PULIZIA COMPLETATA!' as status,
  COUNT(DISTINCT p.id) as protocolli_totali,
  COUNT(e.id) as esercizi_totali
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
WHERE p.is_public = true;