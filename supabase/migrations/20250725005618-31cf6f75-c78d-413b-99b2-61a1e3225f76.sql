-- Aggiorna protocolli con obiettivi, criteri di successo e consigli pratici univoci

-- Protocollo: Gestione dell'Ansia
UPDATE ai_training_protocols 
SET triggers = jsonb_build_object(
  'objectives', ARRAY[
    'Ridurre significativamente episodi di ansia e stress comportamentale',
    'Sviluppare tecniche di autoregolazione emotiva nell''animale',
    'Creare ambiente domestico sicuro e prevedibile per il benessere psicologico'
  ],
  'success_criteria', ARRAY[
    'Diminuzione del 70% di comportamenti ansiosi osservabili in 21 giorni',
    'Capacità di autorilassamento in zona rifugio entro 5 minuti da stimolo stressante',
    'Mantenimento calma durante situazioni scatenanti precedentemente problematiche'
  ],
  'tips', ARRAY[
    'Crea routine quotidiana fissa per dare sicurezza e prevedibilità all''animale',
    'Evita di consolare eccessivamente durante episodi ansiosi - rinforzeresti il comportamento',
    'Utilizza tecniche di desensibilizzazione graduale piuttosto che esposizione intensa'
  ]
)
WHERE title = 'Gestione dell''Ansia';

-- Protocollo: Controllo dell'Aggressività  
UPDATE ai_training_protocols 
SET triggers = jsonb_build_object(
  'objectives', ARRAY[
    'Eliminare comportamenti aggressivi reattivi e predatori attraverso riabilitazione comportamentale',
    'Ristabilire comunicazione sicura tra animale e famiglia umana',
    'Implementare protocolli di gestione preventiva per evitare ricadute'
  ],
  'success_criteria', ARRAY[
    'Cessazione completa di episodi aggressivi verso persone/animali per 30 giorni consecutivi',
    'Risposta immediata a comandi di interruzione "stop" e "calma" in situazioni di tensione',
    'Capacità di autocontrollo durante stimoli scatenanti con supervisione minima'
  ],
  'tips', ARRAY[
    'Mai punire fisicamente comportamenti aggressivi - aumenta reattività e paura',
    'Identifica sempre trigger specifici prima di iniziare lavoro di modificazione comportamentale',
    'Coinvolgi tutti i membri famiglia nell''applicazione coerente del protocollo'
  ]
)
WHERE title = 'Controllo dell''Aggressività';

-- Protocollo: Controllo dell'Iperattività
UPDATE ai_training_protocols 
SET triggers = jsonb_build_object(
  'objectives', ARRAY[
    'Canalizzare energia fisica eccessiva in attività strutturate e produttive',
    'Sviluppare capacità di concentrazione e attenzione sostenuta nell''animale',
    'Stabilire equilibrio tra stimolazione mentale e rilassamento quotidiano'
  ],
  'success_criteria', ARRAY[
    'Capacità di rimanere calmo e concentrato per 15 minuti durante esercizi mentali',
    'Riduzione del 60% di comportamenti distruttivi legati a iperattivazione',
    'Esecuzione fluida di sequenze di comandi anche in presenza di distrazioni moderate'
  ],
  'tips', ARRAY[
    'Aumenta stimolazione mentale prima di quella fisica - cervello stanco è più gestibile',
    'Stabilisci momenti di calma obbligatori dopo ogni sessione di gioco intenso',
    'Usa puzzle alimentari e giochi cognitivi per consumare energia mentale in eccesso'
  ]
)
WHERE title = 'Controllo dell''Iperattività';