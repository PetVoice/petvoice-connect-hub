-- Inserimento dei template per i protocolli di addestramento comportamentale

INSERT INTO public.ai_training_templates (
  name, description, category, duration_days, difficulty, template_data, is_active, popularity_score, success_rate
) VALUES
(
  'Gestione dell''Ansia',
  'Protocollo completo per ridurre l''ansia e lo stress negli animali domestici attraverso tecniche di rilassamento e desensibilizzazione progressiva.',
  'Comportamento',
  21,
  'intermedio',
  '{
    "target_behaviors": ["ansia", "stress", "nervosismo"],
    "exercises_per_day": 3,
    "total_exercises": 63,
    "phases": [
      {"name": "Costruzione delle Basi", "days": "1-7"},
      {"name": "Tecniche di Rilassamento", "days": "8-14"},
      {"name": "Desensibilizzazione", "days": "15-21"}
    ],
    "required_materials": ["tappetino", "snack calmanti", "musica rilassante", "feromoni calmanti"],
    "success_metrics": ["riduzione sintomi ansia", "maggiore calma", "comportamento rilassato"]
  }',
  true,
  85,
  0.82
),
(
  'Controllo dell''Aggressività',
  'Protocollo avanzato per gestire e ridurre comportamenti aggressivi attraverso tecniche di controllo degli impulsi e modificazione comportamentale.',
  'Comportamento',
  28,
  'avanzato',
  '{
    "target_behaviors": ["aggressività", "ringhio", "morso", "territorialità"],
    "exercises_per_day": 3,
    "total_exercises": 84,
    "phases": [
      {"name": "Valutazione e Sicurezza", "days": "1-7"},
      {"name": "Controllo Impulsi", "days": "8-14"},
      {"name": "Desensibilizzazione", "days": "15-21"},
      {"name": "Applicazione Pratica", "days": "22-28"}
    ],
    "required_materials": ["museruola sicura", "guinzaglio robusto", "snack alto valore", "barriere fisiche"],
    "success_metrics": ["riduzione episodi aggressivi", "controllo impulsi", "calma in situazioni trigger"]
  }',
  true,
  70,
  0.75
),
(
  'Obbedienza di Base',
  'Protocollo introduttivo per insegnare i comandi fondamentali e stabilire una comunicazione efficace con il proprio animale.',
  'Addestramento',
  14,
  'principiante',
  '{
    "target_behaviors": ["seduto", "resta", "vieni", "lascia", "terra"],
    "exercises_per_day": 3,
    "total_exercises": 42,
    "phases": [
      {"name": "Comandi Base", "days": "1-7"},
      {"name": "Consolidamento", "days": "8-14"}
    ],
    "required_materials": ["snack per addestramento", "guinzaglio", "clicker", "giocattoli"],
    "success_metrics": ["risposta ai comandi base", "attenzione migliorata", "obbedienza costante"]
  }',
  true,
  95,
  0.90
),
(
  'Ansia da Separazione',
  'Protocollo specializzato per ridurre l''ansia e i comportamenti distruttivi quando l''animale rimane solo.',
  'Comportamento',
  21,
  'intermedio',
  '{
    "target_behaviors": ["ansia separazione", "distruttività", "vocalizzazioni", "eliminazioni inappropriate"],
    "exercises_per_day": 3,
    "total_exercises": 63,
    "phases": [
      {"name": "Graduale Abituazione", "days": "1-7"},
      {"name": "Indipendenza Progressiva", "days": "8-14"},
      {"name": "Consolidamento", "days": "15-21"}
    ],
    "required_materials": ["giocattoli interattivi", "diffusore feromoni", "telecamera", "snack durevoli"],
    "success_metrics": ["calma durante assenze", "riduzione distruttività", "comportamento equilibrato"]
  }',
  true,
  80,
  0.78
),
(
  'Iperattività e Controllo Impulsi',
  'Protocollo per gestire l''iperattività e insegnare l''autocontrollo attraverso esercizi mirati e stimolazione mentale.',
  'Comportamento',
  18,
  'intermedio',
  '{
    "target_behaviors": ["iperattività", "impulsività", "saltare", "eccitazione eccessiva"],
    "exercises_per_day": 3,
    "total_exercises": 54,
    "phases": [
      {"name": "Calma di Base", "days": "1-6"},
      {"name": "Controllo Impulsi", "days": "7-12"},
      {"name": "Applicazione Pratica", "days": "13-18"}
    ],
    "required_materials": ["giocattoli puzzle", "tappetino", "snack", "ostacoli semplici"],
    "success_metrics": ["maggiore calma", "controllo impulsi", "attenzione prolungata"]
  }',
  true,
  88,
  0.85
),
(
  'Socializzazione',
  'Protocollo per migliorare le competenze sociali e la fiducia dell''animale verso persone, animali e ambienti nuovi.',
  'Socializzazione',
  16,
  'principiante',
  '{
    "target_behaviors": ["timidezza", "paura sociale", "aggressività sociale", "insicurezza"],
    "exercises_per_day": 3,
    "total_exercises": 48,
    "phases": [
      {"name": "Fiducia di Base", "days": "1-5"},
      {"name": "Interazioni Controllate", "days": "6-11"},
      {"name": "Socializzazione Attiva", "days": "12-16"}
    ],
    "required_materials": ["guinzaglio lungo", "snack premio", "giocattoli sociali", "trasportino confortevole"],
    "success_metrics": ["maggiore fiducia", "interazioni positive", "calma in gruppo"]
  }',
  true,
  92,
  0.87
),
(
  'Gestione delle Paure',
  'Protocollo avanzato per aiutare animali con fobie specifiche attraverso desensibilizzazione sistematica e controemozione.',
  'Comportamento',
  25,
  'avanzato',
  '{
    "target_behaviors": ["fobie", "paure intense", "comportamento di fuga", "reazioni eccessive"],
    "exercises_per_day": 3,
    "total_exercises": 75,
    "phases": [
      {"name": "Identificazione Trigger", "days": "1-6"},
      {"name": "Desensibilizzazione", "days": "7-15"},
      {"name": "Controemozione", "days": "16-20"},
      {"name": "Consolidamento", "days": "21-25"}
    ],
    "required_materials": ["registrazioni audio", "stimoli graduali", "snack alto valore", "spazio sicuro"],
    "success_metrics": ["riduzione reazioni paura", "maggiore tolleranza", "comportamento equilibrato"]
  }',
  true,
  75,
  0.73
),
(
  'Comportamenti Distruttivi',
  'Protocollo per eliminare masticazione inappropriata, scavo e altri comportamenti distruttivi attraverso reindirizzamento e arricchimento.',
  'Comportamento',
  20,
  'intermedio',
  '{
    "target_behaviors": ["masticazione", "scavo", "graffio", "distruttività generale"],
    "exercises_per_day": 3,
    "total_exercises": 60,
    "phases": [
      {"name": "Reindirizzamento", "days": "1-7"},
      {"name": "Arricchimento Ambientale", "days": "8-14"},
      {"name": "Consolidamento", "days": "15-20"}
    ],
    "required_materials": ["giocattoli masticabili", "puzzle alimentari", "spray repellenti", "zone dedicate"],
    "success_metrics": ["riduzione distruttività", "uso appropriato giocattoli", "comportamento canalizzato"]
  }',
  true,
  83,
  0.81
),
(
  'Addestramento al Guinzaglio',
  'Protocollo base per insegnare a camminare correttamente al guinzaglio senza tirare e con attenzione al conduttore.',
  'Addestramento',
  12,
  'principiante',
  '{
    "target_behaviors": ["tirare guinzaglio", "distrazione", "andatura irregolare", "mancanza attenzione"],
    "exercises_per_day": 3,
    "total_exercises": 36,
    "phases": [
      {"name": "Abituazione Guinzaglio", "days": "1-4"},
      {"name": "Camminata Base", "days": "5-8"},
      {"name": "Perfezionamento", "days": "9-12"}
    ],
    "required_materials": ["guinzaglio anti-tiro", "pettorina", "snack", "clicker"],
    "success_metrics": ["camminata senza tirare", "attenzione al conduttore", "risposte ai comandi"]
  }',
  true,
  90,
  0.88
),
(
  'Controllo dell''Abbaio',
  'Protocollo per ridurre abbaio eccessivo e insegnare il comando silenzio attraverso tecniche di controllo vocale.',
  'Comportamento',
  15,
  'intermedio',
  '{
    "target_behaviors": ["abbaio eccessivo", "vocalizzazioni", "reattività sonora", "territorialità"],
    "exercises_per_day": 3,
    "total_exercises": 45,
    "phases": [
      {"name": "Controllo Base", "days": "1-5"},
      {"name": "Comando Silenzio", "days": "6-10"},
      {"name": "Applicazione Pratica", "days": "11-15"}
    ],
    "required_materials": ["clicker", "snack alto valore", "suoni trigger", "barriere visive"],
    "success_metrics": ["riduzione abbaio", "risposta comando silenzio", "autocontrollo migliorato"]
  }',
  true,
  85,
  0.83
);