// Types for Diary functionality
export interface DiaryEntry {
  id: string;
  title: string | null;
  content: string | null;
  entry_date: string;
  mood_score: number | null;
  behavioral_tags: string[] | null;
  photo_urls: string[] | null;
  voice_note_url: string | null;
  weather_condition: string | null;
  temperature: number | null;
  pet_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DayEntriesModalState {
  open: boolean;
  date: Date;
  entries: DiaryEntry[];
}

// Predefined tags with categories
export const PREDEFINED_TAGS = {
  emotivo: ['felice', 'triste', 'ansioso', 'calmo', 'energico', 'depresso', 'stressato', 'rilassato'],
  comportamentale: ['gioco', 'appetito', 'sonno', 'aggressivo', 'affettuoso', 'curioso', 'timido', 'sociale'],
  salute: ['malato', 'sano', 'dolorante', 'vivace', 'stanco', 'alert'],
  ambientale: ['temporale', 'caldo', 'freddo', 'rumoroso', 'silenzioso', 'casa', 'parco', 'visita-vet'],
  addestramento: ['training', 'obbedienza', 'trucchi', 'ricompensa', 'punizione', 'progresso']
};

export const TAG_COLORS = {
  emotivo: 'bg-pink-500',
  comportamentale: 'bg-blue-500', 
  salute: 'bg-green-500',
  ambientale: 'bg-yellow-500',
  addestramento: 'bg-purple-500'
};

export const MOOD_LABELS = {
  1: 'Terribile',
  2: 'Molto Male', 
  3: 'Male',
  4: 'Sotto la Media',
  5: 'Neutrale',
  6: 'Bene',
  7: 'Molto Bene',
  8: 'Ottimo',
  9: 'Fantastico',
  10: 'Perfetto'
};

// Diary Categories with colors - Like Calendar
export const DIARY_CATEGORIES = {
  happy: {
    label: '😊 Felice',
    color: 'bg-green-500 text-white',
    moodRange: [8, 10]
  },
  calm: {
    label: '😌 Calmo',
    color: 'bg-blue-500 text-white',
    moodRange: [6, 7]
  },
  neutral: {
    label: '😐 Neutrale',
    color: 'bg-gray-500 text-white',
    moodRange: [5, 5]
  },
  sad: {
    label: '😔 Triste',
    color: 'bg-yellow-500 text-black',
    moodRange: [3, 4]
  },
  stressed: {
    label: '😰 Stressato',
    color: 'bg-red-500 text-white',
    moodRange: [1, 2]
  }
};