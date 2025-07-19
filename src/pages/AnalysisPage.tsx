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
  const { checkAnalysisLimit, showUpgradePrompt, showUpgradeModal, setShowUpgradeModal } = usePlanLimits();
  const { triggerAnalysisCompleted } = useNotificationEventsContext();
  const [activeTab, setActiveTab] = useState(() => {
    // Leggi il parametro tab dall'URL, default a 'upload'
    const tab = searchParams.get('tab');
    return ['upload', 'results', 'history'].includes(tab || '') ? tab || 'upload' : 'upload';
  });
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
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; analysis: AnalysisData | null }>({ open: false, analysis: null });
  const [compareModal, setCompareModal] = useState<{ open: boolean; analyses: AnalysisData[] }>({ open: false, analyses: [] });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; analysisId: string | null; isMultiple: boolean }>({ open: false, analysisId: null, isMultiple: false });

  // Load analyses
  useEffect(() => {
    if (selectedPet) {
      loadAnalyses();
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

    // Rimuovo controllo limite analisi - solo piano premium disponibile

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
    const userID = (await supabase.auth.getUser()).data.user!.id;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-media')
      .upload(`${userID}/analyses/${selectedPet!.id}/${fileName}`, file);

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

    // Trigger notification for completed analysis
    triggerAnalysisCompleted(selectedPet!.name);

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
      analysis_duration: `${Math.floor(Math.random() * 5) + 2} seconds`
    };
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const file = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
    const fileList = new DataTransfer();
    fileList.items.add(file);
    await handleFileUpload(fileList.files);
  };

  const handleStartRecording = () => {
    if (!selectedPet) {
      toast({
        title: "Errore",
        description: "Seleziona un pet prima di iniziare l'analisi",
        variant: "destructive"
      });
      return false;
    }

    // Rimuovo controllo limite analisi - solo piano premium disponibile

    return true;
  };

  const generateAnalysisPDF = (analysis: AnalysisData) => {
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
      addText('ANALISI EMOTIVA PET VOICE', 16, true);
      addText(`Pet: ${selectedPet?.name || 'N/A'}`, 14, true);
      yPosition += 5;

      // Analysis info
      addText('INFORMAZIONI ANALISI', 14, true);
      addText(`File: ${analysis.file_name}`);
      addText(`Data: ${format(new Date(analysis.created_at), 'dd MMMM yyyy, HH:mm', { locale: it })}`);
      addText(`Durata: ${String(analysis.analysis_duration)}`);
      addText(`Dimensione: ${(analysis.file_size / 1024).toFixed(1)} KB`);
      yPosition += 5;

      // Emotional analysis
      addText('RISULTATI EMOTIVI', 14, true);
      addText(`Emozione Principale: ${analysis.primary_emotion.charAt(0).toUpperCase() + analysis.primary_emotion.slice(1)}`);
      addText(`Confidenza: ${analysis.primary_confidence}%`);
      
      if (Object.keys(analysis.secondary_emotions).length > 0) {
        addText('Emozioni Secondarie:', 12, true);
        Object.entries(analysis.secondary_emotions).forEach(([emotion, confidence]) => {
          addText(`- ${emotion}: ${confidence}%`);
        });
      }
      yPosition += 5;

      // Insights
      if (analysis.behavioral_insights) {
        addText('INSIGHTS COMPORTAMENTALI', 14, true);
        addText(analysis.behavioral_insights);
        yPosition += 5;
      }

      // Recommendations
      if (analysis.recommendations.length > 0) {
        addText('RACCOMANDAZIONI', 14, true);
        analysis.recommendations.forEach((rec, index) => {
          addText(`${index + 1}. ${rec}`);
        });
        yPosition += 5;
      }

      // Triggers
      if (analysis.triggers.length > 0) {
        addText('TRIGGER IDENTIFICATI', 14, true);
        analysis.triggers.forEach((trigger, index) => {
          addText(`- ${trigger}`);
        });
      }

      // Footer
      yPosition = 280;
      addText(`Report generato il ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}`, 8);
      addText('PetVoice - Analisi Emotiva Avanzata', 8);

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
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

    try {
      toast({
        title: "Export in corso...",
        description: `Generazione PDF per ${selectedAnalyses.length} analisi`,
      });

      // Get selected analyses data
      const selectedAnalysesData = analyses.filter(a => selectedAnalyses.includes(a.id));
      
      if (selectedAnalysesData.length === 1) {
        // Single analysis - use detailed PDF
        const pdf = generateAnalysisPDF(selectedAnalysesData[0]);
        const fileName = `analisi-emotiva-${selectedPet?.name}-${format(new Date(selectedAnalysesData[0].created_at), 'yyyy-MM-dd-HHmm')}.pdf`;
        pdf.save(fileName);
      } else {
        // Multiple analyses - create summary PDF
        const pdf = new jsPDF();
        pdf.setFont('helvetica', 'normal');
        
        let yPosition = 20;
        const lineHeight = 7;
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('REPORT ANALISI MULTIPLE - PET VOICE', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(14);
        pdf.text(`Pet: ${selectedPet?.name || 'N/A'}`, 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.text(`Numero analisi: ${selectedAnalysesData.length}`, 20, yPosition);
        yPosition += 10;
        
        selectedAnalysesData.forEach((analysis, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${analysis.file_name}`, 20, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Data: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm')}`, 25, yPosition);
          yPosition += lineHeight;
          pdf.text(`Emozione: ${analysis.primary_emotion} (${analysis.primary_confidence}%)`, 25, yPosition);
          yPosition += lineHeight;
          
          if (analysis.behavioral_insights) {
            const insight = analysis.behavioral_insights.length > 100 
              ? analysis.behavioral_insights.substring(0, 100) + '...'
              : analysis.behavioral_insights;
            pdf.text(`Insight: ${insight}`, 25, yPosition);
            yPosition += lineHeight;
          }
          yPosition += 5;
        });

        const fileName = `analisi-multiple-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
        pdf.save(fileName);
      }

      toast({
        title: "Export completato!",
        description: "Il file PDF è stato scaricato",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile generare il report PDF",
        variant: "destructive"
      });
    }
  };

  const handleBatchCompare = async () => {
    if (selectedAnalyses.length < 2) {
      toast({
        title: "Errore",
        description: "Seleziona almeno 2 analisi per il confronto",
        variant: "destructive"
      });
      return;
    }

    // Get selected analyses data and open compare modal
    const selectedAnalysesData = analyses.filter(a => selectedAnalyses.includes(a.id));
    setCompareModal({ open: true, analyses: selectedAnalysesData });
  };

  const generateComparisonPDF = (analysesToCompare: AnalysisData[]) => {
    try {
      const pdf = new jsPDF();
      pdf.setFont('helvetica', 'normal');
      
      let yPosition = 20;
      const lineHeight = 7;
      
      // Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONFRONTO ANALISI EMOTIVE - PET VOICE', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(14);
      pdf.text(`Pet: ${selectedPet?.name || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Periodo: ${format(new Date(Math.min(...analysesToCompare.map(a => new Date(a.created_at).getTime()))), 'dd/MM/yyyy')} - ${format(new Date(Math.max(...analysesToCompare.map(a => new Date(a.created_at).getTime()))), 'dd/MM/yyyy')}`, 20, yPosition);
      yPosition += 10;

      // Emotion distribution
      const emotionCounts: Record<string, number> = {};
      analysesToCompare.forEach(analysis => {
        emotionCounts[analysis.primary_emotion] = (emotionCounts[analysis.primary_emotion] || 0) + 1;
      });

      pdf.setFont('helvetica', 'bold');
      pdf.text('DISTRIBUZIONE EMOZIONI:', 20, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        const percentage = ((count / analysesToCompare.length) * 100).toFixed(1);
        pdf.text(`- ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${count} volte (${percentage}%)`, 25, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 5;

      // Average confidence
      const avgConfidence = (analysesToCompare.reduce((sum, a) => sum + a.primary_confidence, 0) / analysesToCompare.length).toFixed(1);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`CONFIDENZA MEDIA: ${avgConfidence}%`, 20, yPosition);
      yPosition += 10;

      // Timeline
      pdf.setFont('helvetica', 'bold');
      pdf.text('CRONOLOGIA ANALISI:', 20, yPosition);
      yPosition += lineHeight;
      
      analysesToCompare
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .forEach((analysis, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${index + 1}. ${format(new Date(analysis.created_at), 'dd/MM HH:mm')} - ${analysis.primary_emotion} (${analysis.primary_confidence}%)`, 25, yPosition);
          yPosition += lineHeight;
        });

      return pdf;
    } catch (error) {
      console.error('Error generating comparison PDF:', error);
      throw error;
    }
  };

  const handleBatchDelete = async () => {
    if (selectedAnalyses.length === 0) return;
    
    setDeleteConfirm({ 
      open: true, 
      analysisId: null, 
      isMultiple: true 
    });
  };

  const confirmBatchDelete = async () => {
    try {
      const { error } = await supabase
        .from('pet_analyses')
        .delete()
        .in('id', selectedAnalyses);

      if (error) throw error;

      toast({
        title: "Successo",
        description: `${selectedAnalyses.length} analisi eliminate`,
      });

      setSelectedAnalyses([]);
      loadAnalyses();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare le analisi",
        variant: "destructive"
      });
    }
  };

  const handleAnalysisDetails = (analysis: AnalysisData) => {
    setDetailsModal({ open: true, analysis });
  };

  const handleAnalysisDownload = async (analysis: AnalysisData) => {
    try {
      const pdf = generateAnalysisPDF(analysis);
      const fileName = `analisi-emotiva-${selectedPet?.name}-${format(new Date(analysis.created_at), 'yyyy-MM-dd-HHmm')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Download completato",
        description: `Report PDF scaricato: ${fileName}`,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile generare il report PDF",
        variant: "destructive"
      });
    }
  };

  const handleAnalysisSchedule = async (analysis: AnalysisData) => {
    try {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);

      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          pet_id: selectedPet!.id,
          title: `Follow-up analisi: ${analysis.primary_emotion}`,
          description: `Controllo comportamentale basato sull'analisi del ${format(new Date(analysis.created_at), 'dd/MM/yyyy')}`,
          start_time: followUpDate.toISOString(),
          category: 'health'
        });

      if (error) throw error;

      toast({
        title: "Follow-up programmato",
        description: `Promemoria creato per ${format(followUpDate, 'dd/MM/yyyy')}`,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile creare il promemoria",
        variant: "destructive"
      });
    }
  };

  const handleAnalysisDelete = async (analysisId: string) => {
    setDeleteConfirm({ 
      open: true, 
      analysisId, 
      isMultiple: false 
    });
  };

  const confirmSingleDelete = async () => {
    if (!deleteConfirm.analysisId) return;
    
    try {
      const { error } = await supabase
        .from('pet_analyses')
        .delete()
        .eq('id', deleteConfirm.analysisId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Analisi eliminata",
      });

      setSelectedAnalyses(prev => prev.filter(id => id !== deleteConfirm.analysisId));
      loadAnalyses();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'analisi",
        variant: "destructive"
      });
    }
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Analisi Emotiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Analizza le emozioni di {selectedPet.name} con l'intelligenza artificiale
          </p>
        </div>
        <div className="flex gap-2">
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
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete} 
              onStartRecording={handleStartRecording}
            />
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
                    <PopoverContent className="w-auto p-0 shadow-elegant" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        className="p-3 pointer-events-auto"
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
            onBatchExport={handleBatchExport}
            onBatchCompare={handleBatchCompare}
            onBatchDelete={handleBatchDelete}
            onAnalysisDetails={handleAnalysisDetails}
            onAnalysisDownload={handleAnalysisDownload}
            onAnalysisSchedule={handleAnalysisSchedule}
            onAnalysisDelete={handleAnalysisDelete}
            petName={selectedPet.name}
          />
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
              {/* File Info */}
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
                      <Label className="text-sm font-medium">Dimensione</Label>
                      <p className="text-sm">{(detailsModal.analysis.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Durata Analisi</Label>
                      <p className="text-sm">{String(detailsModal.analysis.analysis_duration)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data Creazione</Label>
                      <p className="text-sm">{format(new Date(detailsModal.analysis.created_at), 'dd MMMM yyyy, HH:mm', { locale: it })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emotional Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risultati Emotivi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Emozione Principale</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="flex items-center gap-2 text-lg px-4 py-2">
                        <span className="text-2xl">
                          {detailsModal.analysis.primary_emotion === 'felice' && '😊'}
                          {detailsModal.analysis.primary_emotion === 'calmo' && '😌'}
                          {detailsModal.analysis.primary_emotion === 'ansioso' && '😰'}
                          {detailsModal.analysis.primary_emotion === 'eccitato' && '🤩'}
                          {detailsModal.analysis.primary_emotion === 'triste' && '😢'}
                          {detailsModal.analysis.primary_emotion === 'aggressivo' && '😠'}
                          {detailsModal.analysis.primary_emotion === 'giocoso' && '😄'}
                        </span>
                        {detailsModal.analysis.primary_emotion.charAt(0).toUpperCase() + detailsModal.analysis.primary_emotion.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Progress value={detailsModal.analysis.primary_confidence} className="w-32 h-3" />
                        <span className="font-semibold text-lg">{detailsModal.analysis.primary_confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {Object.keys(detailsModal.analysis.secondary_emotions).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Emozioni Secondarie</Label>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {Object.entries(detailsModal.analysis.secondary_emotions).map(([emotion, confidence]) => (
                           <Badge key={emotion} variant="outline" className="text-sm">
                             {emotion}: {String(confidence)}%
                           </Badge>
                         ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Behavioral Insights */}
              {detailsModal.analysis.behavioral_insights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Insights Comportamentali
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-secondary/50 p-4 rounded-lg">
                      {detailsModal.analysis.behavioral_insights}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {detailsModal.analysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Raccomandazioni</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {detailsModal.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1">{index + 1}.</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Triggers */}
              {detailsModal.analysis.triggers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trigger Identificati</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {detailsModal.analysis.triggers.map((trigger, index) => (
                        <Badge key={index} variant="destructive">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
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

      {/* Compare Modal */}
      <Dialog open={compareModal.open} onOpenChange={(open) => setCompareModal({ open, analyses: [] })}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Confronto Analisi Emotive
            </DialogTitle>
            <DialogDescription>
              Analisi comparativa di {compareModal.analyses.length} risultati selezionati
            </DialogDescription>
          </DialogHeader>
          
          {compareModal.analyses.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{compareModal.analyses.length}</div>
                    <p className="text-xs text-muted-foreground">Analisi Confrontate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {format(new Date(Math.min(...compareModal.analyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')} - {format(new Date(Math.max(...compareModal.analyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')}
                    </div>
                    <p className="text-xs text-muted-foreground">Periodo Analizzato</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {(compareModal.analyses.reduce((sum, a) => sum + a.primary_confidence, 0) / compareModal.analyses.length).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Confidenza Media</p>
                  </CardContent>
                </Card>
              </div>

              {/* Emotion Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuzione Emozioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const emotionCounts: Record<string, number> = {};
                      compareModal.analyses.forEach(analysis => {
                        emotionCounts[analysis.primary_emotion] = (emotionCounts[analysis.primary_emotion] || 0) + 1;
                      });
                      
                      return Object.entries(emotionCounts)
                        .sort(([,a], [,b]) => b - a)
                        .map(([emotion, count]) => {
                          const percentage = ((count / compareModal.analyses.length) * 100).toFixed(1);
                          return (
                            <div key={emotion} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {emotion === 'felice' && '😊'}
                                  {emotion === 'calmo' && '😌'}
                                  {emotion === 'ansioso' && '😰'}
                                  {emotion === 'eccitato' && '🤩'}
                                  {emotion === 'triste' && '😢'}
                                  {emotion === 'aggressivo' && '😠'}
                                  {emotion === 'giocoso' && '😄'}
                                </span>
                                <span className="font-medium capitalize">{emotion}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={parseFloat(percentage)} className="w-24 h-2" />
                                <span className="text-sm font-medium w-16 text-right">{count} ({percentage}%)</span>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline Analisi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {compareModal.analyses
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((analysis, index) => (
                        <div key={analysis.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{index + 1}.</span>
                            <span className="text-sm font-medium">{analysis.file_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{format(new Date(analysis.created_at), 'dd/MM HH:mm')}</span>
                            <Badge variant="outline">{analysis.primary_emotion}</Badge>
                            <span className="font-medium">{analysis.primary_confidence}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    try {
                      const pdf = generateComparisonPDF(compareModal.analyses);
                      const fileName = `confronto-analisi-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
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
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Scarica PDF Confronto
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