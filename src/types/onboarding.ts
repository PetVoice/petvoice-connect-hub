export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetSelector: string;
  action: 'click' | 'upload' | 'view' | 'navigate' | 'complete';
  optional: boolean;
  autoAdvance?: boolean;
  waitForElement?: boolean;
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  skippedSteps: number[];
  planType: 'premium' | 'family';
  userId: string;
}

export interface OnboardingContextType {
  state: OnboardingState;
  steps: OnboardingStep[];
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
  isStepCompleted: (stepId: number) => boolean;
  currentStepData: OnboardingStep | null;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Benvenuto in PetVoice Premium!",
    description: "Ti guideremo nella tua prima analisi emotiva. Iniziamo insieme questo viaggio per comprendere meglio il tuo pet.",
    targetSelector: "body",
    action: "view",
    optional: false,
    autoAdvance: true
  },
  {
    id: 2,
    title: "Aggiungi il tuo Pet",
    description: "Prima di analizzare le emozioni, assicurati di aver aggiunto il tuo pet al profilo. Clicca qui per aggiungerne uno.",
    targetSelector: "[data-onboarding='add-pet']",
    action: "click",
    optional: false,
    waitForElement: true
  },
  {
    id: 3,
    title: "Vai all'Analisi Emotiva",
    description: "Perfetto! Ora dirigiamoci verso la sezione di analisi emotiva per iniziare la tua prima analisi.",
    targetSelector: "[data-onboarding='analysis-menu']",
    action: "navigate",
    optional: false,
    autoAdvance: true
  },
  {
    id: 4,
    title: "Carica un File Audio",
    description: "Carica un file audio del tuo pet. Può essere un miagolio, abbaiare, o qualsiasi suono che fa il tuo amico a quattro zampe.",
    targetSelector: "[data-onboarding='file-upload']",
    action: "upload",
    optional: false,
    waitForElement: true
  },
  {
    id: 5,
    title: "Avvia l'Analisi",
    description: "Ottimo! Ora clicca sul pulsante Analizza per iniziare l'analisi emotiva del tuo pet.",
    targetSelector: "[data-onboarding='analyze-button']",
    action: "click",
    optional: false,
    waitForElement: true
  },
  {
    id: 6,
    title: "Visualizza i Risultati",
    description: "Fantastico! Ecco cosa prova il tuo pet. Puoi vedere l'emozione principale, il livello di confidenza e consigli utili.",
    targetSelector: "[data-onboarding='analysis-results']",
    action: "view",
    optional: false,
    autoAdvance: true
  },
  {
    id: 7,
    title: "Salva nel Diario",
    description: "Salva questa analisi nel diario del tuo pet per tenere traccia delle sue emozioni nel tempo.",
    targetSelector: "[data-onboarding='save-diary']",
    action: "click",
    optional: true,
    autoAdvance: true
  },
  {
    id: 8,
    title: "Complimenti!",
    description: "Perfetto! Ora sai come usare PetVoice Premium. Esplora le altre funzioni come il calendario, il diario e le statistiche!",
    targetSelector: "body",
    action: "complete",
    optional: false,
    autoAdvance: true
  }
];