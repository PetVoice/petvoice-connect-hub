export const EMOTION_COLORS = {
  felice: '#22c55e',
  calmo: '#06b6d4',
  ansioso: '#f59e0b',
  eccitato: '#ef4444',
  triste: '#6366f1',
  aggressivo: '#dc2626',
  giocoso: '#8b5cf6'
} as const;

export const EMOTION_LABELS = {
  felice: 'Felice',
  calmo: 'Calmo',
  ansioso: 'Ansioso',
  eccitato: 'Eccitato',
  triste: 'Triste',
  aggressivo: 'Aggressivo',
  giocoso: 'Giocoso'
} as const;

export const TREND_DESCRIPTIONS = {
  significant_improvement: {
    label: 'Miglioramento Significativo',
    description: 'Il benessere emotivo sta migliorando notevolmente',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  slight_improvement: {
    label: 'Leggero Miglioramento',
    description: 'Si osserva un miglioramento graduale del benessere',
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  stable: {
    label: 'Stabile',
    description: 'Il benessere emotivo si mantiene costante',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  slight_decline: {
    label: 'Leggero Peggioramento',
    description: 'Si osserva un calo graduale del benessere',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  },
  significant_decline: {
    label: 'Peggioramento Significativo',
    description: 'Il benessere emotivo necessita di attenzione',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  insufficient_data: {
    label: 'Dati Insufficienti',
    description: 'Servono più analisi per determinare il trend',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  }
} as const;

export const CONFIDENCE_LEVELS = [
  { value: 'all', label: 'Tutte le confidenze' },
  { value: '90', label: '90% o superiore' },
  { value: '80', label: '80% o superiore' },
  { value: '70', label: '70% o superiore' },
  { value: '60', label: '60% o superiore' }
];

export const SUPPORTED_FILE_TYPES = {
  audio: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/webm'],
  video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const PROCESSING_STAGES = {
  UPLOAD: 'Caricamento file...',
  ANALYSIS: 'Analisi AI in corso...',
  SAVING: 'Salvataggio risultati...',
  COMPLETE: 'Completato!'
};

export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true
      }
    }
  }
};