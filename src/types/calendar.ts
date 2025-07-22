// Types for Calendar functionality
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  category: string;
  start_time: string;
  end_time?: string;
  is_all_day: boolean;
  recurring_pattern?: any;
  reminder_settings?: any;
  attendees?: string[];
  cost?: number;
  status: string;
  notes?: string;
  photo_urls?: string[];
  pet_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  category: string;
  default_duration?: any;
  default_reminder_settings?: any;
  default_cost?: number;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Event Categories
export const EVENT_CATEGORIES = {
  medical: {
    label: '🏥 Visite Mediche',
    color: 'bg-red-500 text-white',
    icon: '🏥'
  },
  grooming: {
    label: '✂️ Toelettatura',
    color: 'bg-blue-500 text-white',
    icon: '✂️'
  },
  training: {
    label: '🎓 Addestramento',
    color: 'bg-green-500 text-white',
    icon: '🎓'
  },
  social: {
    label: '🐕 Socializzazione',
    color: 'bg-yellow-500 text-black',
    icon: '🐕'
  },
  exercise: {
    label: '🏃 Esercizio',
    color: 'bg-purple-500 text-white',
    icon: '🏃'
  },
  feeding: {
    label: '🍽️ Alimentazione',
    color: 'bg-orange-500 text-white',
    icon: '🍽️'
  },
  travel: {
    label: '✈️ Viaggi',
    color: 'bg-indigo-500 text-white',
    icon: '✈️'
  },
  other: {
    label: '📅 Altro',
    color: 'bg-gray-500 text-white',
    icon: '📅'
  }
};

export const RECURRING_PATTERNS = {
  none: 'Nessuna',
  daily: 'Giornaliero',
  weekly: 'Settimanale',
  monthly: 'Mensile',
  yearly: 'Annuale'
};

export const EVENT_STATUS = {
  scheduled: 'Programmato',
  completed: 'Completato',
  cancelled: 'Annullato',
  rescheduled: 'Riprogrammato'
};