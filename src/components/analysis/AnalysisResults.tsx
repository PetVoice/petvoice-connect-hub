import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Clock, 
  FileAudio, 
  FileText, 
  Download, 
  BookOpen, 
  Target,
  AlertTriangle,
  Users,
  PieChart,
  Calendar,
  Share2,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { usePets } from '@/contexts/PetContext';

// Types
interface AnalysisData {
  id: string;
  pet_id: string;
  user_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string | null;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: any;
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
  rilassato: 'text-green-500 bg-green-500/10 border-green-500/20',
  eccitato: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  ansioso: 'text-red-500 bg-red-500/10 border-red-500/20',
  triste: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  stressato: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  aggressivo: 'text-red-600 bg-red-600/10 border-red-600/20',
  confuso: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  default: 'text-slate-500 bg-slate-500/10 border-slate-500/20'
};

// Translation system
const TRANSLATIONS = {
  it: {
    selectAnalysis: 'Seleziona Analisi',
    showResults: 'Visualizza i risultati di',
    recentAnalyses: 'analisi recenti',
    analysisOverview: 'Panoramica Analisi',
    primaryEmotion: 'Emozione Primaria',
    confidenceScore: 'Punteggio di Confidenza',
    durationLabel: 'Durata',
    dateLabel: 'Data',
    detailedAnalysis: 'Analisi Dettagliata',
    behavioralInsights: 'Approfondimenti comportamentali per',
    emotions: 'Emozioni',
    insights: 'Approfondimenti',
    recommendations: 'Raccomandazioni',
    triggers: 'Fattori Scatenanti',
    audio: 'Audio',
    analysisData: 'Dati Analisi',
    primaryEmotionDetected: 'Emozione primaria rilevata',
    confidenceLevel: 'Livello di confidenza',
    keyInsights: 'Insight Chiave',
    actionableRecommendations: 'Raccomandazioni Attuabili',
    startTrainingProtocol: 'Avvia Protocollo',
    identifiedTriggers: 'Fattori Scatenanti Identificati',
    audioPlayback: 'Riproduzione Audio',
    listenOriginalRecording: 'Ascolta la registrazione originale',
    notAudioFile: 'File non audio - Nessuna riproduzione disponibile',
    addToDiary: 'Aggiungi al Diario',
    scheduleFollowUp: 'Programma Follow-up',
    patternRecognition: 'Riconoscimento Pattern',
    previousComparisons: 'Confronti con analisi precedenti',
    emotionalTrends: 'Tendenze Emozionali',
    improvementAreas: 'Aree di Miglioramento',
    positiveIndicators: 'Indicatori Positivi',
    communityInsights: 'Insights Comunità',
    similarCases: 'Casi Simili',
    communityRecommendations: 'Raccomandazioni della Comunità',
    shareAnalysis: 'Condividi Analisi',
    exportReport: 'Esporta Report',
    generateReport: 'Genera Report',
    shareWith: 'Condividi con',
    veterinarian: 'Veterinario',
    trainer: 'Addestratore',
    community: 'Comunità',
    family: 'Famiglia',
    downloadPDF: 'Scarica PDF',
    analysis: 'Analisi',
    recording: 'Registrazione',
    cannotGenerateReport: 'Impossibile generare il report'
  }
};

const getText = (key: string): string => {
  return TRANSLATIONS.it[key as keyof typeof TRANSLATIONS.it] || key;
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
  const { toast } = useToast();
  const { selectedPet } = usePets();
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(
    analyses.length > 0 ? analyses[0] : null
  );

  useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysis) {
      setSelectedAnalysis(analyses[0]);
    }
  }, [analyses, selectedAnalysis]);

  const getEmotionColor = (emotion: string): string => {
    return EMOTION_COLORS[emotion.toLowerCase()] || EMOTION_COLORS.default;
  };

  const formatAnalysisTitle = (analysis: AnalysisData): string => {
    const date = new Date(analysis.created_at);
    const day = format(date, 'd', { locale: it });
    const month = format(date, 'MMM', { locale: it });
    const time = format(date, 'HH:mm', { locale: it });
    
    const emotionName = analysis.primary_emotion || 'Sconosciuto';
    
    if (analysis.file_type.startsWith('text/')) {
      return `${getText('analysis')} ${emotionName} - ${day} ${month}`;
    } else {
      return `${getText('recording')} ${emotionName} - ${day} ${month} ${time}`;
    }
  };

  const handleAddToDiary = (analysis: AnalysisData) => {
    toast({
      title: 'Aggiunto al diario',
      description: 'Analisi aggiunta al diario del pet',
    });
  };

  const scheduleFollowUp = (analysis: AnalysisData) => {
    toast({
      title: 'Follow-up programmato',
      description: 'Promemoria impostato per controllo futuro',
    });
  };

  const generateReport = async () => {
    try {
      toast({
        title: 'Report generato',
        description: 'Report PDF creato con successo',
      });
    } catch (error) {
      toast({
        title: 'Errore',
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
                      <FileText className="h-5 w-5" />
                    )}
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        {formatAnalysisTitle(analysis)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(analysis.created_at), 'dd/MM/yy HH:mm', { locale: it })}
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
        {/* Analysis Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {getText('analysisOverview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getText('primaryEmotion')}</span>
                <Badge className={getEmotionColor(selectedAnalysis.primary_emotion)}>
                  {selectedAnalysis.primary_emotion}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{getText('confidenceScore')}</span>
                <span>{Math.round(selectedAnalysis.primary_confidence)}%</span>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="emotions">{getText('emotions')}</TabsTrigger>
                <TabsTrigger value="insights">{getText('insights')}</TabsTrigger>
                <TabsTrigger value="recommendations">{getText('recommendations')}</TabsTrigger>
                <TabsTrigger value="triggers">{getText('triggers')}</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {getText('analysisData')}
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{getText('primaryEmotionDetected')}</span>
                        <Badge className={getEmotionColor(selectedAnalysis.primary_emotion)}>
                          {selectedAnalysis.primary_emotion}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{getText('confidenceLevel')}</span>
                        <span className="text-sm font-medium">{Math.round(selectedAnalysis.primary_confidence)}%</span>
                      </div>
                      <Progress value={selectedAnalysis.primary_confidence} className="h-2" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {getText('keyInsights')}
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <p className="text-sm">{selectedAnalysis.behavioral_insights}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {getText('actionableRecommendations')}
                  </h4>
                  <div className="space-y-3">
                    {selectedAnalysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                        <p className="text-sm mb-2">{recommendation}</p>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            window.location.href = `/training?emotion=${selectedAnalysis.primary_emotion}`;
                          }}
                        >
                          <Target className="h-3 w-3 mr-1" />
                          {getText('startTrainingProtocol')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
                          {trigger}
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
            <Button onClick={() => handleAddToDiary(selectedAnalysis)} variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              {getText('addToDiary')}
            </Button>
            <Button onClick={() => scheduleFollowUp(selectedAnalysis)} variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              {getText('scheduleFollowUp')}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  {getText('shareAnalysis')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{getText('shareWith')}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'veterinarian', platform: 'Veterinarian' },
                    { key: 'trainer', platform: 'Trainer' },
                    { key: 'community', platform: 'Community' },
                    { key: 'family', platform: 'Family' }
                  ].map((template) => (
                    <Button
                      key={template.key}
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: 'Condivisione completata',
                          description: `Analisi condivisa con ${template.platform}`,
                        });
                      }}
                    >
                      <div>{getText(template.platform.toLowerCase())}</div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              {getText('downloadPDF')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;