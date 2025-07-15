-- Aggiorna le FAQ con il prezzo corretto di 0,97€ al mese
UPDATE support_faq SET answer = REPLACE(answer, '€9.99', '0,97€') WHERE answer LIKE '%€9.99%';
UPDATE support_faq SET answer = REPLACE(answer, '9.99€', '0,97€') WHERE answer LIKE '%9.99€%';
UPDATE support_faq SET answer = REPLACE(answer, '€9,99', '0,97€') WHERE answer LIKE '%€9,99%';
UPDATE support_faq SET answer = REPLACE(answer, '9,99€', '0,97€') WHERE answer LIKE '%9,99€%';

-- Inserisci FAQ specifica sui prezzi se non esiste
INSERT INTO support_faq (question, answer, category, tags, is_published, sort_order)
VALUES (
  'Quanto costa il piano premium di PetVoice?',
  'Il piano premium di PetVoice costa solo 0,97€ al mese e include analisi comportamentali illimitate, supporto prioritario, calendari intelligenti, backup cloud e molte altre funzioni esclusive. Puoi disdire in qualsiasi momento senza vincoli.',
  'billing',
  ARRAY['prezzo', 'premium', 'abbonamento', 'costo'],
  true,
  1
) ON CONFLICT DO NOTHING;