-- PRIMO: Aggiorna QUESTO protocollo "Superare la Paura" con descrizioni dettagliate
-- (stesso contenuto dell'altro protocollo)

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
WHERE protocol_id = 'dcd5eb65-d547-4953-a7d6-57566bdd41dd' AND title = 'Presenza Rassicurante';

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
WHERE protocol_id = 'dcd5eb65-d547-4953-a7d6-57566bdd41dd' AND title = 'Ambiente Sicuro';

-- SECONDO: Differenzia le difficoltà dei protocolli
UPDATE ai_training_protocols SET difficulty = 'facile' WHERE title = 'Chiarezza Mentale';
UPDATE ai_training_protocols SET difficulty = 'avanzato' WHERE title = 'Controllo dell''Aggressività';
UPDATE ai_training_protocols SET difficulty = 'difficile' WHERE title = 'Superare la Paura';
UPDATE ai_training_protocols SET difficulty = 'medio' WHERE title LIKE '%Rilassamento%' OR title LIKE '%Calma%';