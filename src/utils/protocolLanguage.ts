// Utility per gestire le traduzioni dei protocolli di training

export type SupportedLanguage = 'it' | 'en' | 'es';

export interface MultiLanguageTrainingProtocol {
  id: string;
  user_id?: string;
  pet_id?: string;
  title_it?: string;
  title_en?: string;
  title_es?: string;
  description_it?: string;
  description_en?: string;
  description_es?: string;
  category_it?: string;
  category_en?: string;
  category_es?: string;
  difficulty_it?: string;
  difficulty_en?: string;
  difficulty_es?: string;
  status_it?: string;
  status_en?: string;
  status_es?: string;
  target_behavior_it?: string;
  target_behavior_en?: string;
  target_behavior_es?: string;
  triggers_it?: any;
  triggers_en?: any;
  triggers_es?: any;
  required_materials_it?: any;
  required_materials_en?: any;
  required_materials_es?: any;
  duration_days: number;
  current_day: number;
  progress_percentage: string;  // È text nel database
  success_rate: number;
  ai_generated: boolean;
  integration_source?: string;
  veterinary_approved: boolean;
  estimated_cost?: string;  // È text nel database
  is_public: boolean;
  share_code?: string;
  community_rating: number;
  community_usage: string;  // È text nel database
  mentor_recommended: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

// Funzione per ottenere la traduzione corretta basata sulla lingua
export const getTranslatedField = (
  protocol: MultiLanguageTrainingProtocol,
  field: string,
  language: SupportedLanguage = 'it'
): string => {
  const fieldWithLanguage = `${field}_${language}` as keyof MultiLanguageTrainingProtocol;
  const value = protocol[fieldWithLanguage];
  
  // Se non esiste la traduzione nella lingua richiesta, prova l'italiano come fallback
  if (!value && language !== 'it') {
    const fallbackField = `${field}_it` as keyof MultiLanguageTrainingProtocol;
    const fallbackValue = protocol[fallbackField];
    if (fallbackValue) return String(fallbackValue);
  }
  
  // Se neanche l'italiano è disponibile, prova l'inglese
  if (!value && language !== 'en') {
    const fallbackField = `${field}_en` as keyof MultiLanguageTrainingProtocol;
    const fallbackValue = protocol[fallbackField];
    if (fallbackValue) return String(fallbackValue);
  }
  
  return value ? String(value) : '';
};

// Funzione per ottenere array tradotti (triggers, materials)
export const getTranslatedArray = (
  protocol: MultiLanguageTrainingProtocol,
  field: string,
  language: SupportedLanguage = 'it'
): string[] => {
  const fieldWithLanguage = `${field}_${language}` as keyof MultiLanguageTrainingProtocol;
  const value = protocol[fieldWithLanguage];
  
  // Gestisce sia array che JSON
  if (Array.isArray(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [value];
    }
  }
  
  if (value && typeof value === 'object') {
    return Array.isArray(value) ? value : Object.values(value).filter(v => typeof v === 'string');
  }
  
  // Fallback alla lingua italiana
  if (language !== 'it') {
    return getTranslatedArray(protocol, field, 'it');
  }
  
  return [];
};

// Funzione per convertire il protocollo multilanguage in formato standard
export const convertToStandardProtocol = (
  protocol: MultiLanguageTrainingProtocol,
  language: SupportedLanguage = 'it'
) => {
  return {
    id: protocol.id,
    user_id: protocol.user_id || '',
    pet_id: protocol.pet_id,
    title: getTranslatedField(protocol, 'title', language),
    description: getTranslatedField(protocol, 'description', language),
    category: getTranslatedField(protocol, 'category', language),
    difficulty: getTranslatedField(protocol, 'difficulty', language) as 'facile' | 'medio' | 'difficile',
    status: getTranslatedField(protocol, 'status', language) as 'available' | 'active' | 'paused' | 'completed' | 'suggested',
    target_behavior: getTranslatedField(protocol, 'target_behavior', language),
    triggers: getTranslatedArray(protocol, 'triggers', language),
    required_materials: getTranslatedArray(protocol, 'required_materials', language),
    duration_days: protocol.duration_days,
    current_day: protocol.current_day,
    progress_percentage: parseInt(protocol.progress_percentage || '0'),
    success_rate: protocol.success_rate,
    ai_generated: protocol.ai_generated,
    integration_source: protocol.integration_source,
    veterinary_approved: protocol.veterinary_approved,
    estimated_cost: protocol.estimated_cost?.toString(),
    is_public: protocol.is_public,
    share_code: protocol.share_code,
    community_rating: protocol.community_rating,
    community_usage: parseInt(protocol.community_usage || '0'),
    mentor_recommended: protocol.mentor_recommended,
    notifications_enabled: protocol.notifications_enabled,
    created_at: protocol.created_at,
    updated_at: protocol.updated_at,
    last_activity_at: protocol.last_activity_at
  };
};

// Funzione per convertire dal formato standard al formato multilanguage per inserimenti/aggiornamenti
export const convertFromStandardProtocol = (
  protocol: any,
  language: SupportedLanguage = 'it'
): Partial<MultiLanguageTrainingProtocol> => {
  const result: any = {
    user_id: protocol.user_id,
    pet_id: protocol.pet_id,
    duration_days: protocol.duration_days,
    current_day: protocol.current_day,
    progress_percentage: protocol.progress_percentage?.toString() || '0',
    success_rate: protocol.success_rate,
    ai_generated: protocol.ai_generated,
    integration_source: protocol.integration_source,
    veterinary_approved: protocol.veterinary_approved,
    estimated_cost: protocol.estimated_cost,
    is_public: protocol.is_public,
    share_code: protocol.share_code,
    community_rating: protocol.community_rating,
    community_usage: protocol.community_usage?.toString() || '0',
    mentor_recommended: protocol.mentor_recommended,
    notifications_enabled: protocol.notifications_enabled,
  };

  // Aggiungi i campi tradotti se presenti
  if (protocol.title !== undefined) {
    result[`title_${language}`] = protocol.title;
  }
  if (protocol.description !== undefined) {
    result[`description_${language}`] = protocol.description;
  }
  if (protocol.category !== undefined) {
    result[`category_${language}`] = protocol.category;
  }
  if (protocol.difficulty !== undefined) {
    result[`difficulty_${language}`] = protocol.difficulty;
  }
  if (protocol.status !== undefined) {
    result[`status_${language}`] = protocol.status;
  }
  if (protocol.target_behavior !== undefined) {
    result[`target_behavior_${language}`] = protocol.target_behavior;
  }
  if (protocol.triggers !== undefined) {
    result[`triggers_${language}`] = Array.isArray(protocol.triggers) ? protocol.triggers : JSON.stringify(protocol.triggers);
  }
  if (protocol.required_materials !== undefined) {
    result[`required_materials_${language}`] = Array.isArray(protocol.required_materials) ? protocol.required_materials : JSON.stringify(protocol.required_materials);
  }

  return result;
};