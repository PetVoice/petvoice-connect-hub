-- Aggiorno le istruzioni degli esercizi con più dettagli per ogni punto

-- PROTOCOLLO 1: Gestione Iperattività e Deficit Attenzione - Istruzioni dettagliate
UPDATE ai_training_exercises 
SET instructions = CASE 
  WHEN title = 'Focus e Attenzione Base' THEN ARRAY[
    '1. POSIZIONAMENTO: Metti il cane in posizione seduta davanti a te, a circa 1 metro di distanza. Mantieni una postura rilassata e sicura.',
    '2. CONTATTO VISIVO: Chiama il nome del cane e aspetta che ti guardi. Quando stabilisce il contatto visivo, conta mentalmente "uno-due-tre".',
    '3. RINFORZO IMMEDIATO: Nel momento esatto in cui completa i 3 secondi di contatto visivo, dai il comando "BRAVO!" e premia immediatamente con un bocconcino di alto valore.',
    '4. RIPETIZIONE STRUTTURATA: Ripeti l''esercizio per esattamente 10 volte, con pause di 30 secondi tra ogni ripetizione per evitare stress.',
    '5. MONITORAGGIO: Se il cane perde concentrazione prima dei 3 secondi, ricomincia senza premiare. Se fallisce 3 volte consecutive, fai una pausa di 5 minuti.'
  ]
  
  WHEN title = 'Canalizzazione Energia Positiva' THEN ARRAY[
    '1. SETUP PERCORSO: Crea un percorso con 3-4 ostacoli bassi (15-20cm) distanziati di 2 metri l''uno dall''altro. Usa coni o bastoni come delimitatori.',
    '2. GUIDA INIZIALE: Conduci il cane al guinzaglio attraverso il percorso camminando lentamente. Incoraggia con voce allegra ma non eccitata.',
    '3. SEQUENZA SALTO-SOSTA: Ad ogni ostacolo, fai saltare il cane poi fermatevi per 10 secondi in posizione seduta prima di procedere.',
    '4. RINFORZO DELLA CALMA: Premia SOLO quando il cane è calmo nella posizione di sosta. Ignora completamente comportamenti eccitati.',
    '5. SESSIONI FRAMMENTATE: Ripeti per 3 sessioni da 5 minuti ciascuna, con pause di 10 minuti tra una sessione e l''altra per recupero.'
  ]
  
  WHEN title = 'Controllo Impulsi - Cibo' THEN ARRAY[
    '1. PREPARAZIONE: Tieni un premio appetitoso (wurstel, formaggio) nella mano chiusa, alla vista del cane ma irraggiungibile.',
    '2. TENTAZIONE CONTROLLATA: Mostra il premio al cane senza darglielo. Se salta, abbaia o cerca di prenderlo, allontana la mano e girati.',
    '3. ASPETTATIVA: Aspetta che il cane si calmi naturalmente (seduto o in piedi ma fermo). Questo può richiedere 30 secondi o più inizialmente.',
    '4. TIMING DEL PREMIO: Premia SOLO quando il cane è completamente calmo per almeno 5 secondi. Il timing è cruciale per l''apprendimento.',
    '5. PROGRESSIONE: Aumenta gradualmente il tempo di attesa di 5 secondi ogni giorno fino a raggiungere 30 secondi di autocontrollo.'
  ]
  
  WHEN title = 'Rilassamento Guidato' THEN ARRAY[
    '1. AMBIENTE PREPARATO: Scegli uno spazio tranquillo, metti un tappetino morbido per terra e avvia musica rilassante a volume basso.',
    '2. POSIZIONE DOWN: Guida il cane sul tappetino e dai il comando "TERRA" con voce calma e profonda. Aspetta che si sdrai completamente.',
    '3. COMANDO RELAX: Introduci il nuovo comando "RELAX" con voce ancora più bassa e rilassata mentre il cane è già in posizione down.',
    '4. MASSAGGIO GUIDATO: Inizia con carezze lente sulla testa, poi scendi verso il collo e le spalle con movimenti circolari delicati.',
    '5. RINFORZO VERBALE: Durante il massaggio, ripeti dolcemente "bravo, relax" ogni 30 secondi per associare il comando alla sensazione di calma.'
  ]
  
  WHEN title = 'Focus Avanzato con Distrazioni' THEN ARRAY[
    '1. BASELINE: Inizia ripetendo l''esercizio di focus base senza distrazioni per stabilire una performance di riferimento.',
    '2. DISTRAZIONE LEGGERA: Introduce un rumore lieve (foglio di carta, battito di mani) a 3 metri di distanza durante l''esercizio.',
    '3. MANTENIMENTO FOCUS: Il cane deve mantenere il contatto visivo per 3 secondi nonostante la distrazione. Se si gira, ricomincia.',
    '4. INCREMENTO GRADUALE: Aumenta l''intensità delle distrazioni solo se il cane riesce nell''80% dei tentativi al livello corrente.',
    '5. LIMITE TENTATIVI: Non superare mai 3 tentativi consecutivi falliti. Se accade, torna al livello precedente di distrazione.'
  ]
  
  ELSE instructions
END
WHERE title IN ('Focus e Attenzione Base', 'Canalizzazione Energia Positiva', 'Controllo Impulsi - Cibo', 'Rilassamento Guidato', 'Focus Avanzato con Distrazioni');