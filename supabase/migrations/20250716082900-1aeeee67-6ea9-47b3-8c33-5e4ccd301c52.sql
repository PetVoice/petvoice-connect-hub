-- Insert lessons for "Getting Started" learning path
INSERT INTO public.lessons (learning_path_id, title, description, content, lesson_type, duration_minutes, sort_order) 
SELECT 
  lp.id,
  lesson_data.title,
  lesson_data.description,
  lesson_data.content,
  lesson_data.lesson_type,
  lesson_data.duration_minutes,
  lesson_data.sort_order
FROM public.learning_paths lp,
(VALUES 
  ('Benvenuto in PetVoice', 'Introduzione alla piattaforma e alle sue funzionalità principali', '{"type": "interactive", "steps": [{"title": "Panoramica Dashboard", "content": "Scopri come navigare nella dashboard principale di PetVoice", "media": "/tutorial/dashboard-overview.png"}, {"title": "Menu Principale", "content": "Impara ad utilizzare il menu laterale per accedere a tutte le funzioni", "media": null}]}', 'interactive', 10, 1),
  ('Configurare il Profilo', 'Imposta le informazioni del tuo account per una migliore esperienza', '{"type": "reading", "content": "Il tuo profilo è il punto di partenza per personalizzare PetVoice. Qui puoi impostare le tue preferenze, informazioni di contatto e personalizzazioni dell''interfaccia.", "checklist": ["Inserisci nome e cognome", "Aggiungi foto profilo", "Imposta preferenze lingua", "Configura notifiche"]}', 'reading', 8, 2),
  ('Aggiungere il Primo Pet', 'Guida passo-passo per registrare il tuo animale domestico', '{"type": "interactive", "steps": [{"title": "Informazioni Base", "content": "Nome, tipo di animale, età e peso del tuo pet", "action": "fill_form"}, {"title": "Caratteristiche", "content": "Razza, personalità e caratteristiche comportamentali", "action": "select_options"}, {"title": "Salute", "content": "Condizioni mediche, allergie e informazioni veterinarie", "action": "health_info"}]}', 'interactive', 15, 3),
  ('Caricare la Prima Foto', 'Impara come caricare e gestire le foto del tuo pet', '{"type": "video", "video_url": "/tutorial/upload-photo.mp4", "transcript": "In questo video imparerai come caricare le prime foto del tuo pet e organizzarle in album...", "key_points": ["Seleziona foto di qualità", "Usa buona illuminazione", "Cattura diverse espressioni"]}', 'video', 6, 4),
  ('Navigazione App', 'Tour completo di tutte le sezioni dell''applicazione', '{"type": "interactive", "tour_stops": [{"section": "Dashboard", "description": "Centro di controllo principale"}, {"section": "Pets", "description": "Gestione profili animali"}, {"section": "Analysis", "description": "Analisi comportamentali"}, {"section": "Diary", "description": "Diario giornaliero"}, {"section": "Calendar", "description": "Appuntamenti e promemoria"}]}', 'interactive', 12, 5),
  ('Impostazioni Base', 'Configura le impostazioni essenziali dell''app', '{"type": "reading", "content": "Le impostazioni permettono di personalizzare l''esperienza PetVoice secondo le tue esigenze.", "sections": [{"title": "Notifiche", "content": "Gestisci quando e come ricevere notifiche"}, {"title": "Privacy", "content": "Controlla la visibilità dei tuoi dati"}, {"title": "Tema", "content": "Scegli l''aspetto dell''interfaccia"}]}', 'reading', 8, 6),
  ('Prima Sincronizzazione', 'Configura la sincronizzazione con altri dispositivi', '{"type": "interactive", "steps": [{"title": "Account Cloud", "content": "Verifica il tuo account per la sincronizzazione", "action": "verify_account"}, {"title": "Seleziona Dispositivi", "content": "Scegli quali dispositivi sincronizzare", "action": "device_selection"}, {"title": "Test Sincronizzazione", "content": "Verifica che tutto funzioni correttamente", "action": "sync_test"}]}', 'interactive', 10, 7),
  ('Completamento Setup', 'Verifica finale e primi passi successivi', '{"type": "quiz", "questions": [{"question": "Quale sezione permette di gestire i profili dei tuoi pet?", "options": ["Dashboard", "Pets", "Analysis", "Diary"], "correct": 1}, {"question": "Dove puoi modificare le impostazioni delle notifiche?", "options": ["Profilo", "Impostazioni", "Dashboard", "Pets"], "correct": 1}], "passing_score": 70}', 'quiz', 5, 8)
) AS lesson_data(title, description, content, lesson_type, duration_minutes, sort_order)
WHERE lp.title = 'Getting Started';

-- Update total_lessons count for Getting Started path
UPDATE public.learning_paths 
SET total_lessons = 8
WHERE title = 'Getting Started';