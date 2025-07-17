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
import { supabase } from '@/integrations/supabase/client';
import { usePets } from '@/contexts/PetContext';
import jsPDF from 'jspdf';

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

// Usa la stessa logica del hook usePlaylistRecommendations per garantire coerenza
const getRecommendedPlaylist = (emotion: string, confidence: number) => {
  const emotionLower = emotion.toLowerCase();
  
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

    case 'felice':
    case 'giocoso':
      return {
        name: "Mantenimento Benessere",
        description: "Frequenze per mantenere lo stato positivo",
        frequency: "40Hz",
        duration: 10,
        reasoning: `Stato emotivo positivo - consolidamento del benessere`
      };

    default:
      return {
        name: "Equilibrio Generale",
        description: "Sessione bilanciata per stabilità emotiva",
        frequency: "528Hz + 10Hz",
        duration: 15,
        reasoning: `Stato emotivo neutro - mantenimento equilibrio`
      };
  }
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
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
        <h3 className="text-lg font-semibold mb-2">Nessun Risultato</h3>
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
        title: "Errore",
        description: "Nessun pet selezionato",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create diary entry with analysis data
      const diaryData = {
        title: `Analisi emotiva - ${analysis.primary_emotion}`,
        content: `Analisi del ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}:\n\nEmozione primaria: ${analysis.primary_emotion} (${analysis.primary_confidence}% confidenza)\n\nInsights: ${analysis.behavioral_insights}\n\nRaccomandazioni:\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\nTrigger identificati: ${analysis.triggers.join(', ')}`,
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
        title: "Errore",
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
        description: `Controllo comportamentale programmato dopo l'analisi del ${format(new Date(analysis.created_at), 'dd/MM/yyyy', { locale: it })}.\n\nEmozione rilevata: ${analysis.primary_emotion} (${analysis.primary_confidence}% confidenza)\n\nNote: Verificare il comportamento e l'umore del pet, confrontare con i risultati precedenti.`,
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
      addText(`Livello di Confidenza: ${analysis.primary_confidence}% (${getConfidenceLabel(analysis.primary_confidence)})`, 12);
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
                  <span className={getConfidenceColor(selectedAnalysis.primary_confidence)}>
                    {getConfidenceLabel(selectedAnalysis.primary_confidence)}
                  </span>
                </div>
                <Progress value={selectedAnalysis.primary_confidence} className="h-3" />
                <p className="text-2xl font-bold">
                  {selectedAnalysis.primary_confidence}%
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="emotions">Emozioni</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Consigli</TabsTrigger>
                <TabsTrigger value="triggers">Trigger</TabsTrigger>
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
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Analisi registrata durante orario diurno. Livelli di rumore ambientale: moderati. 
                    Temperatura stimata: 22°C. Presenza umana rilevata nelle vicinanze.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Raccomandazioni Personalizzate
                  </h4>
                  <div className="space-y-3">
                    {selectedAnalysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                        <Target className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-yellow-800 dark:text-yellow-200">
                            {recommendation}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => addToDiary(selectedAnalysis)}
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              Aggiungi al Diario
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => scheduleFollowUp(selectedAnalysis)}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Programma Follow-up
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Music Therapy Recommendations */}
                <div className="mt-6">
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
                          {getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence).name}
                        </h5>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                          {getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence).description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-purple-600 dark:text-purple-400 mb-3">
                          <span>🎵 {getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence).frequency}</span>
                          <span>⏱️ {getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence).duration} min</span>
                          <span>🎯 Confidenza: {selectedAnalysis.primary_confidence}%</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            const playlist = getRecommendedPlaylist(selectedAnalysis.primary_emotion, selectedAnalysis.primary_confidence);
                            const playlistData = encodeURIComponent(JSON.stringify(playlist));
                            window.location.href = `/wellness?tab=music-therapy&petId=${selectedPet?.id}&playlist=${playlistData}`;
                          }}
                        >
                          <AudioLines className="h-3 w-3 mr-1" />
                          Inizia Sessione Musicoterapia
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
                      Comportamento simile osservato il {format(new Date(mostRecentOther.created_at), 'dd MMMM', { locale: it })} 
                      con emozione "{mostRecentOther.primary_emotion}" (confidenza {mostRecentOther.primary_confidence}%)
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
                      
                      const currentConfidence = selectedAnalysis.primary_confidence;
                      const previousConfidence = otherAnalyses[0].primary_confidence;
                      const improvement = ((currentConfidence - previousConfidence) / previousConfidence * 100).toFixed(1);
                      return Number(improvement) > 0 ? `+${improvement}%` : `${improvement}%`;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">Variazione Confidenza</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const otherAnalyses = analyses.filter(a => a.id !== selectedAnalysis.id);
                      if (otherAnalyses.length === 0) return '0';
                      
                      const current = new Date(selectedAnalysis.created_at);
                      const previous = new Date(otherAnalyses[0].created_at);
                      const diffTime = Math.abs(current.getTime() - previous.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">Giorni Dall'Ultima Analisi</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const similarEmotions = analyses.filter(a => a.primary_emotion === selectedAnalysis.primary_emotion).length;
                      const consistency = (similarEmotions / analyses.length * 100).toFixed(0);
                      return `${consistency}%`;
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
                      {(comparedAnalyses.reduce((sum, a) => sum + a.primary_confidence, 0) / comparedAnalyses.length).toFixed(1)}%
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
                        <div className="text-lg font-bold">{analysis.primary_confidence}%</div>
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
                        pdf.text(`Emozione: ${analysis.primary_emotion} (${analysis.primary_confidence}%)`, 20, yPosition);
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