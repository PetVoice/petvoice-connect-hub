import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FileText,
  Image,
  Video,
  Download,
  Share2,
  BookOpen,
  Calendar,
  Target,
  Activity,
  Zap,
  BarChart3,
  AudioLines,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
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
  user_description?: string; // Aggiunto per le analisi testuali
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
    return `${emotionName} - ${day} ${month}`;
  } else {
    return `${emotionName} - ${day} ${month} ${time}`;
  }
};

// Helper function to clean file name by removing timestamp and extension
const cleanFileName = (fileName: string, fileType: string) => {
  // Remove timestamp pattern like "_2025-07-26_03-03-11" and file extension
  let cleanName = fileName.replace(/_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/, '').replace(/\.[^/.]+$/, '');
  
  // Auto-detect file type and assign appropriate name
  if (fileType === 'text') {
    return 'Testo';
  } else if (fileType.startsWith('image/')) {
    return 'Immagini';
  } else if (fileType.startsWith('video/')) {
    return 'Video';
  } else if (fileType.startsWith('audio/')) {
    return 'Audio';
  }
  
  // Fallback for manual translations
  if (cleanName === 'Registrazione') {
    return 'Audio';
  }
  
  return cleanName;
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
  const language = 'it';
  const { showToast } = useUnifiedToast();
  const { selectedPet } = usePets();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Helper function to translate hardcoded analysis data
  const translateAnalysisData = (text: string, type: 'insights' | 'recommendations' | 'triggers') => {
    // If the text looks like a translation key, return it as is
    if (text.startsWith('analysis.')) {
      return text;
    }
    
    return text;
  };

  // Helper function to get media tab info based on file type
  const getMediaTabInfo = (analysis: AnalysisData) => {
    if (analysis.file_type === 'text') {
      return {
        tabKey: 'text',
        tabLabel: getText('textTab'),
        icon: FileText,
        title: 'Testo Analizzato'
      };
    } else if (analysis.file_type.startsWith('image/')) {
      return {
        tabKey: 'image',
        tabLabel: getText('imageTab'),
        icon: Image,
        title: 'Immagine Analizzata'
      };
    } else if (analysis.file_type.includes('video')) {
      return {
        tabKey: 'video',
        tabLabel: getText('videoTab'),
        icon: Video,
        title: 'Video Registrato'
      };
    } else if (analysis.file_type.includes('audio')) {
      return {
        tabKey: 'audio',
        tabLabel: getText('audioTab'),
        icon: FileAudio,
        title: getText('originalRecording')
      };
    } else {
      // Default to audio for other media types
      return {
        tabKey: 'audio',
        tabLabel: getText('audioTab'),
        icon: FileAudio,
        title: 'File Multimediale'
      };
    }
  };

  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(
    analyses.length > 0 ? analyses[0] : null
  );

  // Effetto per navigazione diretta a un'analisi specifica
  useEffect(() => {
    const analysisId = searchParams.get('analysis');
    if (analysisId && analyses.length > 0) {
      const analysisIndex = analyses.findIndex(a => a.id === analysisId);
      if (analysisIndex !== -1) {
        const targetAnalysis = analyses[analysisIndex];
        setSelectedAnalysis(targetAnalysis);
        
        // Calcola e imposta la pagina corretta
        const correctPage = Math.floor(analysisIndex / itemsPerPage);
        setCurrentPage(correctPage);
      }
    } else if (!selectedAnalysis && analyses.length > 0) {
      setSelectedAnalysis(analyses[0]);
    }
  }, [analyses, searchParams]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedAnalyses, setComparedAnalyses] = useState<AnalysisData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [templates, setTemplates] = useState<SharingTemplate[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  
  // Calcola le analisi da mostrare in base alla pagina corrente
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnalyses = analyses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(analyses.length / itemsPerPage);

  // Reset page when analyses change
  useEffect(() => {
    setCurrentPage(0);
  }, [analyses]);

  // Funzioni di navigazione
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  const [protocolUsageCounts, setProtocolUsageCounts] = useState<Record<string, number>>({});
  const [protocolSuccessRates, setProtocolSuccessRates] = useState<Record<string, number>>({});

  // Fetch protocol usage counts on mount - MOVED HERE to avoid hook order issues
  useEffect(() => {
    const fetchProtocolData = async () => {
      try {
        const { data: protocols, error } = await supabase
          .from('ai_training_protocols')
          .select('id, title, community_usage, success_rate')
          .in('status', ['active', 'available'])
          .not('community_usage', 'is', null)  // Prioritizza protocolli con dati di utilizzo
          .not('success_rate', 'is', null)      // Prioritizza protocolli con dati di successo
          .order('community_usage', { ascending: false }); // Ordina per utilizzo più alto

        if (error) throw error;
        
        console.log('🔍 Fetched protocols for usage count and success rate:', protocols);
        
        const usageCounts: Record<string, number> = {};
        const successRates: Record<string, number> = {};
        
        // Prima passiamo per i protocolli con dati reali (priorità)
        protocols?.forEach(protocol => {
          const key = protocol.title.toLowerCase();
          const usage = Number(protocol.community_usage) || 0;
          const successRate = Number(protocol.success_rate) || 0;
          
          // Store multiple variations of the key for better matching
          usageCounts[key] = usage;
          successRates[key] = successRate;
          
          // Store without apostrophes for better matching
          const keyNoApostrophe = key.replace(/'/g, '');
          usageCounts[keyNoApostrophe] = usage;
          successRates[keyNoApostrophe] = successRate;
          
          console.log(`📊 Protocol "${protocol.title}": ${usage} utilizzi, ${successRate}% successo`);
          console.log(`🔑 Keys stored: "${key}" and "${keyNoApostrophe}"`);
        });
        
        // Se non abbiamo abbastanza dati, facciamo una query fallback per tutti i protocolli
        if ((protocols?.length || 0) < 7) {
          const { data: allProtocols } = await supabase
            .from('ai_training_protocols')
            .select('id, title, community_usage, success_rate')
            .in('status', ['active', 'available']);
          
          allProtocols?.forEach(protocol => {
            const key = protocol.title.toLowerCase();
            const keyNoApostrophe = key.replace(/'/g, '');
            
            // Solo se non abbiamo già dati per questo protocollo
            if (!usageCounts[key] && !usageCounts[keyNoApostrophe]) {
              const usage = Number(protocol.community_usage) || 0;
              const successRate = Number(protocol.success_rate) || 0;
              
              usageCounts[key] = usage;
              successRates[key] = successRate;
              usageCounts[keyNoApostrophe] = usage;
              successRates[keyNoApostrophe] = successRate;
              
              console.log(`📊 Fallback Protocol "${protocol.title}": ${usage} utilizzi, ${successRate}% successo`);
            }
          });
        }
        
        console.log('📈 Final usage counts object:', usageCounts);
        console.log('📈 Final success rates object:', successRates);
        
        setProtocolUsageCounts(usageCounts);
        setProtocolSuccessRates(successRates);
      } catch (error) {
        console.error('Error fetching protocol data:', error);
      }
    };
    
    fetchProtocolData();
  }, []);

  // Traduzioni dirette per il componente
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      it: {
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
        videoTab: 'Video',
        textTab: 'Testo',
        imageTab: 'Immagine',
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
        twitter: 'Twitter',
        facebook: 'Facebook',
        instagram: 'Instagram',
        whatsapp: 'WhatsApp'
      }
    };
    
    return texts[language]?.[key] || key;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 90) return getText('veryHigh');
    if (confidence >= 70) return getText('high');
    if (confidence >= 50) return getText('medium');
    return getText('low');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getEmotionClass = (emotion: string) => {
    return EMOTION_COLORS[emotion.toLowerCase()] || 'text-gray-500 bg-gray-50 border-gray-200';
  };

  const getEmotionIcon = (emotion: string) => {
    return EMOTION_ICONS[emotion.toLowerCase()] || '🐕';
  };

  // Auto-start protocol function - directly starts the recommended protocol
  const autoStartProtocol = async (analysis: AnalysisData) => {
    try {
      if (!selectedPet?.id) {
        showToast({
          title: getText('error'),
          description: getText('selectPet'),
          variant: "destructive"
        });
        return;
      }

      const recommendedId = getRecommendedProtocol([analysis.primary_emotion]);
      if (!recommendedId) {
        showToast({
          title: getText('error'),
          description: 'Nessun protocollo raccomandato trovato',
          variant: "destructive"
        });
        return;
      }

      // Find the protocol object
      const protocolsArray = Object.values(allProtocols);
      const protocol = protocolsArray.find(p => p.id === recommendedId);
      if (!protocol) {
        showToast({
          title: getText('error'),
          description: 'Protocollo non trovato',
          variant: "destructive"
        });
        return;
      }

      // Use activity log to track protocol start since training_sessions table doesn't exist
      const { error } = await supabase
        .from('activity_log')
        .insert({
          pet_id: selectedPet.id,
          user_id: selectedPet.user_id,
          activity_type: 'training_protocol_started',
          activity_description: `Started protocol: ${protocol.name}`,
          metadata: { protocol_id: protocol.id, emotion: analysis.primary_emotion }
        });

      if (error) throw error;

      showToast({
        title: '⚡ Protocollo Avviato!',
        description: `${protocol.name} è stato avviato con successo`,
        type: "success"
      });

      // Redirect to training page
      window.location.href = '/training';
    } catch (error) {
      console.error('Error auto-starting protocol:', error);
      showToast({
        title: getText('error'),
        description: 'Errore nell\'avvio automatico del protocollo',
        variant: "destructive"
      });
    }
  };


  // Function to start training protocol
  const startTrainingProtocol = async (protocol: any) => {
    try {
      if (!selectedPet?.id) {
        showToast({
          title: getText('error'),
          description: getText('selectPet'),
          variant: "destructive"
        });
        return;
      }

      // Start the existing public protocol instead of creating a new one
      const { data: protocolCopy, error } = await supabase.rpc('start_public_protocol', {
        p_public_protocol_id: protocol.id,
        p_user_id: selectedPet.user_id
      });

      if (error) {
        console.error('Error starting protocol:', error);
        throw error;
      }

      showToast({
        title: '⚡ Protocollo Avviato!',
        description: `${protocol.title} è stato avviato per ${selectedPet.name}`,
        type: "success"
      });

      // Navigate directly to the protocol dashboard if protocol ID is available
      setTimeout(() => {
        if (protocolCopy) {
          navigate(`/training/dashboard/${protocolCopy}`);
        } else {
          navigate('/training');
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting training protocol:', error);
      showToast({
        title: getText('error'),
        description: 'Errore nell\'avvio del protocollo di training',
        variant: "destructive"
      });
    }
  };

  // Function to start music therapy session with recommended playlist
  const startMusicTherapy = (playlist: any) => {
    try {
      if (!selectedPet?.id) {
        showToast({
          title: getText('error'),
          description: getText('selectPet'),
          variant: "destructive"
        });
        return;
      }

      // Navigate to AI Music Therapy page with playlist parameters
      const playlistParams = {
        name: playlist.name,
        description: playlist.description,
        frequency: playlist.frequency,
        duration: playlist.duration,
        reasoning: playlist.reasoning,
        emotion: selectedAnalysis?.primary_emotion,
        confidence: selectedAnalysis?.primary_confidence,
        autoStart: true // Flag to auto-start the playlist
      };

      navigate(`/ai-music-therapy?petId=${selectedPet.id}&playlist=${encodeURIComponent(JSON.stringify(playlistParams))}`);
      
      showToast({
        title: 'Musicoterapia Avviata!',
        description: `Reindirizzamento alla sessione ${playlist.name}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error starting music therapy:', error);
      showToast({
        title: getText('error'),
        description: 'Errore nell\'avvio della sessione di musicoterapia',
        variant: "destructive"
      });
    }
  };

  const addToDiary = async (analysis: AnalysisData) => {
    try {
      if (!selectedPet?.id) {
        showToast({
          title: getText('error'),
          description: getText('selectPet'),
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('diary_entries')
        .insert({
          pet_id: selectedPet.id,
          user_id: selectedPet.user_id,
          entry_date: new Date().toISOString().split('T')[0],
          title: `${getText('analysisOf')} ${format(new Date(analysis.created_at), 'dd/MM/yyyy')}`,
          content: `${getText('primaryEmotion')}: ${analysis.primary_emotion} (${(analysis.primary_confidence * 100).toFixed(0)}% ${getText('confidence')})\n\n${getText('insights')}: ${analysis.behavioral_insights}\n\n${getText('recommendations')}: ${analysis.recommendations.join(', ')}`
        });

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

  const scheduleFollowUp = (analysis: AnalysisData) => {
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);
      
      // Simple calendar reminder - in a real app this would integrate with calendar APIs
      const eventData = {
        title: `Follow-up analisi ${petName}`,
        description: `Verifica miglioramenti per emozione: ${analysis.primary_emotion}`,
        start: followUpDate,
        duration: 30
      };

      showToast({
        title: getText('followUpScheduled'),
        description: `${getText('reminderCreated')} ${format(followUpDate, 'dd/MM/yyyy')} ${getText('inCalendar')}`,
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

  const generatePDFReport = (analysis: AnalysisData) => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text(`Report Analisi - ${petName}`, 20, yPosition);
      yPosition += 20;

      // Date
      doc.setFontSize(12);
      doc.text(`Data: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm')}`, 20, yPosition);
      yPosition += 15;

      // Primary emotion
      doc.text(`Emozione Primaria: ${analysis.primary_emotion} (${(analysis.primary_confidence * 100).toFixed(0)}%)`, 20, yPosition);
      yPosition += 15;

      // Behavioral insights
      doc.text('Insights Comportamentali:', 20, yPosition);
      yPosition += 10;
      const splitInsights = doc.splitTextToSize(analysis.behavioral_insights, 170);
      doc.text(splitInsights, 20, yPosition);
      yPosition += splitInsights.length * 5 + 10;

      // Recommendations
      doc.text('Raccomandazioni:', 20, yPosition);
      yPosition += 10;
      analysis.recommendations.forEach((rec, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${index + 1}. ${rec}`, 20, yPosition);
        yPosition += 8;
      });

      // Triggers
      if (analysis.triggers.length > 0) {
        yPosition += 10;
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text('Trigger Identificati:', 20, yPosition);
        yPosition += 10;
        analysis.triggers.forEach((trigger, index) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${trigger}`, 20, yPosition);
          yPosition += 8;
        });
      }

      const fileName = `analisi_${petName}_${format(new Date(analysis.created_at), 'ddMMyyyy_HHmm')}.pdf`;
      doc.save(fileName);

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

  if (!selectedAnalysis) return null;

  return (
    <>
      <div className="space-y-6">
        {/* Analysis Selector with Navigation */}
        {analyses.length > 1 && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getText('selectAnalysis')}</CardTitle>
                  <CardDescription>
                    Mostra {startIndex + 1}-{Math.min(endIndex, analyses.length)} di {analyses.length} analisi totali
                  </CardDescription>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevPage}
                      disabled={currentPage === 0}
                      className="h-8 w-8 p-0"
                    >
                      ↑
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentPage + 1}/{totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages - 1}
                      className="h-8 w-8 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentAnalyses.map((analysis) => (
                    <Button
                      key={analysis.id}
                      variant={selectedAnalysis?.id === analysis.id ? "default" : "outline"}
                      className="h-auto p-4 justify-start"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="text-2xl">{getEmotionIcon(analysis.primary_emotion)}</div>
                        <div className="text-left">
                          <div className="font-medium">{getReadableAnalysisName(analysis, language)}</div>
                          <div className="text-sm text-muted-foreground">
                            {analysis.primary_emotion} - {(analysis.primary_confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
            </CardContent>
          </Card>
        )}

        {/* Main Analysis Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Emotion Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {getText('primaryEmotionCard')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="text-6xl">{getEmotionIcon(selectedAnalysis.primary_emotion)}</div>
                <div>
                  <Badge className={cn("text-lg py-2 px-4", getEmotionClass(selectedAnalysis.primary_emotion))}>
                    {selectedAnalysis.primary_emotion}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{getText('confidenceLabel')}: </span>
                  <Badge className={cn("ml-2", getConfidenceColor(selectedAnalysis.primary_confidence < 1 ? selectedAnalysis.primary_confidence * 100 : selectedAnalysis.primary_confidence))}>
                    {selectedAnalysis.primary_confidence < 1 ? (selectedAnalysis.primary_confidence * 100).toFixed(0) : selectedAnalysis.primary_confidence.toFixed(0)}% - {getConfidenceText(selectedAnalysis.primary_confidence < 1 ? selectedAnalysis.primary_confidence * 100 : selectedAnalysis.primary_confidence)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{getText('fileLabel')}</span>
                  <span>{cleanFileName(selectedAnalysis.file_name, selectedAnalysis.file_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{getText('sizeLabel')}</span>
                  <span>{(selectedAnalysis.file_size / 1024 / 1024).toFixed(2)} MB</span>
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
                  <TabsTrigger value={getMediaTabInfo(selectedAnalysis).tabKey}>
                    {getMediaTabInfo(selectedAnalysis).tabLabel}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="emotions" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {getText('secondaryEmotions')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(selectedAnalysis.secondary_emotions).map(([emotion, confidence]) => (
                        <div key={emotion} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getEmotionIcon(emotion)}</span>
                            <span className="font-medium">{emotion}</span>
                          </div>
                          <Badge className={getEmotionClass(emotion)}>
                            {typeof confidence === 'number' && confidence < 1 ? (confidence * 100).toFixed(0) : Math.round(Number(confidence))}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {getText('behavioralAnalysis')}
                    </h4>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-200">
                        {translateAnalysisData(selectedAnalysis.behavioral_insights, 'insights')}
                      </p>
                    </div>
                  </div>

                  <WeatherContextInfo analysisDate={selectedAnalysis.created_at} />
                </TabsContent>

                <TabsContent value="advice" className="space-y-4">
                  {/* Music Therapy - Solo per emozioni negative */}
                  {(() => {
                    const playlist = getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence);
                    if (playlist) {
                      return (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <AudioLines className="h-4 w-4" />
                            {getText('aiMusicTherapy')}
                          </h4>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h5 className="font-semibold text-purple-800 dark:text-purple-200">{playlist.name}</h5>
                                <p className="text-sm text-purple-700 dark:text-purple-300">{playlist.description}</p>
                                <div className="flex items-center gap-4 text-xs text-purple-600 dark:text-purple-400">
                                  <span>🎵 Frequenza: {playlist.frequency}</span>
                                  <span>⏱️ Durata: {playlist.duration} min</span>
                                </div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                                  💡 {playlist.reasoning}
                                </p>
                               </div>
                               <Button 
                                 size="sm" 
                                 className="bg-purple-600 hover:bg-purple-700"
                                 onClick={() => startMusicTherapy(playlist)}
                               >
                                <Activity className="h-3 w-3 mr-1" />
                                {getText('startMusicTherapy')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {/* Training Protocol - Solo per emozioni negative */}
                  {(() => {
                    const negativeEmotions = [
                      'ansia', 'ansioso', 'stressato', 'nervoso', 'agitato', 'iperattivo', 
                      'triste', 'depresso', 'apatico', 
                      'aggressivo', 'irritato', 'arrabbiato',
                      'pauroso', 'spaventato', 'timido'
                    ];
                    
                    const isNegative = negativeEmotions.some(neg => 
                      selectedAnalysis.primary_emotion.toLowerCase().includes(neg)
                    );

                    if (isNegative) {
                      // Function to get recommended training protocol based on emotion
                      const getRecommendedTrainingProtocol = (emotion: string, confidence: number) => {
                        const emotionLower = emotion.toLowerCase();
                        
                        // Protocol mapping based on emotion to existing public protocols
                        const protocolMapping: Record<string, any> = {
                          'ansioso': {
                            id: '3ea69bbf-cc1b-4f47-84ea-edd25879ecad',
                            title: 'Gestione dell\'Ansia',
                            description: 'Protocollo specializzato per ridurre i livelli di ansia nel pet attraverso tecniche di rilassamento e desensibilizzazione graduale',
                            exercises: 21,
                            difficulty: 'Facile',
                            reasoning: 'Progettato specificamente per ridurre i livelli di ansia attraverso esercizi di rilassamento progressivo'
                          },
                          'aggressivo': {
                            id: 'd8694ef9-55ba-4794-a6e2-0c38af0988c8',
                            title: 'Controllo dell\'Aggressività',
                            description: 'Protocollo per ridurre comportamenti aggressivi attraverso tecniche di autocontrollo e redirezione positiva',
                            exercises: 30,
                            difficulty: 'Intermedio',
                            reasoning: 'Focalizzato sulla riduzione dei comportamenti aggressivi attraverso tecniche di rinforzo positivo'
                          },
                          'triste': {
                            id: 'fbdcdb5e-3386-4962-877f-bb7e6f72fd7f',
                            title: 'Superare la Tristezza',
                            description: 'Protocollo per stimolare l\'umore e aumentare l\'energia del pet attraverso attività coinvolgenti e socializzazione',
                            exercises: 15,
                            difficulty: 'Facile',
                            reasoning: 'Pensato per aumentare i livelli di serotonina attraverso attività stimolanti e socializzazione'
                          },
                          'iperattivo': {
                            id: '5c18263c-0928-4fab-b8b9-ac7789f97c24',
                            title: 'Controllo dell\'Iperattività',
                            description: 'Protocollo per canalizzare l\'energia eccessiva attraverso esercizi mirati e tecniche di autocontrollo',
                            exercises: 24,
                            difficulty: 'Intermedio',
                            reasoning: 'Aiuta a incanalare l\'energia eccessiva in attività strutturate e produttive'
                          },
                          'stressato': {
                            id: '8d3bbc35-64bd-40ba-ade6-285ea2262417',
                            title: 'Riduzione dello Stress',
                            description: 'Protocollo per creare un ambiente calmo e routines rilassanti che riducano i fattori di stress',
                            exercises: 21,
                            difficulty: 'Facile',
                            reasoning: 'Progettato per ridurre lo stress attraverso la creazione di un ambiente calmo e rilassante'
                          },
                          'agitato': {
                            id: '5083419f-42be-4ff8-b1b6-4b5b9d828d68',
                            title: 'Calmare l\'Agitazione',
                            description: 'Protocollo per gestire comportamenti agitati e nervosi attraverso tecniche di rilassamento',
                            exercises: 21,
                            difficulty: 'Intermedio',
                            reasoning: 'Specifico per calmare stati di agitazione attraverso tecniche di rilassamento'
                          },
                          'pauroso': {
                            id: 'b6c1fd42-fbac-47a2-9f02-1f187cc92daa',
                            title: 'Superare la Paura',
                            description: 'Protocollo per aiutare il pet a superare le paure attraverso esposizione graduale e rinforzo positivo',
                            exercises: 18,
                            difficulty: 'Intermedio',
                            reasoning: 'Aiuta a superare le paure attraverso un approccio graduale e positivo'
                          }
                        };

                        // Find matching protocol or default
                        for (const [key, baseProtocol] of Object.entries(protocolMapping)) {
                          if (emotionLower.includes(key)) {
                            // Get real data from database for this protocol
                            const protocolTitle = baseProtocol.title;
                            const titleKey = protocolTitle.toLowerCase();
                            const usageCount = protocolUsageCounts[titleKey] || 0;
                            const successRate = protocolSuccessRates[titleKey] || 0;
                            
                            console.log(`🔍 Found protocol "${protocolTitle}" for emotion "${emotion}"`);
                            console.log(`📊 Real data - Usage: ${usageCount}, Success Rate: ${successRate}%`);
                            
                            return {
                              ...baseProtocol,
                              usageCount,
                              successRate
                            };
                          }
                        }

                        // Default protocol for other negative emotions - get real data
                        const defaultTitle = 'gestione dell\'ansia';
                        const defaultProtocol = {
                          id: '3ea69bbf-cc1b-4f47-84ea-edd25879ecad',
                          title: 'Gestione dell\'Ansia',
                          description: 'Protocollo specializzato per ridurre i livelli di ansia e migliorare il benessere emotivo generale',
                          exercises: 21,
                          difficulty: 'Facile',
                          usageCount: protocolUsageCounts[defaultTitle] || 0,
                          successRate: protocolSuccessRates[defaultTitle] || 0,
                          reasoning: 'Un approccio olistico per migliorare il benessere emotivo generale del tuo pet'
                        };
                        
                        console.log(`🔄 Using default protocol with real data - Usage: ${defaultProtocol.usageCount}, Success Rate: ${defaultProtocol.successRate}%`);
                        return defaultProtocol;
                      };

                      // Use the main startTrainingProtocol function defined earlier

                      const protocol = getRecommendedTrainingProtocol(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence);
                      
                      return (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            {getText('trainingProtocol')}
                          </h4>
                          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                  {protocol.title}
                                </h5>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                                  {protocol.description}
                                </p>
                                <div className="flex gap-4 text-sm text-amber-700 dark:text-amber-300 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {protocol.exercises} esercizi
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {protocol.difficulty}
                                  </span>
                                   <span className="flex items-center gap-1">
                                     <BarChart3 className="h-3 w-3" />
                                     {protocol.successRate}% successo
                                   </span>
                                   <span className="flex items-center gap-1">
                                     👥 {protocol.usageCount} utilizzi
                                   </span>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                                  {protocol.reasoning}
                                </p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => startTrainingProtocol(protocol)}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
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
                      'ansia', 'ansioso', 'stressato', 'nervoso', 'agitato', 'iperattivo', 
                      'triste', 'depresso', 'apatico', 
                      'aggressivo', 'irritato', 'arrabbiato',
                      'pauroso', 'spaventato', 'timido'
                    ];
                    
                    const isNegative = negativeEmotions.some(neg => 
                      selectedAnalysis.primary_emotion.toLowerCase().includes(neg)
                    );

                    if (isNegative && selectedAnalysis.recommendations.length > 0) {
                      return (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            {getText('personalizedRecommendations')}
                          </h4>
                          <div className="space-y-3">
                            {selectedAnalysis.recommendations.map((rec, index) => (
                              <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                                <p className="text-blue-800 dark:text-blue-200">{translateAnalysisData(rec, 'recommendations')}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Messaggio positivo per emozioni positive */}
                  {(() => {
                    const positiveEmotions = ['felice', 'happy', 'giocoso', 'playful', 'calmo', 'calm', 'rilassato', 'tranquillo', 'eccitato', 'excited'];
                    const isPositive = positiveEmotions.some(pos => 
                      selectedAnalysis.primary_emotion.toLowerCase().includes(pos)
                    );

                    if (isPositive) {
                      return (
                        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="text-4xl mb-3">🎉</div>
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            {petName} {getText('petIsWell')}
                          </h4>
                          <p className="text-green-700 dark:text-green-300">
                            {getText('positiveEmotionalState')}
                          </p>
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
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            {getText('monitorTrigger')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Dynamic Media Tab Content */}
                <TabsContent value={getMediaTabInfo(selectedAnalysis).tabKey} className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      {React.createElement(getMediaTabInfo(selectedAnalysis).icon, { className: "h-4 w-4" })}
                      {getMediaTabInfo(selectedAnalysis).title}
                    </h4>
                    
                    {selectedAnalysis.file_type === 'text' ? (
                      // Show text content for text analyses
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {selectedAnalysis.user_description || 'Il testo inserito per l\'analisi non è disponibile.'}
                        </p>
                      </div>
                    ) : selectedAnalysis.file_type.startsWith('image/') ? (
                      // Show image for image analyses
                      <div className="space-y-3">
                        {selectedAnalysis.storage_path ? (
                          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-950/30">
                            <div className="flex justify-center">
                              <img 
                                src={`${supabase.storage.from('pet-media').getPublicUrl(selectedAnalysis.storage_path).data.publicUrl}`}
                                alt="Immagine analizzata"
                                className="max-w-full max-h-96 rounded-lg object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'block';
                                  }
                                }}
                              />
                              <div className="hidden text-center text-muted-foreground">
                                <p>Impossibile caricare l'immagine</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted/50 border rounded-lg text-center">
                            <p className="text-muted-foreground">
                              Immagine non disponibile
                            </p>
                          </div>
                      )}
                      </div>
                    ) : selectedAnalysis.file_type.includes('video') ? (
                      // Show video player for video files
                      <div className="space-y-3">
                        {selectedAnalysis.storage_path ? (
                          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-950/30">
                            <div className="flex justify-center">
                              <video 
                                src={`${supabase.storage.from('pet-media').getPublicUrl(selectedAnalysis.storage_path).data.publicUrl}`}
                                controls
                                className="max-w-full max-h-96 rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'block';
                                  }
                                }}
                              />
                              <div className="hidden text-center text-muted-foreground">
                                <p>Impossibile caricare il video</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted/50 border rounded-lg text-center">
                            <p className="text-muted-foreground">
                              Video non disponibile
                            </p>
                          </div>
                        )}
                      </div>
                    ) : selectedAnalysis.file_type.includes('audio') ? (
                      // Show audio player for audio files
                      <AudioPlayer 
                        storagePath={selectedAnalysis.storage_path}
                        fileName={getReadableAnalysisName(selectedAnalysis, language)}
                      />
                    ) : (
                      // Default message for other file types
                      <div className="p-4 bg-muted/50 border rounded-lg text-center">
                        <p className="text-muted-foreground">
                          File multimediale non disponibile per la visualizzazione
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
              <Button onClick={() => generatePDFReport(selectedAnalysis)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {getText('downloadReport')}
              </Button>
              <Button onClick={() => setShareDialogOpen(true)} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                {getText('share')}
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
                {analyses.slice(1, 4).map((analysis, index) => {
                  const daysDiff = Math.floor((new Date(selectedAnalysis.created_at).getTime() - new Date(analysis.created_at).getTime()) / (1000 * 60 * 60 * 24));
                  const confidenceDiff = selectedAnalysis.primary_confidence - analysis.primary_confidence;
                  
                  return (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{getEmotionIcon(analysis.primary_emotion)}</div>
                        <div>
                          <p className="font-medium">{getText('similarEpisode')}</p>
                          <p className="text-sm text-muted-foreground">
                            {getText('similarBehavior')} {format(new Date(analysis.created_at), 'dd/MM/yyyy')} {getText('withEmotion')} {analysis.primary_emotion} ({(analysis.primary_confidence * 100).toFixed(0)}% {getText('confidenceLevel')})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {daysDiff} {daysDiff === 1 ? getText('day') : getText('daysSince')} {getText('lastAnalysis')}
                        </div>
                        <div className={cn("text-xs", confidenceDiff > 0 ? "text-green-600" : confidenceDiff < 0 ? "text-red-600" : "text-gray-600")}>
                          {getText('confidenceVariation')}: {confidenceDiff > 0 ? '+' : ''}{(confidenceDiff * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getText('share')}</DialogTitle>
            <DialogDescription>
              Condividi i risultati dell'analisi di {petName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {['twitter', 'facebook', 'instagram', 'whatsapp'].map((platform) => (
              <Button
                key={platform}
                variant="outline"
                onClick={() => {
                  // Implement sharing logic here
                  console.log(`Sharing to ${platform}`);
                  setShareDialogOpen(false);
                }}
              >
                <div>{getText(platform.toLowerCase())}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnalysisResults;