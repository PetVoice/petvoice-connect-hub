-- Aggiornamento esercizio "Focus e Concentrazione" con istruzioni dettagliate

UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. AMBIENTE PREPARATO: Scegli una stanza tranquilla, rimuovi tutte le distrazioni (giocattoli, rumori, altre persone).',
    '2. POSIZIONE INIZIALE: Mettiti a 1 metro dal pet, tieni i premietti nascosti ma a portata di mano.',
    '3. COMANDO CHIARO: Pronuncia "GUARDAMI" con voce ferma e mantieni il contatto visivo diretto.',
    '4. ATTESA PAZIENTE: Non ripetere il comando, aspetta che il pet ti guardi spontaneamente negli occhi.',
    '5. PREMIO IMMEDIATO: Nel momento esatto del contatto visivo, dai premio e lode enthusiastica.',
    '6. DURATA CRESCENTE: Inizia con 2 secondi di contatto, aumenta di 1 secondo ogni sessione riuscita.',
    '7. DISTANZA PROGRESSIVA: Quando raggiunge 10 secondi a 1 metro, inizia ad allontanarti gradualmente.'
  ],
  description = 'Allenamento sistematico dell''attenzione e concentrazione attraverso il contatto visivo prolungato e comandi di focus.',
  updated_at = NOW()
WHERE title = 'Focus e Concentrazione';