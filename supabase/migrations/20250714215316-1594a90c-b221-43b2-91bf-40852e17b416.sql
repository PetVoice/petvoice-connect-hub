-- Template per condivisione analisi emotive
INSERT INTO public.sharing_templates (
  platform, 
  template_name, 
  content, 
  is_active, 
  variables
) VALUES 
(
  'facebook',
  'Analisi Emotiva Pet',
  '🐾 Analisi emotiva di {{pet_name}}: {{emotion}} ({{confidence}}% confidenza) 📊

Insights: {{insights}}

Scopri le emozioni del tuo pet con PetVoice! 🧠✨

{{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
),
(
  'twitter',
  'Analisi Emotiva Pet',
  '🐾 {{pet_name}} mostra emozione: {{emotion}} ({{confidence}}% confidenza) 📊

Insights: {{insights}}

#PetVoice #AnalisiEmotiva #PetCare

{{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
),
(
  'whatsapp',
  'Analisi Emotiva Pet',
  '🐾 Ciao! Ho appena fatto l''analisi emotiva di {{pet_name}} con PetVoice!

📊 Risultato: {{emotion}} ({{confidence}}% confidenza)

💡 Insights: {{insights}}

Guarda i risultati completi: {{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
),
(
  'instagram',
  'Analisi Emotiva Pet',
  '🐾 Analisi emotiva di {{pet_name}}: {{emotion}} ({{confidence}}% confidenza) 📊

Insights: {{insights}}

#PetVoice #AnalisiEmotiva #PetCare #TechPet #PetParent

{{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
)