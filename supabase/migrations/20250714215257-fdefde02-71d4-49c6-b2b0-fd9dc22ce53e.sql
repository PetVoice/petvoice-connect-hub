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
  '🐾 Analisi emotiva di {{pet_name}}: {{emotion}} ({{confidence}}% confidenza) 📊\n\nInsights: {{insights}}\n\nScopri le emozioni del tuo pet con PetVoice! 🧠✨\n\n{{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
),
(
  'twitter',
  'Analisi Emotiva Pet',
  '🐾 {{pet_name}} mostra emozione: {{emotion}} ({{confidence}}% confidenza) 📊\n\nInsights: {{insights}}\n\n#PetVoice #AnalisiEmotiva #PetCare\n\n{{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
),
(
  'whatsapp',
  'Analisi Emotiva Pet',
  '🐾 Ciao! Ho appena fatto l\'analisi emotiva di {{pet_name}} con PetVoice!\n\n📊 Risultato: {{emotion}} ({{confidence}}% confidenza)\n\n💡 Insights: {{insights}}\n\nGuarda i risultati completi: {{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
),
(
  'instagram',
  'Analisi Emotiva Pet',
  '🐾 Analisi emotiva di {{pet_name}}: {{emotion}} ({{confidence}}% confidenza) 📊\n\nInsights: {{insights}}\n\n#PetVoice #AnalisiEmotiva #PetCare #TechPet #PetParent\n\n{{url}}',
  true,
  '{"pet_name": "string", "emotion": "string", "confidence": "string", "insights": "string", "url": "string"}'
)