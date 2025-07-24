-- Aggiorna tutti gli esercizi di "Superare la Paura" con istruzioni dettagliate punto per punto

-- 1. Presenza Rassicurante
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. POSIZIONAMENTO: Siediti sul pavimento ad almeno 2 metri dal pet, evitando di guardarlo direttamente per non creare pressione.',
    '2. CONTROLLO VOCE: Parla con voce bassa e monotona, racconta qualcosa di neutro come cosa hai fatto oggi, evita toni eccitati.',
    '3. GESTIONE MOVIMENTI: Muoviti molto lentamente, ogni gesto deve essere prevedibile e mai improvviso o brusco.',
    '4. RISPETTO SPAZI: Se il pet si avvicina spontaneamente, rimani immobile e lascialo annusare senza forzare il contatto.',
    '5. PREMI PASSIVI: Quando noti segni di rilassamento (sospiri, sdraiata), lancia delicatamente un premio senza dire nulla.',
    '6. DURATA SESSIONE: Mantieni questa presenza per 10-15 minuti, non forzare oltre se vedi segni di stress.',
    '7. FINE GRADUALE: Alzati lentamente e allontanati senza cerimonie, lasciando che associ la tua presenza alla calma.'
  ],
  description = 'Tecnica fondamentale per trasmettere sicurezza attraverso la presenza calma e non invasiva, base per tutti gli altri esercizi.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Presenza Rassicurante';

-- 2. Ambiente Sicuro
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SCELTA STANZA: Identifica la stanza più tranquilla della casa, preferibilmente quella dove il pet già trascorre tempo volentieri.',
    '2. ELIMINAZIONE RUMORI: Chiudi finestre verso strada, spegni televisori, elettrodomestici rumorosi e campanelli.',
    '3. OGGETTI FAMILIARI: Posiziona la coperta preferita, giocattoli che ama, e la ciotola dell''acqua in punti strategici.',
    '4. ILLUMINAZIONE SOFT: Usa luce soffusa, evita luci troppo forti o lampeggianti che potrebbero creare ansia.',
    '5. VIE DI FUGA: Assicurati che ci siano sempre almeno due uscite accessibili, mai bloccare l''unica via d''uscita.',
    '6. TEMPERATURA IDEALE: Mantieni temperatura confortevole (22-24°C), evita correnti d''aria o calore eccessivo.',
    '7. MONITORAGGIO: Osserva dove si posiziona spontaneamente e rinforza quello spazio come "zona sicura" definitiva.'
  ],
  description = 'Creazione di un rifugio sicuro dove il pet può rilassarsi completamente, prerequisito essenziale per ogni lavoro sulla paura.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Ambiente Sicuro';

-- 3. Esposizione Minima
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. IDENTIFICAZIONE TRIGGER: Definisci esattamente quale stimolo provoca paura (rumore, oggetto, persona, situazione).',
    '2. VERSIONE ATTENUATA: Riduci l''intensità del trigger al 10% (volume bassissimo, distanza massima, versione miniaturizzata).',
    '3. POSIZIONE STRATEGICA: Posiziona il pet nella zona sicura, tu tra lui e il trigger per fare da "scudo protettivo".',
    '4. PRESENTAZIONE BREVISSIMA: Esponi al trigger per massimo 2-3 secondi, poi rimuovi immediatamente.',
    '5. LETTURA SEGNALI: Osserva orecchie, coda, postura - se vedi irrigidimento STOP immediato.',
    '6. PREMIO TEMPESTIVO: Se rimane calmo anche solo 1 secondo, premio immediato con qualcosa di eccezionale.',
    '7. PAUSA LUNGA: Aspetta 5-10 minuti prima di ripetere, non fare sessioni ravvicinate che sommano stress.'
  ],
  description = 'Prima esposizione controllata al trigger della paura, usando intensità minima per iniziare il processo di desensibilizzazione.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Esposizione Minima';

-- 4. Desensibilizzazione Audio
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. REGISTRAZIONE SUONI: Trova registrazioni di alta qualità dei suoni che creano paura (tuoni, traffico, fuochi d''artificio).',
    '2. VOLUME INIZIALE: Inizia con volume appena percettibile, così basso che tu stesso fatichi a sentirlo.',
    '3. ASSOCIAZIONE POSITIVA: Riproduci il suono SOLO durante attività piacevoli come pasti o gioco tranquillo.',
    '4. INCREMENTO GRADUALE: Aumenta il volume del 5% solo se per 3 giorni consecutivi rimane completamente rilassato.',
    '5. SEGNALI STRESS: Se vedi ansimare, tremare, nascondersi = volume troppo alto, torna al livello precedente.',
    '6. SESSIONI BREVI: Massimo 10 minuti per sessione, 2-3 volte al giorno con pause di almeno 2 ore.',
    '7. REGISTRO PROGRESSI: Annota quotidianamente volume utilizzato e reazioni per monitorare miglioramenti.'
  ],
  description = 'Abituazione graduale e sistematica ai suoni che causano paura, attraverso esposizione controllata e associazioni positive.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Desensibilizzazione Audio';

-- 5. Comandi di Base Rilassati
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SCELTA COMANDO: Inizia con "seduto" che è il più semplice e naturale per la maggior parte dei pet.',
    '2. AMBIENTE TRANQUILLO: Allena solo nella zona sicura, senza distrazioni o rumori di sottofondo.',
    '3. RICHIESTA DOLCE: Usa voce calma e dolce, mai imperativa - più una richiesta che un ordine.',
    '4. ATTESA PAZIENTE: Dopo aver dato il comando, aspetta fino a 30 secondi senza ripetere.',
    '5. PREMIO IMMEDIATO: Nel momento esatto in cui esegue, premia con entusiasmo ma senza eccitazione eccessiva.',
    '6. SESSIONI MICRO: 3-5 ripetizioni massimo per sessione, se sbaglia non correggere ma riprova più tardi.',
    '7. COSTRUZIONE FIDUCIA: Ogni comando riuscito aumenta la sua fiducia nelle proprie capacità e nella vostra relazione.'
  ],
  description = 'Training di base focalizzato sul successo e sulla costruzione di fiducia, usando solo rinforzo positivo per aumentare l''autostima.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Comandi di Base Rilassati';

-- Continua con gli altri esercizi...
-- 6. Gioco Calmante
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SELEZIONE GIOCHI: Scegli giochi statici come puzzle per cibo, masticativi o giochi olfattivi lenti.',
    '2. RITMO CONTROLLATO: Tutti i movimenti devono essere lenti e prevedibili, evita giochi di lancio o rincorsa.',
    '3. TU REGOLI ENERGIA: Mantieni un''energia calma e bassa, il tuo stato d''animo influenza direttamente il suo.',
    '4. PREMIO PARTECIPAZIONE: Premia qualsiasi interesse verso il gioco, anche solo annusarlo o toccarlo.',
    '5. STOP PREVENTIVO: Termina il gioco mentre è ancora interessato, prima che si stanchi o si stressi.',
    '6. GIOCHI CONDIVISI: Occasionalmente partecipa al gioco restando calmo, diventa un''attività di bonding.',
    '7. ROTAZIONE GIOCHI: Cambia tipo di gioco ogni 2-3 giorni per mantenere interesse senza creare routine fisse.'
  ],
  description = 'Attività ludiche progettate per ridurre tensione e creare associazioni positive con il rilassamento e il divertimento controllato.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Gioco Calmante';