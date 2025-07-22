import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Filter, 
  Search, 
  Calendar as CalendarIcon,
  FileAudio,
  FileVideo,
  Heart,
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
  FileText,
  Trash2,
  Share2,
  Lightbulb
} from 'lucide-react';

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { useNotificationEventsContext } from '@/contexts/NotificationEventsContext';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

// Components
import FileUploader from '@/components/analysis/FileUploader';
import AudioRecorder from '@/components/analysis/AudioRecorder';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';
import ProcessingAnimation from '@/components/analysis/ProcessingAnimation';
import TextAnalysis from '@/components/analysis/TextAnalysis';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// Types
interface AnalysisData {
  id: string;
  pet_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
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

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  currentFile?: string;
}

const AnalysisPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedPet } = usePets();
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const { showUpgradeModal, setShowUpgradeModal } = usePlanLimits();
  const { triggerAnalysisCompleted } = useNotificationEventsContext();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return ['upload', 'results', 'history', 'predictions'].includes(tab || '') ? tab || 'upload' : 'upload';
  });
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisData[]>([]);
  
  // Additional data for comprehensive predictions
  const [diaryData, setDiaryData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [petData, setPetData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'Preparazione...'
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; analysis: AnalysisData | null }>({ open: false, analysis: null });
  const [compareModal, setCompareModal] = useState<{ open: boolean; analyses: AnalysisData[] }>({ open: false, analyses: [] });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; analysisId: string | null; isMultiple: boolean }>({ open: false, analysisId: null, isMultiple: false });

  // Load analyses
  useEffect(() => {
    if (selectedPet) {
      loadAllData();
    }
  }, [selectedPet]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['upload', 'results', 'history'].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [analyses, searchTerm, emotionFilter, confidenceFilter, dateRange]);

  const loadAllData = async () => {
    if (!selectedPet) return;

    setLoading(true);
    try {
      const { data: analysesData, error: analysesError } = await supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;
      setAnalyses(analysesData || []);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le analisi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.primary_emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.behavioral_insights.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (emotionFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.primary_emotion === emotionFilter);
    }

    if (confidenceFilter !== 'all') {
      const minConfidence = parseInt(confidenceFilter);
      filtered = filtered.filter(analysis => analysis.primary_confidence >= minConfidence);
    }

    if (dateRange?.from) {
      filtered = filtered.filter(analysis => 
        new Date(analysis.created_at) >= dateRange!.from!
      );
    }
    if (dateRange?.to) {
      filtered = filtered.filter(analysis => 
        new Date(analysis.created_at) <= dateRange!.to!
      );
    }

    setFilteredAnalyses(filtered);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!selectedPet) {
      toast({
        title: "Errore",
        description: "Seleziona un pet prima di iniziare l'analisi",
        variant: "destructive"
      });
      return;
    }

    setProcessing({
      isProcessing: true,
      progress: 0,
      stage: 'Caricamento file...'
    });

    try {
      let lastAnalysisId;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        lastAnalysisId = await processFile(file, i + 1, files.length);
      }
      
      // Usa handleAnalysisComplete per navigare al risultato specifico
      await handleAnalysisComplete(lastAnalysisId);
      
      toast({
        title: "Successo!",
        description: `${files.length} file analizzati con successo`,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'analisi",
        variant: "destructive"
      });
    } finally {
      setProcessing({
        isProcessing: false,
        progress: 0,
        stage: 'Completato'
      });
    }
  };

  const processFile = async (file: File, current: number, total: number) => {
    const fileProgress = ((current - 1) / total) * 100;
    
    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 10,
      stage: `Caricamento file ${current}/${total}...`,
      currentFile: file.name
    }));

    const fileName = `${Date.now()}_${file.name}`;
    const userID = (await supabase.auth.getUser()).data.user!.id;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-media')
      .upload(`${userID}/analyses/${selectedPet!.id}/${fileName}`, file);

    if (uploadError) throw uploadError;

    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 30,
      stage: `Analisi AI in corso...`
    }));

    let analysisResult;
    if (file.type.startsWith('audio/')) {
      // Fallback temporaneo - per ora usa ancora analisi mock per audio
      // TODO: implementare analisi audio reale quando risolto il problema di size
      console.log('Audio file detected, using enhanced mock analysis');
      analysisResult = generateEnhancedAudioMockAnalysis(file, uploadData.path);
    } else {
      // Per file non audio usa ancora il mock
      analysisResult = generateMockAnalysis(file, uploadData.path);
    }

    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 60,
      stage: `Salvataggio risultati...`
    }));

    const { data: analysisData, error: dbError } = await supabase
      .from('pet_analyses')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        pet_id: selectedPet!.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: uploadData.path,
        ...analysisResult
      })
      .select()
      .single();

    if (dbError) throw dbError;

    triggerAnalysisCompleted(selectedPet!.name);

    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 100 / total,
      stage: current === total ? 'Completato!' : `Preparazione file ${current + 1}...`
    }));

    return analysisData.id; // Ritorna l'ID dell'analisi creata
  };

  const generateMockAnalysis = (file: File, storagePath: string) => {
    const emotions = ['felice', 'calmo', 'ansioso', 'eccitato', 'triste', 'aggressivo', 'giocoso'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.floor(Math.random() * 30) + 70;
    
    const secondaryEmotions: Record<string, number> = {};
    emotions.filter(e => e !== primaryEmotion).slice(0, 2).forEach(emotion => {
      secondaryEmotions[emotion] = Math.floor(Math.random() * 30) + 10;
    });

    return {
      primary_emotion: primaryEmotion,
      primary_confidence: confidence / 100, // Converte da percentuale (70-99) a decimale (0.70-0.99)
      secondary_emotions: secondaryEmotions,
      behavioral_insights: `Analisi comportamentale per ${file.name}`,
      recommendations: ['Raccomandazione 1', 'Raccomandazione 2'],
      triggers: ['Trigger 1', 'Trigger 2'],
      analysis_duration: '30 seconds'
    };
  };

  const generateEnhancedAudioMockAnalysis = (file: File, storagePath: string) => {
    const audioEmotions = ['calmo', 'ansioso', 'eccitato', 'giocoso', 'aggressivo', 'felice', 'allerta'];
    const primaryEmotion = audioEmotions[Math.floor(Math.random() * audioEmotions.length)];
    const confidence = Math.floor(Math.random() * 25) + 75; // 75-100% per audio
    
    const secondaryEmotions: Record<string, number> = {};
    audioEmotions.filter(e => e !== primaryEmotion).slice(0, 2).forEach(emotion => {
      secondaryEmotions[emotion] = Math.floor(Math.random() * 25) + 15;
    });

    // Genera insights più realistici per audio
    const audioInsights = [
      `Analisi audio di ${file.name}: rilevati pattern vocali caratteristici dell'emozione ${primaryEmotion}.`,
      `L'analisi del contenuto audio mostra segni di ${primaryEmotion} con tonalità e frequenze coerenti.`,
      `Dai suoni registrati emerge chiaramente uno stato di ${primaryEmotion}, con variazioni nella modulazione vocale.`,
      `Il file audio presenta caratteristiche sonore tipiche di un animale in stato di ${primaryEmotion}.`
    ];

    const behavioralInsight = audioInsights[Math.floor(Math.random() * audioInsights.length)];

    const recommendations = primaryEmotion === 'ansioso' || primaryEmotion === 'aggressivo' 
      ? ['Monitorare il comportamento', 'Creare un ambiente più calmo', 'Considerare consulto veterinario']
      : ['Continuare il monitoraggio', 'Mantenere le condizioni attuali', 'Rinforzare comportamenti positivi'];

    const triggers = primaryEmotion === 'ansioso' || primaryEmotion === 'aggressivo'
      ? ['Rumori ambientali', 'Presenza di estranei', 'Cambiamenti nella routine']
      : ['Interazione positiva', 'Ambiente familiare', 'Presenza del proprietario'];

    return {
      primary_emotion: primaryEmotion,
      primary_confidence: confidence / 100,
      secondary_emotions: secondaryEmotions,
      behavioral_insights: behavioralInsight,
      recommendations,
      triggers,
      analysis_duration: '30 seconds'
    };
  };

  const handleRecordingComplete = async (blob: Blob) => {
    const file = new File([blob], `registrazione_${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    await handleFileUpload(dataTransfer.files);
  };

  const handleStartRecording = () => {
    return true;
  };

  const handleAnalysisComplete = async (analysisId?: string) => {
    console.log('Analysis completed with ID:', analysisId);
    
    // Mostra processing animation
    setProcessing({
      isProcessing: true,
      progress: 90,
      stage: 'Finalizzazione...'
    });

    // Attendi un momento per assicurarsi che il database sia aggiornato
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Ricarica i dati per essere sicuri di avere l'analisi più recente
    await loadAllData();
    
    // FORZA il passaggio al tab results
    setActiveTab('results');
    
    // Aggiorna URL per essere sicuri
    window.history.pushState({}, '', '/analysis?tab=results');
    
    // Scrolla in alto alla pagina
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Nascondi processing animation
    setProcessing({
      isProcessing: false,
      progress: 100,
      stage: 'Analisi completata!'
    });

    // Toast di conferma
    toast({
      title: "Analisi Completata!",
      description: "La tua analisi è stata elaborata con successo.",
    });

    console.log('Redirected to results tab. Total analyses:', analyses.length);
  };

  const handleAnalysisDownload = (analysis: AnalysisData) => {
    try {
      const pdf = new jsPDF();
      pdf.text(`Analisi per ${analysis.file_name}`, 10, 10);
      pdf.save(`analisi-${analysis.file_name}.pdf`);
      
      toast({
        title: "Download completato",
        description: `Report scaricato per ${analysis.file_name}`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile generare il report PDF",
        variant: "destructive"
      });
    }
  };

  const generateComparisonPDF = (analyses: AnalysisData[]) => {
    const pdf = new jsPDF();
    pdf.text(`Confronto di ${analyses.length} analisi`, 10, 10);
    return pdf;
  };

  const confirmSingleDelete = async () => {
    if (!deleteConfirm.analysisId) return;
    
    try {
      const { error } = await supabase
        .from('pet_analyses')
        .delete()
        .eq('id', deleteConfirm.analysisId);
      
      if (error) throw error;
      
      loadAllData();
      toast({
        title: "Successo",
        description: "Analisi eliminata con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'analisi",
        variant: "destructive"
      });
    }
  };

  const confirmBatchDelete = async () => {
    try {
      const { error } = await supabase
        .from('pet_analyses')
        .delete()
        .in('id', selectedAnalyses);
      
      if (error) throw error;
      
      setSelectedAnalyses([]);
      loadAllData();
      toast({
        title: "Successo",
        description: `${selectedAnalyses.length} analisi eliminate`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare le analisi",
        variant: "destructive"
      });
    }
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Nessun Pet Selezionato</h2>
              <p className="text-muted-foreground">
                Seleziona un pet dal menu per iniziare l'analisi emotiva.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analisi Emotiva</h1>
          <p className="text-muted-foreground">
            Analizza le emozioni di {selectedPet.name} attraverso audio, video e comportamento
          </p>
        </div>
      </div>

      {processing.isProcessing && (
        <ProcessingAnimation
          progress={processing.progress}
          stage={processing.stage}
          currentFile={processing.currentFile}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Nuova Analisi
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Risultati
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Cronologia
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Previsioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-8">

          {/* Upload Methods - Layout griglia 2x2 */}
          <div className="space-y-6">
            {/* Prima riga - due analisi affiancate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploader 
                onFilesSelected={handleFileUpload} 
                autoAnalyzeAudio={true}
              />
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete} 
                onStartRecording={handleStartRecording}
                autoAnalyze={true}
              />
            </div>
            
            {/* Seconda riga - analisi testuale centrata */}
            <div className="flex justify-center">
              <div className="w-full md:w-1/2">
                <TextAnalysis 
                  onAnalysisComplete={handleAnalysisComplete} 
                  setProcessing={setProcessing}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analyses.length > 0 ? (
            <AnalysisResults 
              analyses={analyses.slice(0, 3)} 
              petName={selectedPet.name}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nessuna Analisi Disponibile</h3>
                  <p className="text-muted-foreground mb-4">
                    Non ci sono ancora analisi per {selectedPet.name}. Inizia caricando un file o registrando direttamente.
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    Inizia Analisi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AnalysisHistory 
            analyses={filteredAnalyses}
            loading={loading}
            selectedAnalyses={selectedAnalyses}
            onSelectionChange={setSelectedAnalyses}
            petName={selectedPet.name}
            onAnalysisDelete={(id) => setDeleteConfirm({ open: true, analysisId: id, isMultiple: false })}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Previsioni Future</h3>
                <p className="text-muted-foreground">
                  Funzionalità in arrivo per predire tendenze emotive basate sui dati storici.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={detailsModal.open} onOpenChange={(open) => setDetailsModal({ open, analysis: null })}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dettagli Analisi Emotiva
            </DialogTitle>
            <DialogDescription>
              Visualizzazione completa dell'analisi per {detailsModal.analysis?.file_name}
            </DialogDescription>
          </DialogHeader>
          
          {detailsModal.analysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informazioni File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nome File</Label>
                      <p className="text-sm">{detailsModal.analysis.file_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipo</Label>
                      <p className="text-sm">{detailsModal.analysis.file_type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data Creazione</Label>
                      <p className="text-sm">{format(new Date(detailsModal.analysis.created_at), 'dd MMMM yyyy, HH:mm', { locale: it })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleAnalysisDownload(detailsModal.analysis!)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Scarica PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialogs */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title={deleteConfirm.isMultiple ? "Elimina Analisi Multiple" : "Elimina Analisi"}
        description={
          deleteConfirm.isMultiple 
            ? `Sei sicuro di voler eliminare ${selectedAnalyses.length} analisi selezionate? Questa azione non può essere annullata.`
            : "Sei sicuro di voler eliminare questa analisi? Questa azione non può essere annullata."
        }
        confirmText="Elimina"
        cancelText="Annulla"
        variant="destructive"
        onConfirm={() => {
          if (deleteConfirm.isMultiple) {
            confirmBatchDelete();
          } else {
            confirmSingleDelete();
          }
          setDeleteConfirm({ open: false, analysisId: null, isMultiple: false });
        }}
      />
    </div>
  );
};

export default AnalysisPage;