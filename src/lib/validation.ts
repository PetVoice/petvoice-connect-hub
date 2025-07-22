// Validazione centralizzata per garantire coerenza dei dati
import { z } from 'zod';

// Schema per validazione Pet
export const petSchema = z.object({
  name: z.string().min(1, "Nome richiesto").max(50, "Nome troppo lungo"),
  type: z.string().min(1, "Tipo richiesto"),
  breed: z.string().optional(),
  age: z.number().min(0, "Età non valida").max(50, "Età troppo alta").optional(),
  weight: z.number().min(0.1, "Peso troppo basso").max(1000, "Peso troppo alto").optional(),
  birth_date: z.date().max(new Date(), "Data di nascita non può essere nel futuro").optional(),
  health_conditions: z.array(z.string()).optional()
});

// Schema per validazione Diary Entry
export const diaryEntrySchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  mood_score: z.number().min(1, "Voto troppo basso").max(10, "Voto troppo alto").optional(),
  temperature: z.number().min(35, "Temperatura troppo bassa").max(45, "Temperatura troppo alta").optional(),
  entry_date: z.date().max(new Date(Date.now() + 24 * 60 * 60 * 1000), "Data non può essere più di 1 giorno nel futuro"),
  behavioral_tags: z.array(z.string()).optional(),
  photo_urls: z.array(z.string().url()).optional(),
  voice_note_url: z.string().url().optional(),
  weather_condition: z.string().optional()
});

// Schema per validazione Analysis
export const analysisSchema = z.object({
  file_type: z.union([
    z.literal('text'),
    z.string().regex(/^audio\//, "Tipo audio non valido"),
    z.string().regex(/^video\//, "Tipo video non valido"),
    z.string().regex(/^image\//, "Tipo immagine non valido")
  ]),
  primary_confidence: z.number().min(0, "Confidenza troppo bassa").max(1, "Confidenza troppo alta"),
  storage_path: z.string().optional().nullable(),
  primary_emotion: z.string().min(1, "Emozione richiesta"),
  secondary_emotions: z.record(z.number()).optional(),
  behavioral_insights: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional()
});

// Schema per validazione Calendar Event
export const calendarEventSchema = z.object({
  title: z.string().min(1, "Titolo richiesto"),
  start_time: z.date(),
  end_time: z.date().optional(),
  description: z.string().optional(),
  category: z.enum(['vet', 'grooming', 'training', 'activity', 'medication', 'other']),
  location: z.string().optional(),
  cost: z.number().min(0, "Costo non può essere negativo").optional(),
  notes: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  photo_urls: z.array(z.string().url()).optional()
});

// Utility per validazione coerente
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validazione fallita: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
};

// Validazione email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validazione telefono
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};