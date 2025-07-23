import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Lightbulb, 
  AlertTriangle,
  Clock,
  FileAudio,
  FileVideo,
  Download,
  Share2,
  BookOpen,
  Calendar,
  Target,
  Activity,
  Zap,
  BarChart3,
  AudioLines
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useTranslation } from '@/hooks/useTranslation';

// Funzione per tradurre le emozioni
const getEmotionTranslation = (emotion: string, language: string = 'it') => {
  const emotions: Record<string, Record<string, string>> = {
    it: {
      felice: 'Felice',
      calmo: 'Calmo',
      ansioso: 'Ansioso',
      eccitato: 'Eccitato',
      triste: 'Triste',
      aggressivo: 'Aggressivo',
      giocoso: 'Giocoso'
    },
    en: {
      felice: 'Happy',
      calmo: 'Calm',
      ansioso: 'Anxious',
      eccitato: 'Excited',
      triste: 'Sad',
      aggressivo: 'Aggressive',
      giocoso: 'Playful'
    },
    es: {
      felice: 'Alegre',
      calmo: 'Tranquilo',
      ansioso: 'Ansioso',
      eccitato: 'Emocionado',
      triste: 'Triste',
      aggressivo: 'Agresivo',
      giocoso: 'Juguetón'
    }
  };
  
  return emotions[language]?.[emotion.toLowerCase()] || emotion;
};
import { supabase } from '@/integrations/supabase/client';
import { usePets } from '@/contexts/PetContext';
import { getRecommendedProtocol, allProtocols } from '@/data/trainingProtocolsData';
import jsPDF from 'jspdf';
import AudioPlayer from './AudioPlayer';
import WeatherContextInfo from './WeatherContextInfo';

interface SharingTemplate {
  id: string;
  platform: string;
  content: string;
  template_name: string;
  is_active: boolean;
  variables: any;
}

interface AnalysisData {
  id: string;
  pet_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: Record<string, number>;
  behavioral_insights: string;
  recommendations: string[];
  triggers: string[];
  analysis_duration: unknown;
  created_at: string;
  updated_at: string;
}

interface AnalysisResultsProps {
  analyses: AnalysisData[];
  petName: string;
}

const EMOTION_COLORS: Record<string, string> = {
  felice: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  happy: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  alegre: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  calmo: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  calm: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  tranquilo: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  ansioso: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  anxious: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  ansioso_es: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  eccitato: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  excited: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  emocionado: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  triste: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  sad: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  aggressivo: 'text-red-500 bg-red-500/10 border-red-500/20',
  aggressive: 'text-red-500 bg-red-500/10 border-red-500/20',
  agresivo: 'text-red-500 bg-red-500/10 border-red-500/20',
  giocoso: 'text-green-500 bg-green-500/10 border-green-500/20',
  playful: 'text-green-500 bg-green-500/10 border-green-500/20',
  jugueton: 'text-green-500 bg-green-500/10 border-green-500/20'
};

const EMOTION_ICONS: Record<string, React.ReactNode> = {
  felice: '😊',
  happy: '😊',
  alegre: '😊',
  calmo: '😌',
  calm: '😌',
  tranquilo: '😌',
  ansioso: '😰',
  anxious: '😰',
  ansioso_es: '😰',
  eccitato: '🤩',
  excited: '🤩',
  emocionado: '🤩',
  triste: '😢',
  sad: '😢',
  aggressivo: '😠',
  aggressive: '😠',
  agresivo: '😠',
  giocoso: '😄',
  playful: '😄',
  jugueton: '😄'
};

// Genera playlist solo per emozioni negative che richiedono intervento
const getRecommendedPlaylist = (emotion: string, confidence: number) => {
  const emotionLower = emotion.toLowerCase();
  
  // Solo emozioni negative che richiedono musicoterapia
  const negativeEmotions = ['ansioso', 'stressato', 'triste', 'depresso', 'aggressivo', 'agitato', 'iperattivo', 'nervoso', 'irritato', 'pauroso'];
  
  if (!negativeEmotions.includes(emotionLower)) {
    return null; // Nessuna playlist necessaria per emozioni positive/neutre
  }
  
  switch (emotionLower) {
    case 'ansioso':
    case 'stressato':
      return {
        name: "Calma Profonda",
        description: "Frequenze specifiche per ridurre ansia e stress basate sull'analisi emotiva",
        frequency: "528Hz + 8Hz",
        duration: 25,
        reasoning: `Rilevato stato di ${emotion} con confidenza ${confidence}%`
      };

    case 'agitato':
    case 'iperattivo':
      return {
        name: "Relax Guidato", 
        description: "Sequenze per calmare l'iperattivazione basate sul profilo emotivo",
        frequency: "10-13Hz",
        duration: 20,
        reasoning: `Stato di agitazione rilevato - necessario rilassamento graduale`
      };

    case 'triste':
    case 'depresso':
      return {
        name: "Energia Positiva",
        description: "Stimolazione dolce per migliorare l'umore",
        frequency: "40Hz + 10Hz", 
        duration: 15,
        reasoning: `Umore basso rilevato - stimolazione energetica necessaria`
      };

    case 'aggressivo':
    case 'nervoso':
    case 'irritato':
      return {
        name: "Calma e Controllo",
        description: "Frequenze per ridurre aggressività e irritabilità",
        frequency: "432Hz + 8Hz",
        duration: 20,
        reasoning: `Comportamento aggressivo rilevato - necessario calmare`
      };

    case 'pauroso':
      return {
        name: "Sicurezza e Fiducia",
        description: "Frequenze per ridurre paura e aumentare fiducia",
        frequency: "528Hz + 40Hz",
        duration: 18,
        reasoning: `Paura rilevata - necessario aumentare sicurezza`
      };

    default:
      // Per altre emozioni negative non specificate
      return {
        name: "Equilibrio Generale",
        description: "Sessione bilanciata per stabilità emotiva",
        frequency: "528Hz + 10Hz",
        duration: 15,
        reasoning: `Stato emotivo negativo - necessario riequilibrio`
      };
  }
};

// Helper function to generate readable analysis names
const getReadableAnalysisName = (analysis: AnalysisData, language: string = 'it') => {
  const date = new Date(analysis.created_at);
  
  // Format date parts
  const day = format(date, 'dd', { locale: it });
  const month = format(date, 'MMMM', { locale: it });
  const time = format(date, 'HH:mm', { locale: it });
  
  // Get emotion translation
  const getEmotionTranslation = (emotion: string) => {
    const emotions: Record<string, Record<string, string>> = {
      it: {
        felice: 'Felice',
        calmo: 'Calmo',
        ansioso: 'Ansioso',
        eccitato: 'Eccitato',
        triste: 'Triste',
        aggressivo: 'Aggressivo',
        giocoso: 'Giocoso',
        rilassato: 'Rilassato'
      },
      en: {
        felice: 'Happy',
        calmo: 'Calm',
        ansioso: 'Anxious',
        eccitato: 'Excited',
        triste: 'Sad',
        aggressivo: 'Aggressive',
        giocoso: 'Playful',
        rilassato: 'Relaxed'
      },
      es: {
        felice: 'Alegre',
        calmo: 'Tranquilo',
        ansioso: 'Ansioso',
        eccitato: 'Emocionado',
        triste: 'Triste',
        aggressivo: 'Agresivo',
        giocoso: 'Juguetón',
        rilassato: 'Relajado'
      }
    };
    
    return emotions[language]?.[emotion.toLowerCase()] || emotion;
  };

  // Get type translation
  const getTypeTranslation = (type: string) => {
    const types: Record<string, Record<string, string>> = {
      it: {
        recording: 'Registrazione',
        analysis: 'Analisi'
      },
      en: {
        recording: 'Recording',
        analysis: 'Analysis'
      },
      es: {
        recording: 'Grabación',
        analysis: 'Análisis'
      }
    };
    
    return types[language]?.[type] || type;
  };
  
  const emotionName = getEmotionTranslation(analysis.primary_emotion);
  
  // Generate readable name based on file type
  if (analysis.file_type === 'text') {
    return `${getTypeTranslation('analysis')} ${emotionName} - ${day} ${month}`;
  } else {
    return `${getTypeTranslation('recording')} ${emotionName} - ${day} ${month} ${time}`;
  }
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
  const { t, language } = useTranslation();
  const { showToast } = useTranslatedToast();
  const { selectedPet } = usePets();

  // Helper function to translate hardcoded analysis data
  const translateAnalysisData = (text: string, type: 'insights' | 'recommendations' | 'triggers') => {
    // If the text looks like a translation key, return it as is
    if (text.startsWith('analysis.')) {
      return t(text);
    }
    
    // Translation mappings for hardcoded Italian content
    const translations: Record<string, Record<string, Record<string, string>>> = {
      insights: {
        it: {
          'Stato di rilassamento profondo con respirazione regolare e lenta': 'Stato di rilassamento profondo con respirazione regolare e lenta',
          'Comportamento calmo e rilassato': 'Comportamento calmo e rilassato',
          'Attività ridotta, posizione di riposo': 'Attività ridotta, posizione di riposo'
        },
        en: {
          'Stato di rilassamento profondo con respirazione regolare e lenta': 'Deep relaxation state with regular and slow breathing',
          'Comportamento calmo e rilassato': 'Calm and relaxed behavior',
          'Attività ridotta, posizione di riposo': 'Reduced activity, resting position'
        },
        es: {
          'Stato di rilassamento profondo con respirazione regolare e lenta': 'Estado de relajación profunda con respiración regular y lenta',
          'Comportamento calmo e rilassato': 'Comportamiento calmado y relajado',
          'Attività ridotta, posizione di riposo': 'Actividad reducida, posición de descanso'
        }
      },
      triggers: {
        it: {
          'Ambienti tranquilli con illuminazione soffusa': 'Ambienti tranquilli con illuminazione soffusa',
          'Routine rilassanti consolidate (massaggi, coccole)': 'Routine rilassanti consolidate (massaggi, coccole)'
        },
        en: {
          'Ambienti tranquilli con illuminazione soffusa': 'Quiet environments with soft lighting',
          'Routine rilassanti consolidate (massaggi, coccole)': 'Established relaxing routines (massages, cuddles)'
        },
        es: {
          'Ambienti tranquilli con illuminazione soffusa': 'Ambientes tranquilos con iluminación suave',
          'Routine rilassanti consolidate (massaggi, coccole)': 'Rutinas relajantes establecidas (masajes, mimos)'
        }
      },
      recommendations: {
        it: {},
        en: {},
        es: {}
      }
    };
    
    return translations[type]?.[language]?.[text] || text;
  };
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(
    analyses.length > 0 ? analyses[0] : null
  );
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedAnalyses, setComparedAnalyses] = useState<AnalysisData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [templates, setTemplates] = useState<SharingTemplate[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Traduzioni dirette per il componente
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      it: {
        // Existing translations
        noResults: 'Nessun Risultato',
        loadFile: 'Carica un file per vedere i risultati dell\'analisi',
        veryHigh: 'Molto Alta',
        high: 'Alta',
        medium: 'Media',
        low: 'Bassa',
        emotionalAnalysis: 'Analisi emotiva',
        analysisOf: 'Analisi del',
        primaryEmotion: 'Emozione primaria',
        confidence: 'confidenza',
        insights: 'Insights',
        recommendations: 'Raccomandazioni',
        identifiedTriggers: 'Trigger identificati',
        success: 'Successo!',
        addedSuccessfully: 'Analisi aggiunta al diario con successo!',
        cannotAdd: 'Impossibile aggiungere l\'analisi al diario',
        error: 'Errore',
        selectPet: 'Nessun pet selezionato',
        // New translations
        selectAnalysis: 'Seleziona Analisi',
        showResults: 'Mostra risultati per',
        recentAnalyses: 'analisi recenti',
        primaryEmotionCard: 'Emozione Primaria',
        confidenceLabel: 'Confidenza',
        fileLabel: 'File:',
        sizeLabel: 'Dimensione:',
        durationLabel: 'Durata analisi:',
        dateLabel: 'Data:',
        detailedAnalysis: 'Analisi Dettagliata',
        behavioralInsights: 'Insights comportamentali e raccomandazioni per',
        emotionsTab: 'Emozioni',
        insightsTab: 'Insights',
        adviceTab: 'Consigli',
        triggersTab: 'Trigger',
        audioTab: 'Audio',
        secondaryEmotions: 'Emozioni Secondarie',
        behavioralAnalysis: 'Analisi Comportamentale',
        environmentalContext: 'Contesto Ambientale',
        aiMusicTherapy: 'Playlist IA Music Therapy Consigliata',
        trainingProtocol: 'Protocollo di Training Raccomandato',
        personalizedRecommendations: 'Raccomandazioni Personalizzate',
        startMusicTherapy: 'Inizia Sessione Musicoterapia',
        startTrainingProtocol: 'Inizia Protocollo Training',
        share: 'Condividi',
        downloadReport: 'Scarica Report',
        addToDiary: 'Aggiungi al Diario',
        scheduleFollowUp: 'Pianifica Follow-up',
        compareAnalyses: 'Confronta Analisi',
        patternRecognition: 'Pattern Recognition',
        previousComparisons: 'Confronti con analisi precedenti',
        similarEpisode: 'Episodio Simile',
        confidenceVariation: 'Variazione Confidenza',
        lastAnalysis: 'Dall\'Ultima Analisi',
        emotionalConsistency: 'Consistenza Emotiva',
        petIsWell: 'sta bene!',
        positiveEmotionalState: 'Il tuo pet è in uno stato emotivo positivo!',
        emotionDetected: 'Emozione',
        detected: 'rilevata.',
        similarBehavior: 'Comportamento simile osservato il',
        withEmotion: 'con emozione',
        confidenceLevel: 'confidenza',
        daysSince: 'giorni',
        day: 'giorno',
        followUpScheduled: 'Follow-up Programmato',
        reminderCreated: 'Promemoria creato per il',
        inCalendar: 'nel calendario',
        cannotCreateReminder: 'Impossibile creare il promemoria nel calendario',
        reportGenerated: 'Report PDF Scaricato',
        reportSaved: 'Il report PDF è stato salvato come',
        cannotGenerateReport: 'Impossibile generare il report PDF',
        monitorTrigger: 'Monitora questo fattore per identificare pattern comportamentali',
        originalRecording: 'Registrazione Originale',
        notAudioFile: 'Questo file non è un audio. Player disponibile solo per registrazioni audio.',
        today: 'Oggi',
        // Additional translations for hardcoded content
        confidenceColon: 'Confidenza:',
        recording: 'Registrazione:',
        humidity: 'umidità',
        wind: 'vento',
        realEnvironmentalContext: 'Contesto Ambientale Reale:',
        moderate: 'moderato',
        moderateTraffic: 'Traffico moderato',
        highActivity: 'Attività alta',
        daylight: 'diurna',
        disturbancesDetected: 'Disturbi rilevati: ambiente silenzioso',
        analysisRecorded: 'Analisi registrata pomeriggio del',
        uvIndex: 'Indice UV:',
        environmentalConditions: 'Condizioni ambientali con disturbi moderati per l\'analisi comportamentale.',
        quietEnvironmentsSoftLighting: 'Ambienti tranquilli con illuminazione soffusa',
        consolidatedRelaxingRoutines: 'Routine rilassanti consolidate (massaggi, coccole)',
        // Training protocol names
        anxietySeparationManagement: 'Gestione Ansia da Separazione',
        aggressionControl: 'Controllo Aggressività',
        fearPhobiaOvercoming: 'Superamento Paure e Fobie',
        hyperactivityManagement: 'Gestione Iperattività',
        emotionalSupportWellness: 'Supporto Emotivo e Benessere',
        generalBehaviorManagement: 'Gestione Comportamento Generale',
        // Training protocol descriptions
        anxietyProtocolDesc: 'Protocollo specifico per ridurre l\'ansia da separazione e migliorare la fiducia nel pet.',
        aggressionProtocolDesc: 'Tecniche di controllo per gestire comportamenti aggressivi e reattivi.',
        fearProtocolDesc: 'Esercizi di desensibilizzazione per superare paure specifiche.',
        hyperactivityProtocolDesc: 'Attività per canalizzare l\'energia eccessiva in comportamenti positivi.',
        emotionalProtocolDesc: 'Supporto emotivo personalizzato per migliorare l\'umore e il benessere del pet.',
        generalProtocolDesc: 'Protocollo generale per migliorare il comportamento e il benessere complessivo.',
        // Training labels
        days: 'giorni',
        level: 'Livello:',
        basedOn: 'Basato su:',
        variable: 'Variabile',
        personalized: 'Personalizzato',
        difficult: 'Difficile',
        // Health and recommendations
        healthConditions: 'Condizioni di salute:',
        healthAdvice: 'Monitora attentamente i segni di stress durante il training. Consulta il veterinario prima di iniziare protocolli intensivi.',
        forEmotion: 'Per l\'emozione',
        recommendedFrequency: 'Frequenza raccomandata:',
        shortSessions23: '2-3 sessioni brevi al giorno',
        sessions12: '1-2 sessioni al giorno',
        session1: '1 sessione al giorno per evitare sovrastimolazione',
        // Emotion-specific advice
        anxietyAdvice: 'Crea un ambiente sicuro e prevedibile. Evita cambiamenti bruschi nella routine.',
        aggressionAdvice: 'Mantieni calma e distanza di sicurezza. Usa rinforzi positivi, mai punizioni.',
        fearAdvice: 'Desensibilizzazione graduale. Non forzare l\'esposizione, procedi con pazienza.',
        sadnessAdvice: 'Aumenta attività gratificanti e interazioni sociali positive.',
        generalAdvice: 'Mantieni coerenza nel training e celebra ogni piccolo progresso.',
        // Comparison modal
        emotionalAnalysisComparison: 'Confronto Analisi Emotive',
        comparativeAnalysisOf: 'Analisi comparativa di',
        results: 'risultati',
        comparedAnalyses: 'Analisi Confrontate',
        analyzedPeriod: 'Periodo Analizzato',
        averageConfidence: 'Confidenza Media',
        secondaryEmotionsShort: 'Emozioni Secondarie',
        insightsShort: 'Insights',
        analysis: 'Analisi',
        shareAnalysisTitle: 'Condividi Analisi',
        shareAnalysisDescription: 'Scegli come condividere i risultati dell\'analisi di',
        facebook: 'Facebook',
        twitter: 'Twitter',
        whatsapp: 'WhatsApp',
        email: 'Email'
      },
      en: {
        // Existing translations
        noResults: 'No Results',
        loadFile: 'Load a file to see analysis results',
        veryHigh: 'Very High',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        emotionalAnalysis: 'Emotional Analysis',
        analysisOf: 'Analysis of',
        primaryEmotion: 'Primary emotion',
        confidence: 'confidence',
        insights: 'Insights',
        recommendations: 'Recommendations',
        identifiedTriggers: 'Identified triggers',
        success: 'Success!',
        addedSuccessfully: 'Analysis added to diary successfully!',
        cannotAdd: 'Unable to add analysis to diary',
        error: 'Error',
        selectPet: 'No pet selected',
        // New translations
        selectAnalysis: 'Select Analysis',
        showResults: 'Show results for',
        recentAnalyses: 'recent analyses',
        primaryEmotionCard: 'Primary Emotion',
        confidenceLabel: 'Confidence',
        fileLabel: 'File:',
        sizeLabel: 'Size:',
        durationLabel: 'Analysis duration:',
        dateLabel: 'Date:',
        detailedAnalysis: 'Detailed Analysis',
        behavioralInsights: 'Behavioral insights and recommendations for',
        emotionsTab: 'Emotions',
        insightsTab: 'Insights',
        adviceTab: 'Advice',
        triggersTab: 'Triggers',
        audioTab: 'Audio',
        secondaryEmotions: 'Secondary Emotions',
        behavioralAnalysis: 'Behavioral Analysis',
        environmentalContext: 'Environmental Context',
        aiMusicTherapy: 'AI Music Therapy Playlist Recommended',
        trainingProtocol: 'Recommended Training Protocol',
        personalizedRecommendations: 'Personalized Recommendations',
        startMusicTherapy: 'Start Music Therapy Session',
        startTrainingProtocol: 'Start Training Protocol',
        share: 'Share',
        downloadReport: 'Download Report',
        addToDiary: 'Add to Diary',
        scheduleFollowUp: 'Schedule Follow-up',
        compareAnalyses: 'Compare Analyses',
        patternRecognition: 'Pattern Recognition',
        previousComparisons: 'Comparisons with previous analyses',
        similarEpisode: 'Similar Episode',
        confidenceVariation: 'Confidence Variation',
        lastAnalysis: 'From Last Analysis',
        emotionalConsistency: 'Emotional Consistency',
        petIsWell: 'is well!',
        positiveEmotionalState: 'Your pet is in a positive emotional state!',
        emotionDetected: 'Emotion',
        detected: 'detected.',
        similarBehavior: 'Similar behavior observed on',
        withEmotion: 'with emotion',
        confidenceLevel: 'confidence',
        daysSince: 'days',
        day: 'day',
        followUpScheduled: 'Follow-up Scheduled',
        reminderCreated: 'Reminder created for',
        inCalendar: 'in calendar',
        cannotCreateReminder: 'Unable to create calendar reminder',
        reportGenerated: 'PDF Report Downloaded',
        reportSaved: 'PDF report has been saved as',
        cannotGenerateReport: 'Unable to generate PDF report',
        monitorTrigger: 'Monitor this factor to identify behavioral patterns',
        originalRecording: 'Original Recording',
        notAudioFile: 'This file is not audio. Player available only for audio recordings.',
        today: 'Today',
        // Additional translations for hardcoded content
        confidenceColon: 'Confidence:',
        recording: 'Recording:',
        humidity: 'humidity',
        wind: 'wind',
        realEnvironmentalContext: 'Real Environmental Context:',
        moderate: 'moderate',
        moderateTraffic: 'Moderate traffic',
        highActivity: 'High activity',
        daylight: 'daylight',
        disturbancesDetected: 'Disturbances detected: quiet environment',
        analysisRecorded: 'Analysis recorded afternoon of',
        uvIndex: 'UV Index:',
        environmentalConditions: 'Environmental conditions with moderate disturbances for behavioral analysis.',
        quietEnvironmentsSoftLighting: 'Quiet environments with soft lighting',
        consolidatedRelaxingRoutines: 'Consolidated relaxing routines (massages, cuddles)',
        // Training protocol names
        anxietySeparationManagement: 'Separation Anxiety Management',
        aggressionControl: 'Aggression Control',
        fearPhobiaOvercoming: 'Fear and Phobia Overcoming',
        hyperactivityManagement: 'Hyperactivity Management',
        emotionalSupportWellness: 'Emotional Support and Wellness',
        generalBehaviorManagement: 'General Behavior Management',
        // Training protocol descriptions
        anxietyProtocolDesc: 'Specific protocol to reduce separation anxiety and improve pet confidence.',
        aggressionProtocolDesc: 'Control techniques to manage aggressive and reactive behaviors.',
        fearProtocolDesc: 'Desensitization exercises to overcome specific fears.',
        hyperactivityProtocolDesc: 'Activities to channel excessive energy into positive behaviors.',
        emotionalProtocolDesc: 'Personalized emotional support to improve pet mood and wellness.',
        generalProtocolDesc: 'General protocol to improve behavior and overall wellness.',
        // Training labels
        days: 'days',
        level: 'Level:',
        basedOn: 'Based on:',
        variable: 'Variable',
        personalized: 'Personalized',
        difficult: 'Difficult',
        // Health and recommendations
        healthConditions: 'Health conditions:',
        healthAdvice: 'Carefully monitor signs of stress during training. Consult veterinarian before starting intensive protocols.',
        forEmotion: 'For emotion',
        recommendedFrequency: 'Recommended frequency:',
        shortSessions23: '2-3 short sessions per day',
        sessions12: '1-2 sessions per day',
        session1: '1 session per day to avoid overstimulation',
        // Emotion-specific advice
        anxietyAdvice: 'Create a safe and predictable environment. Avoid sudden routine changes.',
        aggressionAdvice: 'Stay calm and maintain safe distance. Use positive reinforcement, never punishment.',
        fearAdvice: 'Gradual desensitization. Don\'t force exposure, proceed with patience.',
        sadnessAdvice: 'Increase gratifying activities and positive social interactions.',
        generalAdvice: 'Maintain consistency in training and celebrate every small progress.',
        // Comparison modal
        emotionalAnalysisComparison: 'Emotional Analysis Comparison',
        comparativeAnalysisOf: 'Comparative analysis of',
        results: 'results',
        comparedAnalyses: 'Compared Analyses',
        analyzedPeriod: 'Analyzed Period',
        averageConfidence: 'Average Confidence',
        secondaryEmotionsShort: 'Secondary Emotions',
        insightsShort: 'Insights',
        analysis: 'Analysis',
        shareAnalysisTitle: 'Share Analysis',
        shareAnalysisDescription: 'Choose how to share the analysis results of',
        facebook: 'Facebook',
        twitter: 'Twitter',
        whatsapp: 'WhatsApp',
        email: 'Email'
      },
      es: {
        // Existing translations
        noResults: 'Sin Resultados',
        loadFile: 'Carga un archivo para ver los resultados del análisis',
        veryHigh: 'Muy Alta',
        high: 'Alta',
        medium: 'Media',
        low: 'Baja',
        emotionalAnalysis: 'Análisis Emocional',
        analysisOf: 'Análisis del',
        primaryEmotion: 'Emoción primaria',
        confidence: 'confianza',
        insights: 'Información',
        recommendations: 'Recomendaciones',
        identifiedTriggers: 'Desencadenantes identificados',
        success: '¡Éxito!',
        addedSuccessfully: '¡Análisis agregado al diario exitosamente!',
        cannotAdd: 'No se puede agregar el análisis al diario',
        error: 'Error',
        selectPet: 'Ninguna mascota seleccionada',
        // New translations
        selectAnalysis: 'Seleccionar Análisis',
        showResults: 'Mostrar resultados para',
        recentAnalyses: 'análisis recientes',
        primaryEmotionCard: 'Emoción Primaria',
        confidenceLabel: 'Confianza',
        fileLabel: 'Archivo:',
        sizeLabel: 'Tamaño:',
        durationLabel: 'Duración del análisis:',
        dateLabel: 'Fecha:',
        detailedAnalysis: 'Análisis Detallado',
        behavioralInsights: 'Información del comportamiento y recomendaciones para',
        emotionsTab: 'Emociones',
        insightsTab: 'Información',
        adviceTab: 'Consejos',
        triggersTab: 'Desencadenantes',
        audioTab: 'Audio',
        secondaryEmotions: 'Emociones Secundarias',
        behavioralAnalysis: 'Análisis del Comportamiento',
        environmentalContext: 'Contexto Ambiental',
        aiMusicTherapy: 'Playlist de Musicoterapia IA Recomendada',
        trainingProtocol: 'Protocolo de Entrenamiento Recomendado',
        personalizedRecommendations: 'Recomendaciones Personalizadas',
        startMusicTherapy: 'Iniciar Sesión de Musicoterapia',
        startTrainingProtocol: 'Iniciar Protocolo de Entrenamiento',
        share: 'Compartir',
        downloadReport: 'Descargar Reporte',
        addToDiary: 'Agregar al Diario',
        scheduleFollowUp: 'Programar Seguimiento',
        compareAnalyses: 'Comparar Análisis',
        patternRecognition: 'Reconocimiento de Patrones',
        previousComparisons: 'Comparaciones con análisis anteriores',
        similarEpisode: 'Episodio Similar',
        confidenceVariation: 'Variación de Confianza',
        lastAnalysis: 'Desde el Último Análisis',
        emotionalConsistency: 'Consistencia Emocional',
        petIsWell: '¡está bien!',
        positiveEmotionalState: '¡Tu mascota está en un estado emocional positivo!',
        emotionDetected: 'Emoción',
        detected: 'detectada.',
        similarBehavior: 'Comportamiento similar observado el',
        withEmotion: 'con emoción',
        confidenceLevel: 'confianza',
        daysSince: 'días',
        day: 'día',
        followUpScheduled: 'Seguimiento Programado',
        reminderCreated: 'Recordatorio creado para el',
        inCalendar: 'en el calendario',
        cannotCreateReminder: 'No se puede crear el recordatorio del calendario',
        reportGenerated: 'Reporte PDF Descargado',
        reportSaved: 'El reporte PDF se ha guardado como',
        cannotGenerateReport: 'No se puede generar el reporte PDF',
        monitorTrigger: 'Monitorear este factor para identificar patrones de comportamiento',
        originalRecording: 'Grabación Original',
        notAudioFile: 'Este archivo no es audio. Reproductor disponible solo para grabaciones de audio.',
        today: 'Hoy',
        // Additional translations for hardcoded content
        confidenceColon: 'Confianza:',
        recording: 'Grabación:',
        humidity: 'humedad',
        wind: 'viento',
        realEnvironmentalContext: 'Contexto Ambiental Real:',
        moderate: 'moderado',
        moderateTraffic: 'Tráfico moderado',
        highActivity: 'Actividad alta',
        daylight: 'diurna',
        disturbancesDetected: 'Perturbaciones detectadas: ambiente silencioso',
        analysisRecorded: 'Análisis registrado tarde del',
        uvIndex: 'Índice UV:',
        environmentalConditions: 'Condiciones ambientales con perturbaciones moderadas para el análisis conductual.',
        quietEnvironmentsSoftLighting: 'Ambientes tranquilos con iluminación suave',
        consolidatedRelaxingRoutines: 'Rutinas relajantes consolidadas (masajes, mimos)',
        // Training protocol names
        anxietySeparationManagement: 'Gestión de Ansiedad por Separación',
        aggressionControl: 'Control de Agresión',
        fearPhobiaOvercoming: 'Superación de Miedos y Fobias',
        hyperactivityManagement: 'Gestión de Hiperactividad',
        emotionalSupportWellness: 'Apoyo Emocional y Bienestar',
        generalBehaviorManagement: 'Gestión General del Comportamiento',
        // Training protocol descriptions
        anxietyProtocolDesc: 'Protocolo específico para reducir la ansiedad por separación y mejorar la confianza de la mascota.',
        aggressionProtocolDesc: 'Técnicas de control para manejar comportamientos agresivos y reactivos.',
        fearProtocolDesc: 'Ejercicios de desensibilización para superar miedos específicos.',
        hyperactivityProtocolDesc: 'Actividades para canalizar la energía excesiva en comportamientos positivos.',
        emotionalProtocolDesc: 'Apoyo emocional personalizado para mejorar el estado de ánimo y bienestar de la mascota.',
        generalProtocolDesc: 'Protocolo general para mejorar el comportamiento y bienestar general.',
        // Training labels
        days: 'días',
        level: 'Nivel:',
        basedOn: 'Basado en:',
        variable: 'Variable',
        personalized: 'Personalizado',
        difficult: 'Difícil',
        // Health and recommendations
        healthConditions: 'Condiciones de salud:',
        healthAdvice: 'Monitore cuidadosamente los signos de estrés durante el entrenamiento. Consulte al veterinario antes de comenzar protocolos intensivos.',
        forEmotion: 'Para la emoción',
        recommendedFrequency: 'Frecuencia recomendada:',
        shortSessions23: '2-3 sesiones cortas por día',
        sessions12: '1-2 sesiones por día',
        session1: '1 sesión por día para evitar sobreestimulación',
        // Emotion-specific advice
        anxietyAdvice: 'Crear un ambiente seguro y predecible. Evitar cambios bruscos en la rutina.',
        aggressionAdvice: 'Mantener la calma y distancia de seguridad. Usar refuerzo positivo, nunca castigo.',
        fearAdvice: 'Desensibilización gradual. No forzar la exposición, proceder con paciencia.',
        sadnessAdvice: 'Aumentar actividades gratificantes e interacciones sociales positivas.',
        generalAdvice: 'Mantener consistencia en el entrenamiento y celebrar cada pequeño progreso.',
        // Comparison modal
        emotionalAnalysisComparison: 'Comparación de Análisis Emocional',
        comparativeAnalysisOf: 'Análisis comparativo de',
        results: 'resultados',
        comparedAnalyses: 'Análisis Comparados',
        analyzedPeriod: 'Período Analizado',
        averageConfidence: 'Confianza Promedio',
        secondaryEmotionsShort: 'Emociones Secundarias',
        insightsShort: 'Información',
        analysis: 'Análisis',
        shareAnalysisTitle: 'Compartir Análisis',
        shareAnalysisDescription: 'Elige cómo compartir los resultados del análisis de',
        facebook: 'Facebook',
        twitter: 'Twitter',
        whatsapp: 'WhatsApp',
        email: 'Correo'
      }
    };
    return texts[language]?.[key] || texts.it[key] || key;
  };

  // Seleziona la prima analisi solo se non c'è nessuna selezione
  useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysis) {
      setSelectedAnalysis(analyses[0]); // Solo se non c'è già una selezione
    }
  }, [analyses, selectedAnalysis]);

  useEffect(() => {
    loadSharingTemplates();
  }, []);

  const loadSharingTemplates = async () => {
    try {
      const { data: templateData } = await supabase
        .from('sharing_templates')
        .select('*')
        .eq('is_active', true);
      
      setTemplates(templateData || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  if (analyses.length === 0) {
    return (
      <Card className="text-center p-8">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">{getText('noResults')}</h3>
        <p className="text-muted-foreground">
          {getText('loadFile')}
        </p>
      </Card>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return getText('veryHigh');
    if (confidence >= 75) return getText('high'); 
    if (confidence >= 60) return getText('medium');
    return getText('low');
  };

  const addToDiary = async (analysis: AnalysisData) => {
    if (!selectedPet) {
      showToast({
        title: getText('error'),
        description: getText('selectPet'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Create diary entry with analysis data
      const emotionTranslation = getEmotionTranslation(analysis.primary_emotion, language);
      const diaryData = {
        title: `${getText('emotionalAnalysis')} - ${emotionTranslation}`,
        content: `${getText('analysisOf')} ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}:\n\n${getText('primaryEmotion')}: ${emotionTranslation} (${Math.round(analysis.primary_confidence * 100)}% ${getText('confidence')})\n\n${getText('insights')}: ${analysis.behavioral_insights}\n\n${getText('recommendations')}:\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n${getText('identifiedTriggers')}: ${analysis.triggers.join(', ')}`,
        mood_score: analysis.primary_emotion === 'felice' ? 8 : 
                   analysis.primary_emotion === 'calmo' ? 7 : 
                   analysis.primary_emotion === 'triste' ? 3 : 
                   analysis.primary_emotion === 'ansioso' ? 4 : 5,
        behavioral_tags: [analysis.primary_emotion, ...Object.keys(analysis.secondary_emotions)],
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        pet_id: selectedPet.id,
        user_id: selectedPet.user_id
      };

      const { error } = await supabase
        .from('diary_entries')
        .insert(diaryData);

      if (error) throw error;
      
      showToast({
        title: getText('success'),
        description: getText('addedSuccessfully'),
      });
    } catch (error) {
      console.error('Error adding to diary:', error);
      showToast({
        title: getText('error'),
        description: getText('cannotAdd'),
        variant: "destructive"
      });
    }
  };

  const scheduleFollowUp = async (analysis: AnalysisData) => {
      if (!selectedPet) {
        showToast({
          title: getText('error'),
          description: getText('selectPet'),
          variant: "destructive"
        });
        return;
      }

    try {
      // Calculate suggested follow-up date (7 days from now)
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);
      
      // Create calendar event for follow-up
      const eventData = {
        title: `Follow-up analisi emotiva - ${petName}`,
        description: `Controllo comportamentale programmato dopo l'analisi del ${format(new Date(analysis.created_at), 'dd/MM/yyyy', { locale: it })}.\n\nEmozione rilevata: ${analysis.primary_emotion} (${Math.round(analysis.primary_confidence * 100)}% confidenza)\n\nNote: Verificare il comportamento e l'umore del pet, confrontare con i risultati precedenti.`,
        start_time: followUpDate.toISOString(),
        end_time: new Date(followUpDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        category: 'behavioral_check',
        pet_id: selectedPet.id,
        user_id: selectedPet.user_id,
        notes: `Analisi di riferimento: ${analysis.id}\nRaccomandazioni da verificare: ${analysis.recommendations.slice(0, 2).join(', ')}`
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert(eventData);

      if (error) throw error;

      showToast({
        title: getText('followUpScheduled'),
        description: `${getText('reminderCreated')} ${format(followUpDate, 'dd/MM/yyyy HH:mm', { locale: it })} ${getText('inCalendar')}`,
      });
    } catch (error) {
      console.error('Error creating follow-up event:', error);
      showToast({
        title: getText('error'),
        description: getText('cannotCreateReminder'),
        variant: "destructive"
      });
    }
  };

  const shareToSocial = (platform: string, template: SharingTemplate, analysis: AnalysisData) => {
    if (!selectedPet) return;

    let content = template.content;
    const currentUrl = window.location.href;
    
    // Replace variables in template
    content = content.replace(/\{\{pet_name\}\}/g, petName);
    content = content.replace(/\{\{emotion\}\}/g, analysis.primary_emotion);
    content = content.replace(/\{\{confidence\}\}/g, analysis.primary_confidence.toString());
    content = content.replace(/\{\{insights\}\}/g, analysis.behavioral_insights);
    content = content.replace(/\{\{url\}\}/g, currentUrl);

    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(content)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
        break;
      case 'instagram':
        // Instagram web interface
        shareUrl = `https://www.instagram.com/`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(content)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const shareAnalysis = (analysis: AnalysisData) => {
    setShareDialogOpen(true);
  };

  const downloadReport = (analysis: AnalysisData) => {
    try {
      const pdf = new jsPDF();
      
      // Set font
      pdf.setFont('helvetica', 'normal');
      
      let yPosition = 20;
      const lineHeight = 7;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        if (text.length > 60) {
          const lines = pdf.splitTextToSize(text, contentWidth);
          lines.forEach((line: string) => {
            if (yPosition > 270) {
              pdf.addPage();
              yPosition = 20;
            }
            pdf.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        } else {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(text, margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 3; // Extra spacing
      };

      // Title
      addText(`REPORT ANALISI EMOTIVA - ${petName.toUpperCase()}`, 16, true);
      yPosition += 5;
      
      // Header info
      addText(`Data Analisi: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}`, 10);
      addText(`File Analizzato: ${getReadableAnalysisName(analysis, language)}`, 10);
      addText(`Dimensione File: ${formatFileSize(analysis.file_size)}`, 10);
      addText(`Durata Analisi: ${String(analysis.analysis_duration)}`, 10);
      yPosition += 10;

      // Primary results
      addText('RISULTATI PRIMARI', 14, true);
      addText(`Emozione Principale: ${analysis.primary_emotion.toUpperCase()}`, 12);
      addText(`Livello di Confidenza: ${Math.round(analysis.primary_confidence * 100)}% (${getConfidenceLabel(Math.round(analysis.primary_confidence * 100))})`, 12);
      yPosition += 10;

      // Secondary emotions
      addText('EMOZIONI SECONDARIE', 14, true);
      Object.entries(analysis.secondary_emotions).forEach(([emotion, confidence]) => {
        addText(`${emotion}: ${confidence}%`, 10);
      });
      yPosition += 10;

      // Behavioral insights
      addText(getText('behavioralAnalysis').toUpperCase(), 14, true);
      addText(analysis.behavioral_insights, 10);
      yPosition += 10;

      // Recommendations
      addText('RACCOMANDAZIONI', 14, true);
      analysis.recommendations.forEach((recommendation, index) => {
        addText(`${index + 1}. ${recommendation}`, 10);
      });
      yPosition += 10;

      // Triggers
      if (analysis.triggers && analysis.triggers.length > 0) {
        addText(getText('identifiedTriggers').toUpperCase(), 14, true);
        analysis.triggers.forEach((trigger, index) => {
          addText(`• ${trigger}`, 10);
        });
        yPosition += 10;
      }

      // Footer
      addText(`Report generato il ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}`, 8);
      addText('PetVoice - Analisi Emotiva Avanzata', 8);

      // Save the PDF
      const fileName = `analisi-emotiva-${petName}-${format(new Date(analysis.created_at), 'yyyy-MM-dd-HHmm')}.pdf`;
      pdf.save(fileName);
      
      showToast({
        title: getText('reportGenerated'),
        description: `${getText('reportSaved')} ${fileName}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast({
        title: getText('error'),
        description: getText('cannotGenerateReport'),
        variant: "destructive"
      });
    }
  };

  if (!selectedAnalysis) return null;

  return (
    <div className="space-y-6">
      {/* Analysis Selector */}
      {analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{getText('selectAnalysis')}</CardTitle>
            <CardDescription>
              {getText('showResults')} {analyses.length} {getText('recentAnalyses')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analyses.map((analysis) => (
                <Button
                  key={analysis.id}
                  variant={selectedAnalysis.id === analysis.id ? "default" : "outline"}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className="h-auto p-3 justify-start"
                >
                  <div className="flex items-center gap-3">
                    {analysis.file_type.startsWith('audio/') ? (
                      <FileAudio className="h-5 w-5" />
                    ) : (
                      <FileVideo className="h-5 w-5" />
                    )}
                    <div className="text-left">
                      <p className="font-medium truncate max-w-32">{getReadableAnalysisName(analysis, language)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(analysis.created_at), 'dd/MM HH:mm', { locale: it })}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Emotion */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {getText('primaryEmotionCard')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-2">
                {EMOTION_ICONS[selectedAnalysis.primary_emotion] || '🤔'}
              </div>
              <Badge 
                className={cn(
                  "text-lg py-2 px-4 mb-3",
                  EMOTION_COLORS[selectedAnalysis.primary_emotion] || 'text-gray-500 bg-gray-500/10'
                )}
              >
                {getEmotionTranslation(selectedAnalysis.primary_emotion, language)}
              </Badge>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{getText('confidenceLabel')}</span>
                  <span className={getConfidenceColor(Math.round(selectedAnalysis.primary_confidence * 100))}>
                    {getConfidenceLabel(Math.round(selectedAnalysis.primary_confidence * 100))}
                  </span>
                </div>
                <Progress value={Math.round(selectedAnalysis.primary_confidence * 100)} className="h-3" />
                <p className="text-2xl font-bold">
                  {Math.round(selectedAnalysis.primary_confidence * 100)}%
                </p>
              </div>
            </div>

            {/* File Info */}
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getText('fileLabel')}</span>
                <span className="font-medium truncate max-w-32" title={getReadableAnalysisName(selectedAnalysis, language)}>
                  {getReadableAnalysisName(selectedAnalysis, language)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getText('sizeLabel')}</span>
                <span>{formatFileSize(selectedAnalysis.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getText('durationLabel')}</span>
                <span>{String(selectedAnalysis.analysis_duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getText('dateLabel')}</span>
                <span>{format(new Date(selectedAnalysis.created_at), 'dd/MM/yy HH:mm', { locale: it })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{getText('detailedAnalysis')}</CardTitle>
            <CardDescription>
              {getText('behavioralInsights')} {petName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="emotions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="emotions">{getText('emotionsTab')}</TabsTrigger>
                <TabsTrigger value="insights">{getText('insightsTab')}</TabsTrigger>
                <TabsTrigger value="recommendations">{getText('adviceTab')}</TabsTrigger>
                <TabsTrigger value="triggers">{getText('triggersTab')}</TabsTrigger>
                <TabsTrigger value="audio">{getText('audioTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {getText('secondaryEmotions')}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedAnalysis.secondary_emotions).map(([emotion, confidence]) => (
                      <div key={emotion} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{EMOTION_ICONS[emotion] || '🔹'}</span>
                            {getEmotionTranslation(emotion, language)}
                          </span>
                          <span className="font-medium">{confidence}%</span>
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Brain className="h-4 w-4" />
                    {getText('behavioralAnalysis')}
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    {translateAnalysisData(selectedAnalysis.behavioral_insights, 'insights')}
                  </p>
                </div>

                {/* Environmental Context */}
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Zap className="h-4 w-4" />
                    {getText('environmentalContext')}
                  </h4>
                  <WeatherContextInfo analysisDate={selectedAnalysis.created_at} />
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">

                {/* AI Music Therapy Recommendations - Solo per emozioni negative */}
                {(() => {
                  const playlist = getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence);
                  if (!playlist) {
                    return (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <Heart className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-green-800 dark:text-green-200 mb-1">
                              ✨ {petName} {getText('petIsWell')}
                            </h5>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {getText('emotionDetected')} "{getEmotionTranslation(selectedAnalysis.primary_emotion, language)}" {getText('detected')} {getText('positiveEmotionalState')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AudioLines className="h-4 w-4" />
                        {getText('aiMusicTherapy')}
                      </h4>
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <AudioLines className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                              {playlist.name}
                            </h5>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                              {playlist.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-purple-600 dark:text-purple-400 mb-3">
                              <span>🎵 {playlist.frequency}</span>
                              <span>⏱️ {playlist.duration} min</span>
                              <span>🎯 {getText('confidenceColon')} {Math.round(selectedAnalysis.primary_confidence * 100)}%</span>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => {
                                const playlistData = encodeURIComponent(JSON.stringify({
                                  ...playlist,
                                  emotion: selectedAnalysis.primary_emotion,
                                  confidence: Math.round(selectedAnalysis.primary_confidence * 100),
                                  autoStart: true
                                }));
                                const url = `/ai-music-therapy?petId=${selectedPet?.id}&playlist=${playlistData}&autoStart=true`;
                                console.log('DEBUG - Generated URL:', url);
                                console.log('DEBUG - Playlist data:', playlist);
                                window.location.href = url;
                              }}
                            >
                              <AudioLines className="h-3 w-3 mr-1" />
                              {getText('startMusicTherapy')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Training Protocol Recommendation - Solo per risultati negativi */}
                {(() => {
                  const negativeEmotions = [
                    'ansia', 'ansioso', 
                    'paura', 'pauroso', 'spaventato', 'terrorizzato',
                    'stress', 'stressato', 
                    'aggressività', 'aggressivo', 'arrabbiato', 'rabbioso',
                    'tristezza', 'triste', 'melanconico', 
                    'depressione', 'depresso', 'abbattuto',
                    'agitazione', 'agitato', 'nervoso', 'irrequieto',
                    'frustrato', 'irritato', 'preoccupato', 'inquieto',
                    'dolore', 'sofferente', 'malessere'
                  ];
                  const isNegativeEmotion = negativeEmotions.some(emotion => 
                    selectedAnalysis.primary_emotion.toLowerCase().includes(emotion)
                  );
                  
                  if (isNegativeEmotion) {
                    return (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          {getText('trainingProtocol')}
                        </h4>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                              <Target className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                                {(() => {
                                  const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                  
                                  if (emotion.includes('ansia') || emotion.includes('ansioso') || 
                                      emotion.includes('stress') || emotion.includes('stressato') ||
                                      emotion.includes('preoccupato') || emotion.includes('inquieto')) {
                                    return getText('anxietySeparationManagement');
                                  } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                             emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                             emotion.includes('irritato')) {
                                    return getText('aggressionControl');
                                  } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                             emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                    return getText('fearPhobiaOvercoming');
                                  } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                             emotion.includes('nervoso') || emotion.includes('irrequieto')) {
                                    return getText('hyperactivityManagement');
                                  } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                             emotion.includes('depresso') || emotion.includes('depressione') ||
                                             emotion.includes('abbattuto') || emotion.includes('melanconico')) {
                                    return getText('emotionalSupportWellness');
                                  } else {
                                    return getText('generalBehaviorManagement');
                                  }
                                })()}
                              </h5>
                               <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                 {(() => {
                                   const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                   
                                   if (emotion.includes('ansia') || emotion.includes('ansioso') || 
                                       emotion.includes('stress') || emotion.includes('stressato') ||
                                       emotion.includes('preoccupato') || emotion.includes('inquieto')) {
                                      return getText('anxietyProtocolDesc');
                                    } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                               emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                               emotion.includes('irritato')) {
                                      return getText('aggressionProtocolDesc');
                                    } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                               emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                      return getText('fearProtocolDesc');
                                    } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                               emotion.includes('nervoso') || emotion.includes('irrequieto')) {
                                      return getText('hyperactivityProtocolDesc');
                                    } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                               emotion.includes('depresso') || emotion.includes('depressione') ||
                                               emotion.includes('abbattuto') || emotion.includes('melanconico')) {
                                      return getText('emotionalProtocolDesc');
                                    } else {
                                      return getText('generalProtocolDesc');
                                   }
                                 })()}
                              </p>
                               <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400 mb-3">
                                 {(() => {
                                   const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                   
                                   // Dati reali dei protocolli dal database
                                   if (emotion.includes('ansia') || emotion.includes('ansioso') || 
                                       emotion.includes('stress') || emotion.includes('stressato') ||
                                       emotion.includes('preoccupato') || emotion.includes('inquieto')) {
                                     return (
                                       <>
                                          <span>📅 3 {getText('days')}</span>
                                          <span>🎯 {getText('level')} {getText('medium')}</span>
                                          <span>📊 {getText('basedOn')} {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                              emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                              emotion.includes('irritato')) {
                                     return (
                                       <>
                                          <span>📅 3 {getText('days')}</span>
                                          <span>🎯 {getText('level')} {getText('difficult')}</span>
                                          <span>📊 {getText('basedOn')} {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                              emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                     return (
                                       <>
                                          <span>📅 42 {getText('days')}</span>
                                          <span>🎯 {getText('level')} {getText('difficult')}</span>
                                          <span>📊 {getText('basedOn')} {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                              emotion.includes('nervoso') || emotion.includes('irrequieto')) {
                                     return (
                                       <>
                                          <span>📅 28 {getText('days')}</span>
                                          <span>🎯 {getText('level')} {getText('medium')}</span>
                                          <span>📊 {getText('basedOn')} {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                              emotion.includes('depresso') || emotion.includes('depressione') ||
                                              emotion.includes('abbattuto') || emotion.includes('melanconico')) {
                                     return (
                                       <>
                                          <span>📅 28 {getText('days')}</span>
                                          <span>🎯 {getText('level')} {getText('medium')}</span>
                                          <span>📊 {getText('basedOn')} {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else {
                                     return (
                                       <>
                                          <span>📅 {getText('variable')}</span>
                                          <span>🎯 {getText('level')} {getText('personalized')}</span>
                                          <span>📊 {getText('basedOn')} {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   }
                                 })()}
                               </div>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={async () => {
                                    const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                    let protocolId = '';
                                    
                                    // Mappa l'emozione al protocollo ID corretto dal database (IDs aggiornati)
                                    if (emotion.includes('ansia') || emotion.includes('ansioso') || 
                                        emotion.includes('stress') || emotion.includes('stressato') ||
                                        emotion.includes('preoccupato') || emotion.includes('inquieto')) {
                                      protocolId = 'd19a882e-db8b-47f4-b760-371379f0a7ad'; // Gestione Ansia da Separazione
                                    } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                               emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                               emotion.includes('irritato')) {
                                      protocolId = 'abe1baef-06fe-4850-aaf6-1defa06a2dff'; // Controllo Aggressività Reattiva
                                    } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                               emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                      protocolId = '12a29252-4ef5-4564-b943-46377ac252f9'; // Superare Fobie e Paure Specifiche
                                    } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                               emotion.includes('nervoso') || emotion.includes('irrequieto') ||
                                               emotion.includes('iperattiv')) {
                                      protocolId = 'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f'; // Gestione Iperattività e Deficit Attenzione
                                    } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                               emotion.includes('depresso') || emotion.includes('depressione') ||
                                               emotion.includes('abbattuto') || emotion.includes('melanconico') ||
                                               emotion.includes('apatico') || emotion.includes('letargico')) {
                                      protocolId = '14b93624-bc7d-4bfd-9484-b4811880838c'; // Riattivazione Energia e Motivazione
                                    } else if (emotion.includes('timido') || emotion.includes('insicuro') ||
                                               emotion.includes('riservato') || emotion.includes('introverso')) {
                                      protocolId = '1ece2f5b-29cf-4f36-9987-26523a96e3f6'; // Socializzazione Progressiva
                                    } else if (emotion.includes('geloso') || emotion.includes('possessiv') ||
                                               emotion.includes('invidioso')) {
                                      protocolId = 'ad9c3aef-ba6c-4994-8d3f-91f4e8dc2b5e'; // Gestione Gelosia e Possessività
                                    } else if (emotion.includes('distruttiv') || emotion.includes('disobbedient') ||
                                               emotion.includes('ribelle')) {
                                      protocolId = '7036439d-8a2d-43dd-8a62-71b866f7b661'; // Stop Comportamenti Distruttivi
                                    } else {
                                      // Fallback - vai alla lista generale
                                      window.location.href = `/training?emotion=${selectedAnalysis.primary_emotion}`;
                                      return;
                                    }
                                    
                                    try {
                                      // Ottieni l'utente corrente
                                      const { data: { user } } = await supabase.auth.getUser();
                                      if (!user) {
                                        console.error('User not authenticated');
                                        return;
                                      }

                                      // Ottieni il protocollo pubblico originale
                                      const { data: originalProtocol, error: protocolError } = await supabase
                                        .from('ai_training_protocols')
                                        .select('*')
                                        .eq('id', protocolId)
                                        .eq('is_public', true)
                                        .single();

                                      if (protocolError || !originalProtocol) {
                                        console.error('Error fetching protocol:', protocolError);
                                        // Fallback
                                        window.location.href = `/training?emotion=${selectedAnalysis.primary_emotion}`;
                                        return;
                                      }

                                      // Verifica se l'utente ha già questo protocollo attivo
                                      const { data: existingProtocol } = await supabase
                                        .from('ai_training_protocols')
                                        .select('id')
                                        .eq('user_id', user.id)
                                        .or(`title_it.eq.${originalProtocol.title_it},title_en.eq.${originalProtocol.title_en},title_es.eq.${originalProtocol.title_es}`)
                                        .single();

                                      if (existingProtocol) {
                                        // Se esiste già, vai direttamente al protocollo esistente
                                        window.location.href = `/training/dashboard/${existingProtocol.id}`;
                                        return;
                                      }

                                      // Crea una nuova copia del protocollo per l'utente usando il formato multilingua
                                      const newProtocol = {
                                        id: crypto.randomUUID(),
                                        title_it: originalProtocol.title_it,
                                        title_en: originalProtocol.title_en,
                                        title_es: originalProtocol.title_es,
                                        description_it: originalProtocol.description_it,
                                        description_en: originalProtocol.description_en,
                                        description_es: originalProtocol.description_es,
                                        category_it: originalProtocol.category_it,
                                        category_en: originalProtocol.category_en,
                                        category_es: originalProtocol.category_es,
                                        difficulty_it: originalProtocol.difficulty_it,
                                        difficulty_en: originalProtocol.difficulty_en,
                                        difficulty_es: originalProtocol.difficulty_es,
                                        duration_days: originalProtocol.duration_days,
                                        target_behavior_it: originalProtocol.target_behavior_it,
                                        target_behavior_en: originalProtocol.target_behavior_en,
                                        target_behavior_es: originalProtocol.target_behavior_es,
                                        triggers_it: originalProtocol.triggers_it,
                                        triggers_en: originalProtocol.triggers_en,
                                        triggers_es: originalProtocol.triggers_es,
                                        required_materials_it: originalProtocol.required_materials_it,
                                        required_materials_en: originalProtocol.required_materials_en,
                                        required_materials_es: originalProtocol.required_materials_es,
                                        current_day: 1,
                                        progress_percentage: '0',
                                        success_rate: 0,
                                        ai_generated: false,
                                        is_public: false,
                                        veterinary_approved: false,
                                        community_rating: 0,
                                        community_usage: '0',
                                        mentor_recommended: false,
                                        notifications_enabled: true,
                                        last_activity_at: new Date().toISOString(),
                                        user_id: user.id,
                                        pet_id: null,
                                        integration_source: 'analysis',
                                        estimated_cost: null,
                                        share_code: null,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        status_it: 'attivo',
                                        status_en: 'active',
                                        status_es: 'activo'
                                      };

                                      const { data: createdProtocol, error: createError } = await supabase
                                        .from('ai_training_protocols')
                                        .insert(newProtocol)
                                        .select()
                                        .single();

                                      if (createError) {
                                        console.error('Error creating protocol:', createError);
                                        return;
                                      }

                                      // Copia tutti gli esercizi dal protocollo originale
                                      const { data: originalExercises, error: exercisesError } = await supabase
                                        .from('ai_training_exercises')
                                        .select('*')
                                        .eq('protocol_id', protocolId);

                                      if (!exercisesError && originalExercises && originalExercises.length > 0) {
                                        const exercisesToCopy = originalExercises.map(exercise => ({
                                          protocol_id: createdProtocol.id,
                                          title: exercise.title,
                                          description: exercise.description,
                                          exercise_type: exercise.exercise_type,
                                          day_number: exercise.day_number,
                                          duration_minutes: exercise.duration_minutes,
                                          instructions: exercise.instructions,
                                          materials: exercise.materials,
                                          effectiveness_score: exercise.effectiveness_score,
                                        }));

                                        await supabase
                                          .from('ai_training_exercises')
                                          .insert(exercisesToCopy);
                                      }

                                      // Vai al protocollo appena creato
                                      window.location.href = `/training/dashboard/${createdProtocol.id}`;
                                      
                                    } catch (error) {
                                      console.error('Error starting protocol from analysis:', error);
                                      // Fallback in caso di errore
                                      window.location.href = `/training?emotion=${selectedAnalysis.primary_emotion}`;
                                    }
                                  }}
                               >
                                <Target className="h-3 w-3 mr-1" />
                                {getText('startTrainingProtocol')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Raccomandazioni Personalizzate - Solo per emozioni negative */}
                {(() => {
                  const negativeEmotions = [
                    'ansia', 'ansioso', 
                    'paura', 'pauroso', 'spaventato', 'terrorizzato',
                    'stress', 'stressato', 
                    'aggressività', 'aggressivo', 'arrabbiato', 'rabbioso',
                    'tristezza', 'triste', 'melanconico', 
                    'depressione', 'depresso', 'abbattuto',
                    'agitazione', 'agitato', 'nervoso', 'irrequieto',
                    'frustrato', 'irritato', 'preoccupato', 'inquieto',
                    'dolore', 'sofferente', 'malessere'
                  ];
                  const isNegativeEmotion = negativeEmotions.some(emotion => 
                    selectedAnalysis.primary_emotion.toLowerCase().includes(emotion)
                  );
                  
                  if (isNegativeEmotion && selectedPet) {
                    return (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          {getText('personalizedRecommendations')}
                        </h4>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border">
                          <div className="space-y-3">
                            {/* Raccomandazioni basate sull'età */}
                            {selectedPet.age && (
                              <div className="text-sm">
                                <span className="font-medium text-blue-800 dark:text-blue-200">Età ({selectedPet.age} anni): </span>
                                <span className="text-blue-700 dark:text-blue-300">
                                  {selectedPet.age < 1 ? "Pazienza extra - i cuccioli hanno bisogno di tempi di adattamento più lunghi" :
                                   selectedPet.age < 3 ? "Energia giovanile - aumenta l'attività fisica per ridurre stress" :
                                   selectedPet.age < 7 ? "Fase adulta - mantieni routine costanti per stabilità" :
                                   "Età senior - riduci i cambiamenti bruschi e aumenta il comfort"}
                                </span>
                              </div>
                            )}
                            
                            {/* Raccomandazioni basate sulla razza */}
                            {selectedPet.breed && (
                              <div className="text-sm">
                                <span className="font-medium text-blue-800 dark:text-blue-200">Razza ({selectedPet.breed}): </span>
                                <span className="text-blue-700 dark:text-blue-300">
                                  {selectedPet.breed.toLowerCase().includes('border') ? "Razza intelligente - stimoli mentali quotidiani sono essenziali" :
                                   selectedPet.breed.toLowerCase().includes('labrador') ? "Razza socievole - aumenta le interazioni positive" :
                                   selectedPet.breed.toLowerCase().includes('golden') ? "Temperamento dolce - rinforzi positivi molto efficaci" :
                                   selectedPet.breed.toLowerCase().includes('pastore') ? "Razza protettiva - lavora sulla socializzazione graduale" :
                                   "Considera le caratteristiche specifiche della razza per il training"}
                                </span>
                              </div>
                            )}
                            
                            {/* Raccomandazioni basate sul peso */}
                            {selectedPet.weight && (
                              <div className="text-sm">
                                <span className="font-medium text-blue-800 dark:text-blue-200">Peso ({selectedPet.weight}kg): </span>
                                <span className="text-blue-700 dark:text-blue-300">
                                  {selectedPet.weight < 5 ? "Piccola taglia - sessioni brevi (5-10 min) ma frequenti" :
                                   selectedPet.weight < 20 ? "Media taglia - sessioni standard (15-20 min)" :
                                   "Grande taglia - sessioni più lunghe (20-30 min) con pause"}
                                </span>
                              </div>
                            )}
                            
                            {/* Raccomandazioni basate sulle condizioni di salute */}
                            {selectedPet.health_conditions && selectedPet.health_conditions.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium text-blue-800 dark:text-blue-200">{getText('healthConditions')} </span>
                                <span className="text-blue-700 dark:text-blue-300">
                                  {getText('healthAdvice')}
                                </span>
                              </div>
                            )}
                            
                            {/* Raccomandazione generale basata sull'emozione */}
                            <div className="text-sm">
                              <span className="font-medium text-blue-800 dark:text-blue-200">{getText('forEmotion')} "{selectedAnalysis.primary_emotion}": </span>
                              <span className="text-blue-700 dark:text-blue-300">
                                {(() => {
                                  const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                   if (emotion.includes('ansia') || emotion.includes('stress')) {
                                    return getText('anxietyAdvice');
                                  } else if (emotion.includes('aggressiv') || emotion.includes('frustrato')) {
                                    return getText('aggressionAdvice');
                                  } else if (emotion.includes('paura')) {
                                    return getText('fearAdvice');
                                  } else if (emotion.includes('triste') || emotion.includes('depresso')) {
                                    return getText('sadnessAdvice');
                                  } else {
                                    return getText('generalAdvice');
                                  }
                                })()}
                              </span>
                            </div>
                            
                            {/* Frequenza delle sessioni personalizzata */}
                            <div className="text-sm">
                              <span className="font-medium text-blue-800 dark:text-blue-200">{getText('recommendedFrequency')} </span>
                              <span className="text-blue-700 dark:text-blue-300">
                                {selectedPet.age && selectedPet.age < 1 ? getText('shortSessions23') :
                                 selectedAnalysis.primary_confidence > 80 ? getText('sessions12') :
                                 getText('session1')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </TabsContent>

              <TabsContent value="triggers" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {getText('identifiedTriggers')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAnalysis.triggers.map((trigger, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          {translateAnalysisData(trigger, 'triggers')}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                          {getText('monitorTrigger')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AudioLines className="h-4 w-4" />
                    {getText('originalRecording')}
                  </h4>
                  {selectedAnalysis.file_type.startsWith('audio/') ? (
                    <AudioPlayer 
                      storagePath={selectedAnalysis.storage_path}
                      fileName={getReadableAnalysisName(selectedAnalysis, language)}
                    />
                  ) : (
                    <div className="p-4 bg-muted/50 border rounded-lg text-center">
                      <p className="text-muted-foreground">
                        {getText('notAudioFile')}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => shareAnalysis(selectedAnalysis)} className="bg-azure hover:bg-azure/90 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              {getText('share')}
            </Button>
            <Button onClick={() => downloadReport(selectedAnalysis)} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {getText('downloadReport')}
            </Button>
            <Button onClick={() => addToDiary(selectedAnalysis)} variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              {getText('addToDiary')}
            </Button>
            <Button onClick={() => scheduleFollowUp(selectedAnalysis)} variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              {getText('scheduleFollowUp')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Recognition */}
      {analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {getText('patternRecognition')}
            </CardTitle>
            <CardDescription>
              {getText('previousComparisons')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const otherAnalyses = analyses.filter(a => a.id !== selectedAnalysis.id);
                const mostRecentOther = otherAnalyses[0];
                
                if (!mostRecentOther) return null;
                
                return (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getText('similarEpisode')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getText('similarBehavior')} {format(new Date(mostRecentOther.created_at), 'dd MMMM', { locale: it })} {getText('withEmotion')} "{getEmotionTranslation(mostRecentOther.primary_emotion, language)}" ({getText('confidenceLevel')} {Math.round(mostRecentOther.primary_confidence * 100)}%)
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setComparedAnalyses([selectedAnalysis, mostRecentOther]);
                        setShowComparisonModal(true);
                      }}
                    >
                      {getText('compareAnalyses')}
                    </Button>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const otherAnalyses = analyses.filter(a => a.id !== selectedAnalysis.id);
                      if (otherAnalyses.length === 0) return '0%';
                      
                      // Trova l'analisi più simile per emozione o la più recente
                      const currentEmotion = selectedAnalysis.primary_emotion.toLowerCase();
                      const similarAnalysis = otherAnalyses.find(a => 
                        a.primary_emotion.toLowerCase() === currentEmotion
                      ) || otherAnalyses[0];
                      
                      const currentConfidence = selectedAnalysis.primary_confidence;
                      const previousConfidence = similarAnalysis.primary_confidence;
                      const improvement = ((currentConfidence - previousConfidence) / previousConfidence * 100);
                      
                      // Limita il valore per evitare percentuali irrealistiche
                      const clampedImprovement = Math.max(-50, Math.min(50, improvement));
                      
                      return Number(clampedImprovement) > 0 ? `+${clampedImprovement.toFixed(1)}%` : `${clampedImprovement.toFixed(1)}%`;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">{getText('confidenceVariation')}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const otherAnalyses = analyses.filter(a => a.id !== selectedAnalysis.id);
                      if (otherAnalyses.length === 0) return '0';
                      
                      // Calcola i giorni dall'analisi più recente
                      const current = new Date(selectedAnalysis.created_at);
                      const previous = new Date(otherAnalyses[0].created_at);
                      const diffTime = Math.abs(current.getTime() - previous.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      // Se è lo stesso giorno, mostra "Oggi"
                      if (diffDays === 0) return getText('today');
                      if (diffDays === 1) return `1 ${getText('day')}`;
                      
                      return `${diffDays} ${getText('daysSince')}`;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">{getText('lastAnalysis')}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      if (analyses.length === 0) return '0%';
                      
                      const currentEmotion = selectedAnalysis.primary_emotion.toLowerCase();
                      const similarEmotions = analyses.filter(a => 
                        a.primary_emotion.toLowerCase() === currentEmotion
                      ).length;
                      
                      const consistency = (similarEmotions / analyses.length * 100);
                      return `${Math.round(consistency)}%`;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">{getText('emotionalConsistency')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Modal */}
      <Dialog open={showComparisonModal} onOpenChange={setShowComparisonModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {language === 'it' ? 'Confronta Analisi' : language === 'es' ? 'Comparar Análisis' : 'Compare Analyses'}
              </DialogTitle>
              <DialogDescription>
                {language === 'it' ? 'Confronto di' : language === 'es' ? 'Comparación de' : 'Comparison of'} {comparedAnalyses.length} {language === 'it' ? 'risultati selezionati' : language === 'es' ? 'resultados seleccionados' : 'selected results'}
              </DialogDescription>
          </DialogHeader>
          
          {comparedAnalyses.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{comparedAnalyses.length}</div>
                    <p className="text-xs text-muted-foreground">{language === 'it' ? 'Confronta Analisi' : language === 'es' ? 'Comparar Análisis' : 'Compare Analyses'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {format(new Date(Math.min(...comparedAnalyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')} - {format(new Date(Math.max(...comparedAnalyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')}
                    </div>
                    <p className="text-xs text-muted-foreground">{language === 'it' ? 'Periodo' : language === 'es' ? 'Período' : 'Period'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                     <div className="text-2xl font-bold">
                       {(comparedAnalyses.reduce((sum, a) => sum + (a.primary_confidence * 100), 0) / comparedAnalyses.length).toFixed(1)}%
                     </div>
                     <p className="text-xs text-muted-foreground">{language === 'it' ? 'Confidenza' : language === 'es' ? 'Confianza' : 'Confidence'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {comparedAnalyses.map((analysis, index) => (
                  <Card key={analysis.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {analysis.file_type.startsWith('audio/') ? (
                          <FileAudio className="h-5 w-5" />
                        ) : (
                          <FileVideo className="h-5 w-5" />
                        )}
                        {language === 'it' ? 'Analisi' : language === 'es' ? 'Análisis' : 'Analysis'} {index + 1}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(analysis.created_at), 'dd MMMM yyyy, HH:mm', { locale: it })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {EMOTION_ICONS[analysis.primary_emotion] || '🤔'}
                        </div>
                        <Badge className={cn("mb-2", EMOTION_COLORS[analysis.primary_emotion])}>
                          {getEmotionTranslation(analysis.primary_emotion, language)}
                        </Badge>
                        <div className="text-lg font-bold">{(analysis.primary_confidence * 100).toFixed(0)}%</div>
                      </div>
                      
                       <div className="space-y-2">
                         <h4 className="font-medium text-sm">{language === 'it' ? 'Emozioni Secondarie' : language === 'es' ? 'Emociones Secundarias' : 'Secondary Emotions'}</h4>
                        {Object.entries(analysis.secondary_emotions).slice(0, 3).map(([emotion, confidence]) => (
                          <div key={emotion} className="flex justify-between text-sm">
                            <span>{emotion}</span>
                            <span>{confidence}%</span>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">{language === 'it' ? 'Insights' : language === 'es' ? 'Insights' : 'Insights'}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {analysis.behavioral_insights}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    try {
                      const pdf = new jsPDF();
                      
                      // Title
                      pdf.setFontSize(16);
                      pdf.setFont('helvetica', 'bold');
                      pdf.text('CONFRONTO ANALISI EMOTIVE - PET VOICE', 20, 20);
                      
                      let yPosition = 40;
                      pdf.setFontSize(14);
                      pdf.text(`Pet: ${petName}`, 20, yPosition);
                      yPosition += 20;
                      
                      comparedAnalyses.forEach((analysis, index) => {
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(`ANALISI ${index + 1}`, 20, yPosition);
                        yPosition += 10;
                        
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(`Data: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}`, 20, yPosition);
                        yPosition += 7;
                        pdf.text(`Emozione: ${analysis.primary_emotion} (${Math.round(analysis.primary_confidence * 100)}%)`, 20, yPosition);
                        yPosition += 7;
                        pdf.text(`File: ${getReadableAnalysisName(analysis, language)}`, 20, yPosition);
                        yPosition += 15;
                      });
                      
                      const fileName = `confronto-analisi-${petName}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
                      pdf.save(fileName);
                      
                      showToast({
                        title: "Download completato",
                        description: "Report di confronto scaricato: {fileName}",
                        variables: { fileName }
                      });
                    } catch (error) {
                      showToast({
                        title: "Errore",
                        description: "Impossibile generare il report PDF",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Scarica PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{getText('shareAnalysisTitle')}</DialogTitle>
            <DialogDescription>
              {getText('shareAnalysisDescription')} {petName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {templates.slice(0, 4).map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-20 flex-col"
                onClick={() => {
                  shareToSocial(template.platform, template, selectedAnalysis);
                  setShareDialogOpen(false);
                }}
              >
                <div>{getText(template.platform.toLowerCase())}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisResults;