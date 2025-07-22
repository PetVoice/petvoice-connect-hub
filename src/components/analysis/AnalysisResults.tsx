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
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
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
  calmo: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  ansioso: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  eccitato: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  triste: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  aggressivo: 'text-red-500 bg-red-500/10 border-red-500/20',
  giocoso: 'text-green-500 bg-green-500/10 border-green-500/20'
};

const EMOTION_ICONS: Record<string, React.ReactNode> = {
  felice: '😊',
  calmo: '😌',
  ansioso: '😰',
  eccitato: '🤩',
  triste: '😢',
  aggressivo: '😠',
  giocoso: '😄'
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

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { selectedPet } = usePets();
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(
    analyses.length > 0 ? analyses[0] : null
  );
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedAnalyses, setComparedAnalyses] = useState<AnalysisData[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [templates, setTemplates] = useState<SharingTemplate[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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
        <h3 className="text-lg font-semibold mb-2">{t('analysis.history.noResults')}</h3>
        <p className="text-muted-foreground">
          Carica un file per vedere i risultati dell'analisi
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
    if (confidence >= 90) return 'Molto Alta';
    if (confidence >= 75) return 'Alta'; 
    if (confidence >= 60) return 'Media';
    return 'Bassa';
  };

  const addToDiary = async (analysis: AnalysisData) => {
    if (!selectedPet) {
      toast({
        title: t('errors.somethingWentWrong'),
        description: t('analysis.errors.selectPet'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Create diary entry with analysis data
      const diaryData = {
        title: `Analisi emotiva - ${analysis.primary_emotion}`,
        content: `Analisi del ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}:\n\nEmozione primaria: ${analysis.primary_emotion} (${Math.round(analysis.primary_confidence * 100)}% confidenza)\n\nInsights: ${analysis.behavioral_insights}\n\nRaccomandazioni:\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\nTrigger identificati: ${analysis.triggers.join(', ')}`,
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
      
      toast({
        title: "Successo!",
        description: "Analisi aggiunta al diario con successo!",
      });
    } catch (error) {
      console.error('Error adding to diary:', error);
      toast({
        title: t('errors.somethingWentWrong'),
        description: "Impossibile aggiungere l'analisi al diario",
        variant: "destructive"
      });
    }
  };

  const scheduleFollowUp = async (analysis: AnalysisData) => {
    if (!selectedPet) {
      toast({
        title: "Errore",
        description: "Nessun pet selezionato",
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

      toast({
        title: "Follow-up Programmato",
        description: `Promemoria creato per il ${format(followUpDate, 'dd/MM/yyyy HH:mm', { locale: it })} nel calendario`,
      });
    } catch (error) {
      console.error('Error creating follow-up event:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il promemoria nel calendario",
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
      addText(`File Analizzato: ${analysis.file_name}`, 10);
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
      addText('ANALISI COMPORTAMENTALE', 14, true);
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
        addText('TRIGGER IDENTIFICATI', 14, true);
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
      
      toast({
        title: "Report PDF Scaricato",
        description: `Il report PDF è stato salvato come ${fileName}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare il report PDF",
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
            <CardTitle>Seleziona Analisi</CardTitle>
            <CardDescription>
              Mostra risultati per {analyses.length} analisi recenti
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
                      <p className="font-medium truncate max-w-32">{analysis.file_name}</p>
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
              Emozione Primaria
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
                {selectedAnalysis.primary_emotion.charAt(0).toUpperCase() + selectedAnalysis.primary_emotion.slice(1)}
              </Badge>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidenza</span>
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
                <span className="text-muted-foreground">File:</span>
                <span className="font-medium truncate max-w-32" title={selectedAnalysis.file_name}>
                  {selectedAnalysis.file_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensione:</span>
                <span>{formatFileSize(selectedAnalysis.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durata analisi:</span>
                <span>{String(selectedAnalysis.analysis_duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span>{format(new Date(selectedAnalysis.created_at), 'dd/MM/yy HH:mm', { locale: it })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Analisi Dettagliata</CardTitle>
            <CardDescription>
              Insights comportamentali e raccomandazioni per {petName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="emotions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="emotions">Emozioni</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Consigli</TabsTrigger>
                <TabsTrigger value="triggers">Trigger</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Emozioni Secondarie
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedAnalysis.secondary_emotions).map(([emotion, confidence]) => (
                      <div key={emotion} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{EMOTION_ICONS[emotion] || '🔹'}</span>
                            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
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
                    Analisi Comportamentale
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    {selectedAnalysis.behavioral_insights}
                  </p>
                </div>

                {/* Environmental Context */}
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Zap className="h-4 w-4" />
                    Contesto Ambientale
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
                              ✨ {petName} sta bene!
                            </h5>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Emozione "{selectedAnalysis.primary_emotion}" rilevata. Il tuo pet è in uno stato emotivo positivo!
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
                        Playlist IA Music Therapy Consigliata
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
                              <span>🎯 Confidenza: {Math.round(selectedAnalysis.primary_confidence * 100)}%</span>
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
                              Inizia Sessione Musicoterapia
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
                          Protocollo di Training Raccomandato
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
                                    return 'Gestione Ansia da Separazione';
                                  } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                             emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                             emotion.includes('irritato')) {
                                    return 'Controllo Aggressività';
                                  } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                             emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                    return 'Superamento Paure e Fobie';
                                  } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                             emotion.includes('nervoso') || emotion.includes('irrequieto')) {
                                    return 'Gestione Iperattività';
                                  } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                             emotion.includes('depresso') || emotion.includes('depressione') ||
                                             emotion.includes('abbattuto') || emotion.includes('melanconico')) {
                                    return 'Supporto Emotivo e Benessere';
                                  } else {
                                    return 'Gestione Comportamento Generale';
                                  }
                                })()}
                              </h5>
                               <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                 {(() => {
                                   const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                   
                                   if (emotion.includes('ansia') || emotion.includes('ansioso') || 
                                       emotion.includes('stress') || emotion.includes('stressato') ||
                                       emotion.includes('preoccupato') || emotion.includes('inquieto')) {
                                     return 'Protocollo specifico per ridurre l\'ansia da separazione e migliorare la fiducia nel pet.';
                                   } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                              emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                              emotion.includes('irritato')) {
                                     return 'Tecniche di controllo per gestire comportamenti aggressivi e reattivi.';
                                   } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                              emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                     return 'Esercizi di desensibilizzazione per superare paure specifiche.';
                                   } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                              emotion.includes('nervoso') || emotion.includes('irrequieto')) {
                                     return 'Attività per canalizzare l\'energia eccessiva in comportamenti positivi.';
                                   } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                              emotion.includes('depresso') || emotion.includes('depressione') ||
                                              emotion.includes('abbattuto') || emotion.includes('melanconico')) {
                                     return 'Supporto emotivo personalizzato per migliorare l\'umore e il benessere del pet.';
                                   } else {
                                     return 'Protocollo generale per migliorare il comportamento e il benessere complessivo.';
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
                                         <span>📅 3 giorni</span>
                                         <span>🎯 Livello: Medio</span>
                                         <span>📊 Basato su: {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('aggressiv') || emotion.includes('arrabbiato') || 
                                              emotion.includes('rabbioso') || emotion.includes('frustrato') ||
                                              emotion.includes('irritato')) {
                                     return (
                                       <>
                                         <span>📅 3 giorni</span>
                                         <span>🎯 Livello: Difficile</span>
                                         <span>📊 Basato su: {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('paura') || emotion.includes('pauroso') || 
                                              emotion.includes('spaventato') || emotion.includes('terrorizzato')) {
                                     return (
                                       <>
                                         <span>📅 42 giorni</span>
                                         <span>🎯 Livello: Difficile</span>
                                         <span>📊 Basato su: {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('agitato') || emotion.includes('agitazione') ||
                                              emotion.includes('nervoso') || emotion.includes('irrequieto')) {
                                     return (
                                       <>
                                         <span>📅 28 giorni</span>
                                         <span>🎯 Livello: Medio</span>
                                         <span>📊 Basato su: {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else if (emotion.includes('triste') || emotion.includes('tristezza') ||
                                              emotion.includes('depresso') || emotion.includes('depressione') ||
                                              emotion.includes('abbattuto') || emotion.includes('melanconico')) {
                                     return (
                                       <>
                                         <span>📅 28 giorni</span>
                                         <span>🎯 Livello: Medio</span>
                                         <span>📊 Basato su: {selectedAnalysis.primary_emotion}</span>
                                       </>
                                     );
                                   } else {
                                     return (
                                       <>
                                         <span>📅 Variabile</span>
                                         <span>🎯 Livello: Personalizzato</span>
                                         <span>📊 Basato su: {selectedAnalysis.primary_emotion}</span>
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
                                        .select('id, status')
                                        .eq('user_id', user.id)
                                        .eq('title', originalProtocol.title)
                                        .single();

                                      if (existingProtocol) {
                                        // Se esiste già, vai direttamente al protocollo esistente
                                        window.location.href = `/training/dashboard/${existingProtocol.id}`;
                                        return;
                                      }

                                      // Crea una nuova copia del protocollo per l'utente
                                      const newProtocol = {
                                        title: originalProtocol.title,
                                        description: originalProtocol.description,
                                        category: originalProtocol.category,
                                        difficulty: originalProtocol.difficulty,
                                        duration_days: originalProtocol.duration_days,
                                        target_behavior: originalProtocol.target_behavior,
                                        triggers: originalProtocol.triggers,
                                        required_materials: originalProtocol.required_materials,
                                        current_day: 1,
                                        progress_percentage: 0,
                                        status: 'active',
                                        success_rate: 0,
                                        ai_generated: false,
                                        is_public: false,
                                        veterinary_approved: false,
                                        community_rating: 0,
                                        community_usage: 0,
                                        mentor_recommended: false,
                                        notifications_enabled: true,
                                        last_activity_at: new Date().toISOString(),
                                        user_id: user.id,
                                        pet_id: null,
                                        integration_source: 'analysis',
                                        estimated_cost: null,
                                        share_code: null,
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
                                Inizia Protocollo Training
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
                          Raccomandazioni Personalizzate
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
                                <span className="font-medium text-blue-800 dark:text-blue-200">Condizioni di salute: </span>
                                <span className="text-blue-700 dark:text-blue-300">
                                  Monitora attentamente i segni di stress durante il training. Consulta il veterinario prima di iniziare protocolli intensivi.
                                </span>
                              </div>
                            )}
                            
                            {/* Raccomandazione generale basata sull'emozione */}
                            <div className="text-sm">
                              <span className="font-medium text-blue-800 dark:text-blue-200">Per l'emozione "{selectedAnalysis.primary_emotion}": </span>
                              <span className="text-blue-700 dark:text-blue-300">
                                {(() => {
                                  const emotion = selectedAnalysis.primary_emotion.toLowerCase();
                                  if (emotion.includes('ansia') || emotion.includes('stress')) {
                                    return "Crea un ambiente sicuro e prevedibile. Evita cambiamenti bruschi nella routine.";
                                  } else if (emotion.includes('aggressiv') || emotion.includes('frustrato')) {
                                    return "Mantieni calma e distanza di sicurezza. Usa rinforzi positivi, mai punizioni.";
                                  } else if (emotion.includes('paura')) {
                                    return "Desensibilizzazione graduale. Non forzare l'esposizione, procedi con pazienza.";
                                  } else if (emotion.includes('triste') || emotion.includes('depresso')) {
                                    return "Aumenta attività gratificanti e interazioni sociali positive.";
                                  } else {
                                    return "Mantieni coerenza nel training e celebra ogni piccolo progresso.";
                                  }
                                })()}
                              </span>
                            </div>
                            
                            {/* Frequenza delle sessioni personalizzata */}
                            <div className="text-sm">
                              <span className="font-medium text-blue-800 dark:text-blue-200">Frequenza raccomandata: </span>
                              <span className="text-blue-700 dark:text-blue-300">
                                {selectedPet.age && selectedPet.age < 1 ? "2-3 sessioni brevi al giorno" :
                                 selectedAnalysis.primary_confidence > 80 ? "1-2 sessioni al giorno" :
                                 "1 sessione al giorno per evitare sovrastimolazione"}
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
                    Possibili Trigger Identificati
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedAnalysis.triggers.map((trigger, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          {trigger}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                          Monitora questo fattore per identificare pattern comportamentali
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
                    Registrazione Originale
                  </h4>
                  {selectedAnalysis.file_type.startsWith('audio/') ? (
                    <AudioPlayer 
                      storagePath={selectedAnalysis.storage_path}
                      fileName={selectedAnalysis.file_name}
                    />
                  ) : (
                    <div className="p-4 bg-muted/50 border rounded-lg text-center">
                      <p className="text-muted-foreground">
                        Questo file non è un audio. Player disponibile solo per registrazioni audio.
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
              Condividi
            </Button>
            <Button onClick={() => downloadReport(selectedAnalysis)} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Scarica Report
            </Button>
            <Button onClick={() => addToDiary(selectedAnalysis)} variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Aggiungi al Diario
            </Button>
            <Button onClick={() => scheduleFollowUp(selectedAnalysis)} variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Pianifica Follow-up
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
              Pattern Recognition
            </CardTitle>
            <CardDescription>
              Confronti con analisi precedenti
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
                      <span className="font-medium">Episodio Simile</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comportamento simile osservato il {format(new Date(mostRecentOther.created_at), 'dd MMMM', { locale: it })} con emozione "{mostRecentOther.primary_emotion}" (confidenza {Math.round(mostRecentOther.primary_confidence * 100)}%)
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
                      Confronta Analisi
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
                  <p className="text-sm text-muted-foreground">Variazione Confidenza</p>
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
                      if (diffDays === 0) return 'Oggi';
                      if (diffDays === 1) return '1 giorno';
                      
                      return `${diffDays} giorni`;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">Dall'Ultima Analisi</p>
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
                  <p className="text-sm text-muted-foreground">Consistenza Emotiva</p>
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
              Confronto Analisi Emotive
            </DialogTitle>
            <DialogDescription>
              Analisi comparativa di {comparedAnalyses.length} risultati
            </DialogDescription>
          </DialogHeader>
          
          {comparedAnalyses.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{comparedAnalyses.length}</div>
                    <p className="text-xs text-muted-foreground">Analisi Confrontate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {format(new Date(Math.min(...comparedAnalyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')} - {format(new Date(Math.max(...comparedAnalyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')}
                    </div>
                    <p className="text-xs text-muted-foreground">Periodo Analizzato</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {Math.round((comparedAnalyses.reduce((sum, a) => sum + (a.primary_confidence * 100), 0) / comparedAnalyses.length))}%
                    </div>
                    <p className="text-xs text-muted-foreground">Confidenza Media</p>
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
                        Analisi {index + 1}
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
                          {analysis.primary_emotion.charAt(0).toUpperCase() + analysis.primary_emotion.slice(1)}
                        </Badge>
                        <div className="text-lg font-bold">{Math.round(analysis.primary_confidence * 100)}%</div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Emozioni Secondarie</h4>
                        {Object.entries(analysis.secondary_emotions).slice(0, 3).map(([emotion, confidence]) => (
                          <div key={emotion} className="flex justify-between text-sm">
                            <span>{emotion}</span>
                            <span>{confidence}%</span>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Insights</h4>
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
                        pdf.text(`File: ${analysis.file_name}`, 20, yPosition);
                        yPosition += 15;
                      });
                      
                      const fileName = `confronto-analisi-${petName}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
                      pdf.save(fileName);
                      
                      toast({
                        title: "Download completato",
                        description: `Report di confronto scaricato: ${fileName}`,
                      });
                    } catch (error) {
                      toast({
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
            <DialogTitle>Condividi Analisi</DialogTitle>
            <DialogDescription>
              Scegli come condividere i risultati dell'analisi di {petName}
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
                <div className="capitalize">{template.platform}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisResults;