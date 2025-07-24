-- Aggiorna gli ultimi esercizi del protocollo "Recupero dall'Apatia" - PARTE FINALE

-- Training Motivazionale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. FOCUS PUNTI FORTI: IDENTIFICA abilità naturali del pet e costruisci training su quelle',
  '2. PROGRESSIONE RAPIDA: AVANZA velocemente su esercizi che riesce bene per costruire momentum',
  '3. CELEBRAZIONE APERTA: FESTEGGIA OGNI successo con entusiasmo visibile e genuino',
  '4. AUTOSTIMA BUILDING: CREA situazioni dove il pet può "vincere" facilmente e sentirsi capace',
  '5. TRICK PREFERITI: CONCENTRATI su comandi che gli piacciono di più, non su quelli "utili"',
  '6. RINFORZI ENTUSIASTICI: USA premi di ALTISSIMO valore e lodi esagerate per motivare',
  '7. SESSIONI POSITIVE: TERMINA sempre quando il pet è ancora motivato e felice',
  '8. COSTRUZIONE FIDUCIA: EVITA correzioni o frustrazioni, solo rinforzi positivi'
],
updated_at = NOW()
WHERE title = 'Training Motivazionale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Energia Condivisa
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. COINVOLGIMENTO FAMILIARE: INVITA altri membri famiglia a partecipare alle attività',
  '2. ATTIVITÀ GRUPPO: ORGANIZZA giochi che coinvolgono tutti contemporaneamente',
  '3. PARTECIPAZIONE SOCIALE: PREMIA ogni interazione positiva con i membri del gruppo',
  '4. MOMENTI GIOIA COLLETTIVA: CREA situazioni divertenti che fanno ridere/divertire tutti',
  '5. ENERGIA CONTAGIOSA: USA l''entusiasmo del gruppo per contagiare il pet apatico',
  '6. RUOLI SPECIALI: DAI al pet un ruolo importante nelle attività di gruppo',
  '7. CELEBRAZIONE INSIEME: FESTEGGIA successi come gruppo unito, non solo individualmente',
  '8. APPARTENENZA: RENDI il pet consapevole di essere parte importante del gruppo famiglia'
],
updated_at = NOW()
WHERE title = 'Energia Condivisa' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Autonomia Guidata
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. LIBERTÀ SCELTA: PRESENTA 2-3 opzioni di attività e lascia che il pet SCELGA autonomamente',
  '2. DECISIONI AUTONOME: PREMIA ogni decisione indipendente presa dal pet senza dirigere',
  '3. SUPPORTO DISCRETO: OFFRI aiuto solo se richiesto, non intervenire proattivamente',
  '4. INIZIATIVA PERSONALE: INCORAGGIA il pet a proporre attività o esplorazioni proprie',
  '5. RISPETTO PREFERENZE: ACCETTA le scelte del pet anche se diverse dalle tue aspettative',
  '6. FIDUCIA CAPACITÀ: DIMOSTRA che credi nelle sue capacità di prendere buone decisioni',
  '7. SPAZI LIBERI: CREA zone dove il pet può agire completamente in autonomia',
  '8. GRADUALITÀ INDIPENDENZA: AUMENTA progressivamente il livello di autonomia concessa'
],
updated_at = NOW()
WHERE title = 'Autonomia Guidata' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Routine Energetica  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. IDENTIFICAZIONE ATTIVITÀ: RIPETI le attività che hanno dato maggiore energia e motivazione',
  '2. ROUTINE GIORNALIERA: STABILISCI sequenza fissa di attività energizzanti ogni giorno',
  '3. PIANIFICAZIONE CONTINUITÀ: CREA piano per mantenere momentum anche dopo il protocollo',
  '4. MOMENTUM POSITIVO: USA l''energia accumulata per alimentare ulteriori attività positive',
  '5. ORARI OTTIMALI: SCHEDULA attività energizzanti nei momenti di maggiore ricettività',
  '6. VARIETÀ CONTROLLATA: MANTIENI novità ma dentro struttura prevedibile e rassicurante',
  '7. RINFORZI AUTOMATICI: ASSOCIA routine a rinforzi che diventano parte integrante',
  '8. SOSTENIBILITÀ LUNGO TERMINE: CREA routine che possono essere mantenute facilmente'
],
updated_at = NOW()
WHERE title = 'Routine Energetica' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Sfida Personale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. OBIETTIVO PERSONALIZZATO: IMPOSTA sfida SPECIFICA per il tuo pet basata sui suoi punti forti',
  '2. SUDDIVISIONE PASSI: DIVIDI obiettivo grande in piccoli passi gestibili e raggiungibili',
  '3. SUPPORTO SENZA SOSTITUZIONE: ASSISTI il pet ma lascia che sia LUI a raggiungere l''obiettivo',
  '4. CELEBRAZIONE ACHIEVEMENT: ORGANIZZA vera FESTA quando raggiunge l''obiettivo prefissato',
  '5. DOCUMENTAZIONE SUCCESSO: REGISTRA il momento del successo per ricordi futuri positivi',
  '6. COSTRUZIONE MOMENTUM: USA il successo come trampolino per sfide future progressive',
  '7. PERSONALIZZAZIONE TOTALE: ADATTA ogni aspetto della sfida alla personalità unica del pet',
  '8. SIGNIFICATO PROFONDO: SCEGLI obiettivo che abbia valore simbolico per il recupero dall''apatia'
],
updated_at = NOW()
WHERE title = 'Sfida Personale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Celebrazione Attiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. FESTA VERA: ORGANIZZA celebrazione REALE per i progressi straordinari ottenuti',
  '2. INVITI SPECIALI: CHIAMA gli amici pet preferiti per condividere la gioia',
  '3. ATTIVITÀ POSITIVE: PROGRAMMA solo attività che il pet ama di più durante la festa',
  '4. PREMI SPECIALI: OFFRI treat eccezionali che non dà mai normalmente',
  '5. DOCUMENTAZIONE FELICITÀ: FOTOGRAFA/filma momenti felici per memoria permanente',
  '6. RICONOSCIMENTO PUBBLICO: CONDIVIDI successi con persone che tengono al pet',
  '7. SIMBOLI SUCCESSO: CREA "diploma" o riconoscimento tangibile del percorso completato',
  '8. ENERGIA CELEBRATIVA: MANTIENI atmosfera festosa ed energica per tutto l''evento'
],
updated_at = NOW()
WHERE title = 'Celebrazione Attiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);