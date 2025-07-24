-- Aggiorna TUTTI gli esercizi di TUTTI i protocolli per aggiungere tips, success_criteria e objectives

-- Prima, aggiorniamo tutti gli esercizi che non hanno tips
UPDATE public.ai_training_exercises 
SET 
  tips = CASE 
    WHEN title ILIKE '%relax%' OR title ILIKE '%calm%' OR title ILIKE '%tranquill%' THEN 
      ARRAY[
        'Mantieni un ambiente calmo e privo di distrazioni',
        'Usa la tua voce in tono rassicurante e rilassato',
        'Rispetta sempre i tempi del pet senza forzare',
        'Osserva i segnali di stress e adatta l''intensità di conseguenza'
      ]
    WHEN title ILIKE '%concentra%' OR title ILIKE '%focus%' OR title ILIKE '%attenz%' THEN
      ARRAY[
        'Inizia con sessioni molto brevi e aumenta gradualmente',
        'Elimina tutte le distrazioni dall''ambiente',
        'Premia immediatamente ogni momento di attenzione',
        'Mantieni le aspettative realistiche per l''età e capacità del pet'
      ]
    WHEN title ILIKE '%gioco%' OR title ILIKE '%attiv%' OR title ILIKE '%esercizio%' THEN
      ARRAY[
        'Mantieni l''attività strutturata e con regole chiare',
        'Termina sempre l''esercizio con il pet in stato calmo',
        'Adatta l''intensità al livello di energia del pet',
        'Usa rinforzi positivi per incoraggiare la partecipazione'
      ]
    WHEN title ILIKE '%social%' OR title ILIKE '%inter%' THEN
      ARRAY[
        'Inizia con interazioni brevi e controllate',
        'Scegli partner sociali calmi e ben equilibrati',
        'Supervisiona sempre le interazioni',
        'Termina prima che ci sia sovrastimolazione'
      ]
    WHEN title ILIKE '%respir%' OR title ILIKE '%breathing%' THEN
      ARRAY[
        'Respira tu stesso in modo visibile e profondo',
        'Mantieni una postura rilassata e aperta',
        'Sincronizza il tuo ritmo con quello del pet',
        'Crea un''atmosfera di calma e presenza'
      ]
    WHEN title ILIKE '%massag%' OR title ILIKE '%tocco%' OR title ILIKE '%contact%' THEN
      ARRAY[
        'Inizia sempre con tocchi leggeri e aumenta gradualmente',
        'Rispetta le zone che il pet preferisce evitare',
        'Fermati immediatamente se mostra disagio',
        'Usa movimenti lenti e costanti'
      ]
    WHEN title ILIKE '%ambient%' OR title ILIKE '%spaz%' OR title ILIKE '%environment%' THEN
      ARRAY[
        'Mantieni l''ambiente sempre pulito e ordinato',
        'Controlla temperatura, illuminazione e rumore',
        'Evita cambiamenti improvvisi nell''ambiente',
        'Crea zone sicure dove il pet può ritirarsi'
      ]
    WHEN title ILIKE '%routine%' OR title ILIKE '%abitud%' THEN
      ARRAY[
        'Mantieni orari costanti per creare prevedibilità',
        'Usa sempre la stessa sequenza di azioni',
        'Introduce cambiamenti molto gradualmente',
        'Crea segnali chiari per inizio e fine attività'
      ]
    ELSE
      ARRAY[
        'Mantieni sessioni brevi e positive',
        'Osserva sempre le reazioni del pet',
        'Usa rinforzi positivi per ogni progresso',
        'Adatta l''approccio alle esigenze individuali'
      ]
  END,
  
  success_criteria = CASE 
    WHEN title ILIKE '%relax%' OR title ILIKE '%calm%' OR title ILIKE '%tranquill%' THEN 
      ARRAY[
        'Il pet mostra segni visibili di rilassamento fisico',
        'Riduzione di comportamenti di stress o agitazione',
        'Il pet rimane volontariamente nell''area di calma',
        'Miglioramento generale del benessere emotivo'
      ]
    WHEN title ILIKE '%concentra%' OR title ILIKE '%focus%' OR title ILIKE '%attenz%' THEN
      ARRAY[
        'Il pet mantiene l''attenzione per periodi crescenti',
        'Riduzione della distraibilità durante l''esercizio',
        'Capacità di rispondere ai comandi di attenzione',
        'Miglioramento del controllo degli impulsi'
      ]
    WHEN title ILIKE '%gioco%' OR title ILIKE '%attiv%' OR title ILIKE '%esercizio%' THEN
      ARRAY[
        'Il pet partecipa attivamente senza sovraeccitazione',
        'Capacità di seguire le regole dell''attività',
        'Il pet si calma rapidamente al termine dell''esercizio',
        'Miglioramento dell''autocontrollo durante il gioco'
      ]
    WHEN title ILIKE '%social%' OR title ILIKE '%inter%' THEN
      ARRAY[
        'Il pet mantiene comportamenti calmi durante le interazioni',
        'Riduzione di reazioni aggressive o ansiose',
        'Il pet cerca spontaneamente interazioni positive',
        'Miglioramento delle competenze sociali'
      ]
    WHEN title ILIKE '%respir%' OR title ILIKE '%breathing%' THEN
      ARRAY[
        'Il pet sincronizza il ritmo respiratorio',
        'Visibile rallentamento della respirazione',
        'Riduzione dell''ansimare eccessivo',
        'Il pet mantiene posizione rilassata durante l''esercizio'
      ]
    WHEN title ILIKE '%massag%' OR title ILIKE '%tocco%' OR title ILIKE '%contact%' THEN
      ARRAY[
        'Il pet si rilassa visibilmente sotto il tocco',
        'Riduzione della tensione muscolare',
        'Il pet cerca attivamente il contatto fisico',
        'Diminuzione dei livelli di stress corporeo'
      ]
    WHEN title ILIKE '%ambient%' OR title ILIKE '%spaz%' OR title ILIKE '%environment%' THEN
      ARRAY[
        'Il pet utilizza spontaneamente lo spazio preparato',
        'Riduzione di comportamenti di ricerca di rifugio',
        'Il pet mostra comportamenti di comfort nell''ambiente',
        'Miglioramento generale del senso di sicurezza'
      ]
    WHEN title ILIKE '%routine%' OR title ILIKE '%abitud%' THEN
      ARRAY[
        'Il pet anticipa e si prepara per le routine',
        'Riduzione dell''ansia prima delle attività programmate',
        'Il pet mostra comportamenti più calmi durante i cambiamenti',
        'Miglioramento dell''adattabilità attraverso la prevedibilità'
      ]
    ELSE
      ARRAY[
        'Il pet mostra progresso visibile nell''obiettivo specifico',
        'Riduzione di comportamenti problematici correlati',
        'Miglioramento del benessere generale',
        'Il pet generalizza i comportamenti appresi'
      ]
  END,
  
  objectives = CASE 
    WHEN title ILIKE '%relax%' OR title ILIKE '%calm%' OR title ILIKE '%tranquill%' THEN 
      ARRAY[
        'Insegnare tecniche di autoregolazione e rilassamento',
        'Ridurre l''attivazione del sistema nervoso',
        'Creare associazioni positive con stati di calma',
        'Sviluppare strategie di coping per situazioni stressanti'
      ]
    WHEN title ILIKE '%concentra%' OR title ILIKE '%focus%' OR title ILIKE '%attenz%' THEN
      ARRAY[
        'Sviluppare capacità di attenzione focalizzata',
        'Migliorare il controllo degli impulsi',
        'Ridurre la distraibilità e l''iperattivazione',
        'Creare una base per ulteriori addestramenti'
      ]
    WHEN title ILIKE '%gioco%' OR title ILIKE '%attiv%' OR title ILIKE '%esercizio%' THEN
      ARRAY[
        'Canalizzare l''energia in attività positive e strutturate',
        'Insegnare autocontrollo attraverso regole di gioco',
        'Fornire stimolazione mentale e fisica appropriata',
        'Rafforzare il legame attraverso interazioni positive'
      ]
    WHEN title ILIKE '%social%' OR title ILIKE '%inter%' THEN
      ARRAY[
        'Sviluppare competenze sociali appropriate',
        'Ridurre l''ansia sociale attraverso esposizione graduale',
        'Insegnare comportamenti appropriati nelle interazioni',
        'Costruire fiducia nelle relazioni sociali'
      ]
    WHEN title ILIKE '%respir%' OR title ILIKE '%breathing%' THEN
      ARRAY[
        'Sincronizzare i ritmi fisiologici per promuovere calma',
        'Insegnare tecniche di autoregolazione respiratoria',
        'Rafforzare il legame attraverso la sincronizzazione',
        'Ridurre l''attivazione del sistema nervoso simpatico'
      ]
    WHEN title ILIKE '%massag%' OR title ILIKE '%tocco%' OR title ILIKE '%contact%' THEN
      ARRAY[
        'Rilasciare tensione muscolare attraverso tocco terapeutico',
        'Aumentare produzione di endorfine e ossitocina',
        'Rafforzare il legame attraverso contatto fisico positivo',
        'Creare associazioni positive con il tocco umano'
      ]
    WHEN title ILIKE '%ambient%' OR title ILIKE '%spaz%' OR title ILIKE '%environment%' THEN
      ARRAY[
        'Creare un ambiente che promuova sicurezza e calma',
        'Ridurre fattori ambientali che causano stress',
        'Stabilire associazioni positive con lo spazio',
        'Fornire rifugi sicuri per l''autoregolazione'
      ]
    WHEN title ILIKE '%routine%' OR title ILIKE '%abitud%' THEN
      ARRAY[
        'Creare sicurezza attraverso prevedibilità',
        'Ridurre ansia legata a incertezza e cambiamenti',
        'Stabilire schemi comportamentali stabili',
        'Migliorare adattamento attraverso routine familiari'
      ]
    ELSE
      ARRAY[
        'Raggiungere l''obiettivo specifico dell''esercizio',
        'Migliorare il benessere generale del pet',
        'Sviluppare competenze trasferibili',
        'Rafforzare la relazione umano-animale'
      ]
  END

WHERE (tips IS NULL OR array_length(tips, 1) IS NULL OR array_length(tips, 1) = 0)
   OR (success_criteria IS NULL OR array_length(success_criteria, 1) IS NULL OR array_length(success_criteria, 1) = 0)
   OR (objectives IS NULL OR array_length(objectives, 1) IS NULL OR array_length(objectives, 1) = 0);