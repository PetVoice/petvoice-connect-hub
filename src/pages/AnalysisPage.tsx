import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
  FileText,
  Trash2,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Components
import FileUploader from '@/components/analysis/FileUploader';
import AudioRecorder from '@/components/analysis/AudioRecorder';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';
import ProcessingAnimation from '@/components/analysis/ProcessingAnimation';

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
  const { selectedPet } = usePets();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisData[]>([]);
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

  // Load analyses
  useEffect(() => {
    if (selectedPet) {
      loadAnalyses();
    }
  }, [selectedPet]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [analyses, searchTerm, emotionFilter, confidenceFilter, dateRange]);

  const loadAnalyses = async () => {
    if (!selectedPet) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.primary_emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.behavioral_insights.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Emotion filter
    if (emotionFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.primary_emotion === emotionFilter);
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      const minConfidence = parseInt(confidenceFilter);
      filtered = filtered.filter(analysis => analysis.primary_confidence >= minConfidence);
    }

    // Date filter
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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await processFile(file, i + 1, files.length);
      }
      
      setActiveTab('results');
      loadAnalyses();
      
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
    
    // Upload file
    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 10,
      stage: `Caricamento file ${current}/${total}...`,
      currentFile: file.name
    }));

    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-media')
      .upload(`analyses/${selectedPet!.id}/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Simulate AI analysis
    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 30,
      stage: `Analisi AI in corso...`
    }));

    // Mock analysis - in real app this would call an edge function
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis = generateMockAnalysis(file, uploadData.path);

    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 60,
      stage: `Salvataggio risultati...`
    }));

    // Save to database
    const { error: dbError } = await supabase
      .from('pet_analyses')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        pet_id: selectedPet!.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: uploadData.path,
        ...mockAnalysis
      });

    if (dbError) throw dbError;

    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 100 / total,
      stage: current === total ? 'Completato!' : `Preparazione file ${current + 1}...`
    }));
  };

  const generateMockAnalysis = (file: File, storagePath: string) => {
    const emotions = ['felice', 'calmo', 'ansioso', 'eccitato', 'triste', 'aggressivo', 'giocoso'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    const secondaryEmotions: Record<string, number> = {};
    emotions.filter(e => e !== primaryEmotion).slice(0, 2).forEach(emotion => {
      secondaryEmotions[emotion] = Math.floor(Math.random() * 30) + 10;
    });

    const insights = [
      "Il pet mostra segni di stress durante i rumori forti",
      "Comportamento tipico per l'orario della giornata",
      "Livello di energia coerente con l'età e la razza",
      "Possibili indicatori di bisogni non soddisfatti"
    ];

    const recommendations = [
      "Aumentare il tempo di gioco quotidiano",
      "Introdurre esercizi di rilassamento",
      "Valutare l'ambiente circostante per fattori stressanti",
      "Mantenere routine consistent"
    ];

    const triggers = [
      "Rumori improvvisi",
      "Cambiamenti nell'ambiente", 
      "Presenza di estranei",
      "Orario dei pasti"
    ];

    return {
      primary_emotion: primaryEmotion,
      primary_confidence: confidence,
      secondary_emotions: secondaryEmotions,
      behavioral_insights: insights[Math.floor(Math.random() * insights.length)],
      recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2),
      triggers: triggers.slice(0, Math.floor(Math.random() * 2) + 1),
      analysis_duration: `${Math.floor(Math.random() * 5) + 2} secondi`
    };
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const file = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
    const fileList = new DataTransfer();
    fileList.items.add(file);
    await handleFileUpload(fileList.files);
  };

  const handleBatchExport = async () => {
    if (selectedAnalyses.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un'analisi da esportare",
        variant: "destructive"
      });
      return;
    }

    // Mock PDF generation
    toast({
      title: "Export in corso...",
      description: `Generazione PDF per ${selectedAnalyses.length} analisi`,
    });

    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Export completato!",
        description: "Il file PDF è stato scaricato",
      });
    }, 2000);
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nessun Pet Selezionato</h2>
          <p className="text-muted-foreground">
            Seleziona un pet dal menu in alto per iniziare le analisi emotive
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-coral to-coral-dark bg-clip-text text-transparent">
            Analisi Emotiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Analizza le emozioni di {selectedPet.name} con l'intelligenza artificiale
          </p>
        </div>
        <div className="flex gap-2">
          {selectedAnalyses.length > 0 && (
            <Button onClick={handleBatchExport} className="gradient-coral text-white">
              <Download className="h-4 w-4 mr-2" />
              Esporta Selezionate ({selectedAnalyses.length})
            </Button>
          )}
        </div>
      </div>

      {/* Processing Overlay */}
      {processing.isProcessing && (
        <ProcessingAnimation 
          progress={processing.progress}
          stage={processing.stage}
          currentFile={processing.currentFile}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FileUploader onFilesSelected={handleFileUpload} />
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analyses.length > 0 ? (
            <AnalysisResults 
              analyses={analyses.slice(0, 3)} 
              petName={selectedPet.name}
            />
          ) : (
            <Card className="text-center p-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nessuna Analisi Disponibile</h3>
              <p className="text-muted-foreground mb-4">
                Carica il primo file audio o video per iniziare
              </p>
              <Button onClick={() => setActiveTab('upload')} className="gradient-coral text-white">
                <Upload className="h-4 w-4 mr-2" />
                Inizia Prima Analisi
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtri Avanzati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cerca</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome file, emozione..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Emozione</label>
                  <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutte le emozioni" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le emozioni</SelectItem>
                      <SelectItem value="felice">Felice</SelectItem>
                      <SelectItem value="calmo">Calmo</SelectItem>
                      <SelectItem value="ansioso">Ansioso</SelectItem>
                      <SelectItem value="eccitato">Eccitato</SelectItem>
                      <SelectItem value="triste">Triste</SelectItem>
                      <SelectItem value="aggressivo">Aggressivo</SelectItem>
                      <SelectItem value="giocoso">Giocoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confidence</label>
                  <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti i livelli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i livelli</SelectItem>
                      <SelectItem value="90">≥ 90%</SelectItem>
                      <SelectItem value="80">≥ 80%</SelectItem>
                      <SelectItem value="70">≥ 70%</SelectItem>
                      <SelectItem value="60">≥ 60%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Periodo</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {dateRange?.from ? (
                          dateRange?.to ? (
                            `${format(dateRange!.from, "dd/MM/yy", { locale: it })} - ${format(dateRange!.to, "dd/MM/yy", { locale: it })}`
                          ) : (
                            format(dateRange!.from, "dd/MM/yy", { locale: it })
                          )
                        ) : (
                          "Seleziona periodo"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {(searchTerm || emotionFilter !== 'all' || confidenceFilter !== 'all' || dateRange?.from) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredAnalyses.length} di {analyses.length} analisi
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setEmotionFilter('all');
                      setConfidenceFilter('all');
                      setDateRange(undefined);
                    }}
                  >
                    Cancella filtri
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <AnalysisHistory 
            analyses={filteredAnalyses}
            loading={loading}
            selectedAnalyses={selectedAnalyses}
            onSelectionChange={setSelectedAnalyses}
            petName={selectedPet.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisPage;