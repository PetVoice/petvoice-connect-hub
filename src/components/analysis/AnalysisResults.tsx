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
import { supabase } from '@/integrations/supabase/client';
import { usePets } from '@/contexts/PetContext';
import { getRecommendedProtocol, allProtocols } from '@/data/trainingProtocolsData';
import { useCreateProtocol } from '@/hooks/useTrainingProtocols';
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 90) return 'Molto Alta';
  if (confidence >= 75) return 'Alta';
  if (confidence >= 50) return 'Media';
  return 'Bassa';
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 75) return 'text-blue-600';
  if (confidence >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
  const language = 'it';
  const { showToast } = useTranslatedToast();
  const { selectedPet } = usePets();
  const createProtocol = useCreateProtocol();

  // Helper function to translate hardcoded analysis data
  const translateAnalysisData = (text: string, type: 'insights' | 'recommendations' | 'triggers') => {
    // If the text looks like a translation key, return it as is
    if (text.startsWith('analysis.')) {
      return text;
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
        loadFile: 'Nuova Analisi',
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
        emotionalSupportDesc: 'Supporto emotivo e strategie per migliorare il benessere generale del pet.',
        generalBehaviorDesc: 'Tecniche generali per migliorare il comportamento e l\'obbedienza.',
        // Protocol start messages
        protocolStarting: 'Avvio protocollo in corso...',
        protocolStarted: 'Protocollo avviato con successo!',
        protocolStartError: 'Errore nell\'avvio del protocollo'
      }
    };
    
    return texts[language]?.[key] || key;
  };

  // Fetch sharing templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('sharing_templates')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching sharing templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  // Generate social sharing content based on analysis
  const generateSharingContent = (analysis: AnalysisData, template: SharingTemplate): string => {
    const emotion = getEmotionTranslation(analysis.primary_emotion, language);
    const confidence = Math.round(analysis.primary_confidence * 100);
    
    return template.content
      .replace('{{petName}}', petName)
      .replace('{{emotion}}', emotion)
      .replace('{{confidence}}', confidence.toString())
      .replace('{{date}}', format(new Date(analysis.created_at), 'dd/MM/yyyy', { locale: it }));
  };

  const shareAnalysis = async (analysis: AnalysisData) => {
    setShareDialogOpen(true);
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
      const diaryEntry = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        pet_id: selectedPet.id,
        title: `${getText('emotionalAnalysis')} - ${getEmotionTranslation(analysis.primary_emotion, language)}`,
        content: `${getText('analysisOf')} ${format(new Date(analysis.created_at), 'dd MMMM yyyy', { locale: it })}\n\n${getText('primaryEmotion')}: ${getEmotionTranslation(analysis.primary_emotion, language)} (${Math.round(analysis.primary_confidence * 100)}% ${getText('confidence')})\n\n${getText('insights')}:\n${translateAnalysisData(analysis.behavioral_insights, 'insights')}\n\n${getText('recommendations')}:\n${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}`,
        entry_date: analysis.created_at,
        mood_score: Math.round(analysis.primary_confidence * 10),
        behavioral_tags: [analysis.primary_emotion, ...Object.keys(analysis.secondary_emotions || {})],
        analysis_metadata: {
          analysis_id: analysis.id,
          file_name: analysis.file_name,
          confidence: analysis.primary_confidence,
          secondary_emotions: analysis.secondary_emotions,
          triggers: analysis.triggers
        }
      };

      const { error } = await supabase
        .from('diary_entries')
        .insert(diaryEntry);

      if (error) throw error;

      showToast({
        title: getText('success'),
        description: getText('addedSuccessfully'),
        variant: "default"
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
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7); // Schedule for next week

      const event = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        pet_id: selectedPet.id,
        title: `Follow-up ${getEmotionTranslation(analysis.primary_emotion, language)}`,
        description: `Controllo di follow-up per l'analisi emotiva del ${format(new Date(analysis.created_at), 'dd/MM/yyyy', { locale: it })}`,
        start_time: followUpDate.toISOString(),
        event_type: 'follow_up',
        reminder_time: 60, // 1 hour before
        analysis_reference: analysis.id
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert(event);

      if (error) throw error;

      showToast({
        title: getText('followUpScheduled'),
        description: `${getText('reminderCreated')} ${format(followUpDate, 'dd/MM/yyyy', { locale: it })} ${getText('inCalendar')}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      showToast({
        title: getText('error'),
        description: getText('cannotCreateReminder'),
        variant: "destructive"
      });
    }
  };

  const downloadReport = async (analysis: AnalysisData) => {
    try {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text(`Analisi Emotiva - ${petName}`, 20, 30);
      
      // Analysis details
      pdf.setFontSize(14);
      pdf.text(`Data: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}`, 20, 50);
      pdf.text(`Emozione Primaria: ${getEmotionTranslation(analysis.primary_emotion, language)}`, 20, 70);
      pdf.text(`Confidenza: ${Math.round(analysis.primary_confidence * 100)}%`, 20, 90);
      
      // Behavioral insights
      pdf.setFontSize(12);
      pdf.text('Insights Comportamentali:', 20, 120);
      const insights = pdf.splitTextToSize(translateAnalysisData(analysis.behavioral_insights, 'insights'), 170);
      pdf.text(insights, 20, 140);
      
      // Recommendations
      let yPosition = 140 + (insights.length * 7);
      pdf.text('Raccomandazioni:', 20, yPosition + 20);
      analysis.recommendations.forEach((rec, index) => {
        pdf.text(`• ${rec}`, 25, yPosition + 40 + (index * 10));
      });
      
      const fileName = `analisi_${petName}_${format(new Date(analysis.created_at), 'yyyyMMdd_HHmm', { locale: it })}.pdf`;
      pdf.save(fileName);
      
      showToast({
        title: getText('reportGenerated'),
        description: `${getText('reportSaved')} ${fileName}`,
        variant: "default"
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

  const handleStartProtocol = async (emotion: string) => {
    if (!selectedPet) {
      showToast({
        title: getText('error'),
        description: getText('selectPet'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Mostra toast di avvio
      showToast({
        title: getText('protocolStarting'),
        description: 'Creazione protocollo personalizzato...',
        variant: "default"
      });

      // Reindirizza direttamente al training per avvio automatico
      showToast({
        title: getText('protocolStarted'),
        description: `Avvio protocollo per ${getEmotionTranslation(emotion, language)}`,
        variant: "default"
      });

      // Reindirizza al training
      window.location.href = '/training';
    } catch (error) {
      console.error('Error starting protocol:', error);
      showToast({
        title: getText('protocolStartError'),
        description: 'Impossibile avviare il protocollo. Riprova più tardi.',
        variant: "destructive"
      });
      
      // Fallback in caso di errore
      window.location.href = `/training?emotion=${emotion}`;
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
                <TabsTrigger value="advice">{getText('adviceTab')}</TabsTrigger>
                <TabsTrigger value="triggers">{getText('triggersTab')}</TabsTrigger>
                <TabsTrigger value="audio">{getText('audioTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-4">
                {/* Secondary Emotions */}
                <div>
                  <h3 className="font-medium mb-3">{getText('secondaryEmotions')}</h3>
                  {selectedAnalysis.secondary_emotions && Object.keys(selectedAnalysis.secondary_emotions).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedAnalysis.secondary_emotions).map(([emotion, confidence]) => (
                        <Badge 
                          key={emotion}
                          variant="outline" 
                          className={cn(
                            "text-sm",
                            EMOTION_COLORS[emotion] || 'text-gray-500 bg-gray-500/10'
                          )}
                        >
                          {getEmotionTranslation(emotion, language)} ({Math.round((confidence as number) * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nessuna emozione secondaria rilevata</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">{getText('behavioralAnalysis')}</h3>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {translateAnalysisData(selectedAnalysis.behavioral_insights, 'insights')}
                    </p>
                  </div>
                </div>

                {/* Environmental Context */}
                <div>
                  <h3 className="font-medium mb-3">{getText('environmentalContext')}</h3>
                  <WeatherContextInfo analysisDate={selectedAnalysis.created_at} />
                </div>
              </TabsContent>

              <TabsContent value="advice" className="space-y-4">
                {/* AI Music Therapy - Solo per emozioni negative */}
                {(() => {
                  const playlist = getRecommendedPlaylist(selectedAnalysis.primary_emotion, Math.round(selectedAnalysis.primary_confidence * 100));
                  if (playlist) {
                    return (
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <AudioLines className="h-5 w-5 text-purple-600" />
                          <h3 className="font-medium text-purple-700">{getText('aiMusicTherapy')}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium text-purple-800">{playlist.name}</p>
                            <p className="text-sm text-purple-600">{playlist.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-purple-600">Frequenza:</span>
                              <p className="font-medium">{playlist.frequency}</p>
                            </div>
                            <div>
                              <span className="text-purple-600">Durata:</span>
                              <p className="font-medium">{playlist.duration} min</p>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-700">
                            <strong>Motivazione IA:</strong> {playlist.reasoning}
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              showToast({
                                title: "Sessione Musicoterapia",
                                description: `Avvio playlist "${playlist.name}" per ${playlist.duration} minuti`,
                                variant: "default"
                              });
                            }}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            {getText('startMusicTherapy')}
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Training Protocol - Solo per emozioni che richiedono intervento */}
                {(() => {
                  const negativeEmotions = [
                    'ansia', 'ansioso', 'stress', 'stressato', 'aggressivo', 'aggressivita', 'iperattivo', 'iperattivita',
                    'depresso', 'triste', 'paura', 'pauroso', 'nervoso', 'agitato', 'irritato'
                  ];
                  
                  if (negativeEmotions.some(emotion => 
                    selectedAnalysis.primary_emotion.toLowerCase().includes(emotion) ||
                    Object.keys(selectedAnalysis.secondary_emotions || {}).some(secEmotion => 
                      secEmotion.toLowerCase().includes(emotion)
                    )
                  )) {
                    return (
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-green-700">{getText('trainingProtocol')}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-sm text-green-600">
                            Protocollo di training consigliato per {getEmotionTranslation(selectedAnalysis.primary_emotion, language)}
                          </p>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStartProtocol(selectedAnalysis.primary_emotion)}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {getText('startTrainingProtocol')}
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Raccomandazioni Personalizzate - Solo per emozioni negative */}
                {(() => {
                  const negativeEmotions = [
                    'ansia', 'ansioso', 'stress', 'stressato', 'aggressivo', 'aggressivita', 'iperattivo', 'iperattivita',
                    'depresso', 'triste', 'paura', 'pauroso', 'nervoso', 'agitato', 'irritato'
                  ];
                  
                  if (!negativeEmotions.some(emotion => 
                    selectedAnalysis.primary_emotion.toLowerCase().includes(emotion) ||
                    Object.keys(selectedAnalysis.secondary_emotions || {}).some(secEmotion => 
                      secEmotion.toLowerCase().includes(emotion)
                    )
                  )) {
                    return (
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-yellow-500/10 border border-green-500/20 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Heart className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-green-700">{petName} {getText('petIsWell')}</h3>
                        </div>
                        <p className="text-sm text-green-600">{getText('positiveEmotionalState')}</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div>
                      <h3 className="font-medium mb-3">{getText('personalizedRecommendations')}</h3>
                      <div className="space-y-3">
                        {selectedAnalysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                            <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="triggers" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">{getText('identifiedTriggers')}</h3>
                  {selectedAnalysis.triggers && selectedAnalysis.triggers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedAnalysis.triggers.map((trigger, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{translateAnalysisData(trigger, 'triggers')}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getText('monitorTrigger')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nessun trigger comportamentale identificato</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">{getText('originalRecording')}</h3>
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
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(Math.abs(comparedAnalyses[0].primary_confidence - comparedAnalyses[1].primary_confidence) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Differenza Confidenza</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.ceil(Math.abs(new Date(comparedAnalyses[0].created_at).getTime() - new Date(comparedAnalyses[1].created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-muted-foreground">Giorni di Distanza</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {comparedAnalyses[0].primary_emotion === comparedAnalyses[1].primary_emotion ? '✓' : '✗'}
                    </p>
                    <p className="text-sm text-muted-foreground">Emozione Consistente</p>
                  </CardContent>
                </Card>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparedAnalyses.map((analysis, index) => (
                  <Card key={analysis.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Analisi {index + 1} - {format(new Date(analysis.created_at), 'dd/MM/yyyy', { locale: it })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {EMOTION_ICONS[analysis.primary_emotion] || '🤔'}
                        </div>
                        <Badge className={cn("mb-2", EMOTION_COLORS[analysis.primary_emotion] || 'text-gray-500 bg-gray-500/10')}>
                          {getEmotionTranslation(analysis.primary_emotion, language)}
                        </Badge>
                        <Progress value={Math.round(analysis.primary_confidence * 100)} className="h-2 mb-2" />
                        <p className="font-bold">{Math.round(analysis.primary_confidence * 100)}%</p>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium">Insights:</span>
                          <p className="text-muted-foreground text-xs mt-1">{analysis.behavioral_insights.substring(0, 100)}...</p>
                        </div>
                        <div>
                          <span className="font-medium">Raccomandazioni:</span>
                          <p className="text-muted-foreground text-xs mt-1">{analysis.recommendations.length} consigli</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condividi Analisi</DialogTitle>
            <DialogDescription>
              Scegli una piattaforma per condividere i risultati dell'analisi di {petName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <Button 
                key={template.id}
                variant="outline" 
                className="h-16"
                onClick={() => {
                  const content = generateSharingContent(selectedAnalysis, template);
                  navigator.clipboard.writeText(content);
                  showToast({
                    title: "Contenuto copiato!",
                    description: `Testo per ${template.platform} copiato negli appunti`,
                    variant: "default"
                  });
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
