import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const language = 'it';
  const { showToast } = useTranslatedToast();
  const { selectedPet } = usePets();
  const navigate = useNavigate();

  // Helper function to translate hardcoded analysis data
  const translateAnalysisData = (text: string, type: 'insights' | 'recommendations' | 'triggers') => {
    // If the text looks like a translation key, return it as is
    if (text.startsWith('analysis.')) {
      return text;
    }
    
    return text;
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
        title: 'Protocollo Avviato!',
        description: `${protocol.name} è stato avviato con successo`,
        variant: "default"
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
          content: `${getText('primaryEmotion')}: ${analysis.primary_emotion} (${analysis.primary_confidence}% ${getText('confidence')})\n\n${getText('insights')}: ${analysis.behavioral_insights}\n\n${getText('recommendations')}: ${analysis.recommendations.join(', ')}`
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
      doc.text(`Emozione Primaria: ${analysis.primary_emotion} (${analysis.primary_confidence}%)`, 20, yPosition);
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
                    variant={selectedAnalysis?.id === analysis.id ? "default" : "outline"}
                    className="h-auto p-4 justify-start"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="text-2xl">{getEmotionIcon(analysis.primary_emotion)}</div>
                      <div className="text-left">
                        <div className="font-medium">{getReadableAnalysisName(analysis, language)}</div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.primary_emotion} - {analysis.primary_confidence}%
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
                  <span>{selectedAnalysis.file_name}</span>
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
                  <TabsTrigger value="audio">{getText('audioTab')}</TabsTrigger>
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
                            {confidence}%
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
                    const recommendedId = getRecommendedProtocol([selectedAnalysis.primary_emotion]);
                    const protocolsArray = Object.values(allProtocols);
                    const protocol = recommendedId ? protocolsArray.find(p => p.id === recommendedId) : null;
                    
                    if (protocol) {
                      return (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            {getText('trainingProtocol')}
                          </h4>
                          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h5 className="font-semibold text-green-800 dark:text-green-200">{protocol.name}</h5>
                                <p className="text-sm text-green-700 dark:text-green-300">{protocol.description}</p>
                                <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                                  <span>📚 {(protocol as any)?.exercises?.length || 0} esercizi</span>
                                  <span>⏱️ ~{(protocol as any)?.duration || 4} settimane</span>
                                  <span>🎯 Difficoltà: {(protocol as any)?.difficulty || 'Media'}</span>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => autoStartProtocol(selectedAnalysis)}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                {getText('startTrainingProtocol')}
                              </Button>
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

                <TabsContent value="audio" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileAudio className="h-4 w-4" />
                      {getText('originalRecording')}
                    </h4>
                    {selectedAnalysis.file_type.includes('audio') ? (
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
                            {getText('similarBehavior')} {format(new Date(analysis.created_at), 'dd/MM/yyyy')} {getText('withEmotion')} {analysis.primary_emotion} ({analysis.primary_confidence}% {getText('confidenceLevel')})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {daysDiff} {daysDiff === 1 ? getText('day') : getText('daysSince')} {getText('lastAnalysis')}
                        </div>
                        <div className={cn("text-xs", confidenceDiff > 0 ? "text-green-600" : confidenceDiff < 0 ? "text-red-600" : "text-gray-600")}>
                          {getText('confidenceVariation')}: {confidenceDiff > 0 ? '+' : ''}{confidenceDiff}%
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