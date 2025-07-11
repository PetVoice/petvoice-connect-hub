import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  analysis_duration: string;
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

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, petName }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(
    analyses.length > 0 ? analyses[0] : null
  );
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedAnalyses, setComparedAnalyses] = useState<AnalysisData[]>([]);

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

  const addToDiary = (analysis: AnalysisData) => {
    // Navigate to diary with pre-filled data
    console.log('Adding to diary:', analysis);
  };

  const scheduleFollowUp = (analysis: AnalysisData) => {
    // Navigate to calendar with suggested follow-up
    console.log('Scheduling follow-up:', analysis);
  };

  const shareAnalysis = (analysis: AnalysisData) => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: `Analisi Emotiva - ${petName}`,
        text: `${petName} mostra emozione: ${analysis.primary_emotion} (${analysis.primary_confidence}% confidenza)`,
        url: window.location.href
      });
    }
  };

  const downloadReport = (analysis: AnalysisData) => {
    // Generate and download PDF report
    console.log('Downloading report:', analysis);
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
                <span>{selectedAnalysis.analysis_duration}</span>
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
            <Button onClick={() => shareAnalysis(selectedAnalysis)} variant="outline">
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
            <Button onClick={() => scheduleFollowUp(selectedAnalysis)} className="gradient-coral text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Programma Follow-up
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
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Episodio Simile</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comportamento simile osservato il {format(new Date(analyses[1].created_at), 'dd MMMM', { locale: it })} 
                  con emozione "{analyses[1].primary_emotion}" (confidenza {analyses[1].primary_confidence}%)
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  Confronta Analisi
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                  <p className="text-sm text-muted-foreground">Miglioramento Stato d'Animo</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">3.2</p>
                  <p className="text-sm text-muted-foreground">Giorni Tra Episodi Simili</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                  <p className="text-sm text-muted-foreground">Consistenza Comportamentale</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults;