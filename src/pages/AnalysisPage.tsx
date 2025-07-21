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
import VoiceAnalysis from '@/components/analysis/VoiceAnalysis';
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
    // Leggi il parametro tab dall'URL, default a 'upload'
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

  // Load analyses and all related data
  useEffect(() => {
    if (selectedPet) {
      loadAllData();
    }
  }, [selectedPet]);

  const loadAllData = async () => {
    if (!selectedPet) return;

    setLoading(true);
    try {
      // Load analyses
      const analysesPromise = supabase
        .from('pet_analyses')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      // Load diary entries
      const diaryPromise = supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('entry_date', { ascending: false });

      // Load health metrics
      const healthPromise = supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('recorded_at', { ascending: false });

      // Load wellness scores
      const wellnessPromise = supabase
        .from('pet_wellness_scores')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      // Load health alerts
      const alertsPromise = supabase
        .from('health_alerts')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false });

      // Load calendar events
      const eventsPromise = supabase
        .from('calendar_events')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .order('start_time', { ascending: false });

      // Load pet data
      const petPromise = supabase
        .from('pets')
        .select('*')
        .eq('id', selectedPet.id)
        .single();

      // Execute all queries in parallel
      const [
        { data: analysesData, error: analysesError },
        { data: diaryDataRes, error: diaryError },
        { data: healthDataRes, error: healthError },
        { data: wellnessDataRes, error: wellnessError },
        { data: alertsData, error: alertsError },
        { data: eventsData, error: eventsError },
        { data: petDataRes, error: petError }
      ] = await Promise.all([
        analysesPromise,
        diaryPromise,
        healthPromise,
        wellnessPromise,
        alertsPromise,
        eventsPromise,
        petPromise
      ]);

      if (analysesError) throw analysesError;
      if (diaryError) console.warn('Error loading diary data:', diaryError);
      if (healthError) console.warn('Error loading health data:', healthError);
      if (wellnessError) console.warn('Error loading wellness data:', wellnessError);
      if (alertsError) console.warn('Error loading alerts data:', alertsError);
      if (eventsError) console.warn('Error loading events data:', eventsError);
      if (petError) console.warn('Error loading pet data:', petError);

      setAnalyses(analysesData || []);
      setDiaryData(diaryDataRes || []);
      setHealthData(healthDataRes || []);
      setWellnessData(wellnessDataRes || []);
      setHealthAlerts(alertsData || []);
      setCalendarEvents(eventsData || []);
      setPetData(petDataRes || null);

    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile caricare tutti i dati",
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
      loadAllData();
      
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

    // Insights specifici per emozione
    const emotionSpecificInsights: Record<string, string[]> = {
      ansioso: [
        "Il pet manifesta segni di ansia generalizzata con tremori e irrequietezza",
        "Comportamento di evitamento e ricerca costante di rifugi sicuri",
        "Respirazione accelerata e ipervigilanza verso stimoli esterni",
        "Difficoltà a rilassarsi, con tendenza al pacing e vocalizzazioni eccessive"
      ],
      triste: [
        "Ridotta attività generale e diminuzione dell'interesse per il gioco",
        "Postura corporea abbassata con orecchie all'indietro e coda bassa",
        "Minore interazione sociale e tendenza all'isolamento",
        "Appetito ridotto e sonno irregolare con segni di malinconia"
      ],
      aggressivo: [
        "Tensione muscolare elevata con postura rigida e minacciosa",
        "Vocalizzazioni aggressive accompagnate da ringhio e abbaiare intenso",
        "Territorialità esacerbata e reattività a stimoli specifici",
        "Comportamento di sfida con fissazione prolungata e movimento rigido"
      ],
      felice: [
        "Elevata reattività positiva con movimenti fluidi e giocosi",
        "Interazione sociale aumentata e ricerca attiva di contatto",
        "Postura corporea rilassata con coda alzata e orecchie erette",
        "Energia bilanciata con interesse spontaneo per l'ambiente circostante"
      ],
      eccitato: [
        "Iperattivazione con movimento frenetico e difficoltà di concentrazione",
        "Ricerca compulsiva di stimoli e attività ad alta intensità",
        "Respirazione rapida alternata a vocalizzazioni acute e frequenti",
        "Difficoltà nel controllo degli impulsi con comportamenti ripetitivi"
      ],
      calmo: [
        "Stato di rilassamento profondo con respirazione regolare e lenta",
        "Postura distesa e confortevole con muscoli completamente decontratti",
        "Attenzione diffusa ma non ipervigilante verso l'ambiente",
        "Equilibrio emotivo stabile con risposte appropriate agli stimoli"
      ],
      giocoso: [
        "Attivazione comportamentale mirata al gioco con sequenze ripetitive",
        "Interazione sociale dinamica con invitation al gioco verso altri",
        "Energia focalizzata su attività ludiche con variazioni di intensità",
        "Comportamento esplorativo con curiosità verso oggetti e spazi nuovi"
      ]
    };

    // Raccomandazioni specifiche per emozione
    const emotionSpecificRecommendations: Record<string, string[]> = {
      ansioso: [
        "Implementare tecniche di desensibilizzazione graduale ai trigger",
        "Creare una zona sicura con comfort objects familiari",
        "Introdurre esercizi di respirazione guidata e rilassamento muscolare",
        "Valutare l'uso di feromoni calmanti o integratori naturali",
        "Mantenere routine prevedibili per ridurre l'incertezza"
      ],
      triste: [
        "Aumentare gradualmente le attività fisiche stimolanti",
        "Implementare sessioni di gioco interattivo quotidiane",
        "Incrementare il contatto sociale positivo e le coccole",
        "Valutare cambiamenti nella dieta per migliorare l'energia",
        "Monitorare per possibili cause mediche sottostanti"
      ],
      aggressivo: [
        "Implementare protocolli di gestione della reattività immediati",
        "Lavorare sulla leadership positiva e controllo degli impulsi",
        "Evitare trigger identificati fino al completamento del training",
        "Consultare un esperto comportamentale qualificato",
        "Valutare l'ambiente per rimuovere fattori scatenanti"
      ],
      felice: [
        "Mantenere il livello attuale di stimolazione positiva",
        "Continuare le attività che promuovono questo stato emotivo",
        "Utilizzare questo stato per introdurre nuovi apprendimenti",
        "Documentare le condizioni che favoriscono il benessere"
      ],
      eccitato: [
        "Introdurre esercizi di autocontrollo e 'settle' training",
        "Ridurre temporaneamente stimoli ad alta intensità",
        "Implementare pause forzate durante le attività",
        "Lavorare sui comandi di base per migliorare la concentrazione",
        "Bilanciare attività fisiche con momenti di calma"
      ],
      calmo: [
        "Mantenere l'ambiente attuale che favorisce la tranquillità",
        "Utilizzare questo stato per sessioni di training avanzato",
        "Introdurre gradualmente nuove esperienze positive",
        "Documentare le routine che promuovono il rilassamento"
      ],
      giocoso: [
        "Canalizzare l'energia ludica in attività strutturate",
        "Introdurre giochi che stimolano la mente oltre al corpo",
        "Bilanciare il gioco libero con quello guidato",
        "Utilizzare il gioco come strumento di apprendimento"
      ]
    };

    // Trigger specifici per emozione
    const emotionSpecificTriggers: Record<string, string[]> = {
      ansioso: [
        "Rumori improvvisi ad alta intensità (tuoni, fuochi d'artificio)",
        "Separazione dal proprietario o figure di attaccamento",
        "Presenza di estranei o animali sconosciuti nell'ambiente",
        "Cambiamenti nella routine quotidiana o nell'ambiente domestico",
        "Situazioni di confinamento o restrizione del movimento"
      ],
      triste: [
        "Perdita o assenza prolungata di compagni (umani o animali)",
        "Riduzione delle attività sociali e ricreative abituali",
        "Cambiamenti stagionali o climatici significativi",
        "Diminuzione dell'attenzione e dell'interazione sociale",
        "Modifiche nell'ambiente domestico o nella routine"
      ],
      aggressivo: [
        "Invasione del territorio o delle risorse (cibo, giocattoli)",
        "Contatto fisico non desiderato o forzato",
        "Competizione con altri animali per risorse limitate",
        "Dolore fisico o disagio medico non diagnosticato",
        "Stimoli scatenanti specifici appresi (uniformi, oggetti)"
      ],
      felice: [
        "Presenza del proprietario o di persone care",
        "Attività ricreative preferite (passeggiate, giochi)",
        "Ricevimento di attenzioni positive e rinforzi",
        "Ambienti familiari e sicuri con routine stabili"
      ],
      eccitato: [
        "Anticipazione di eventi piacevoli (pasti, uscite)",
        "Stimolazione sensoriale intensa (suoni, movimenti)",
        "Interazione con giocattoli ad alta stimolazione",
        "Presenza di altri animali o persone energiche",
        "Attività fisiche intense o prolungate"
      ],
      calmo: [
        "Ambienti tranquilli con illuminazione soffusa",
        "Routine rilassanti consolidate (massaggi, coccole)",
        "Assenza di stimoli stressanti o disturbanti",
        "Presenza di comfort objects familiari"
      ],
      giocoso: [
        "Presenza di giocattoli interattivi o stimolanti",
        "Interazione con altri animali giovani o giocosi",
        "Ambienti spazi aperti che incoraggiano l'esplorazione",
        "Orari specifici della giornata associati al gioco"
      ]
    };

    const insights = emotionSpecificInsights[primaryEmotion] || emotionSpecificInsights['calmo'];
    const recommendations = emotionSpecificRecommendations[primaryEmotion] || emotionSpecificRecommendations['calmo'];
    const triggers = emotionSpecificTriggers[primaryEmotion] || emotionSpecificTriggers['calmo'];

    return {
      primary_emotion: primaryEmotion,
      primary_confidence: confidence,
      secondary_emotions: secondaryEmotions,
      behavioral_insights: insights[Math.floor(Math.random() * insights.length)],
      recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2),
      triggers: triggers.slice(0, Math.floor(Math.random() * 3) + 1),
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
      loadAllData();
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
      loadAllData();
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
    <div className="container mx-auto p-6 max-w-7xl space-y-6 pb-32">
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
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Scegli il Tipo di Analisi Emotiva
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Scopri le emozioni di {selectedPet.name} attraverso diversi metodi di analisi. 
              Ogni opzione offre insights unici per comprendere meglio il benessere del tuo pet.
            </p>
          </div>

          {/* Analysis Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Upload File Audio/Video</h3>
              </div>
              <FileUploader 
                onFilesSelected={handleFileUpload} 
                autoAnalyzeAudio={true}
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">📁 Formati Supportati</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• <strong>Audio:</strong> MP3, WAV, M4A, WEBM</p>
                  <p>• <strong>Video:</strong> MP4, MOV, AVI, WEBM</p>
                  <p>• <strong>Dimensione max:</strong> 50MB per file</p>
                </div>
              </div>
            </div>
            
            {/* Audio Recorder */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Registrazione Diretta</h3>
              </div>
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete} 
                onStartRecording={handleStartRecording}
                autoAnalyze={true}
              />
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">🎤 Suggerimenti per la Registrazione</h4>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p>• Registra in un ambiente silenzioso</p>
                  <p>• Posizionati vicino al tuo pet</p>
                  <p>• Durata consigliata: 10-60 secondi</p>
                </div>
              </div>
            </div>
            
            {/* Text Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Analisi Comportamentale Testuale</h3>
              </div>
              <TextAnalysis onAnalysisComplete={() => loadAllData()} />
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">✍️ Cosa Descrivere</h4>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <p>• Comportamento specifico osservato</p>
                  <p>• Contesto e situazione</p>
                  <p>• Cambiamenti rispetto al solito</p>
                  <p>• Postura e segnali del corpo</p>
                </div>
              </div>
            </div>
            
            {/* Voice Analysis */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-5 w-5 text-red-500" />
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Analisi Emotiva Combinata</h3>
              </div>
              <VoiceAnalysis onAnalysisComplete={() => loadAllData()} />
              <div className="bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">🔄 Doppia Analisi AI</h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p>• <strong>Pet:</strong> Emozione rilevata dalle tue descrizioni</p>
                  <p>• <strong>Tu:</strong> Emozione rilevata dal tuo tono di voce</p>
                  <p>• <strong>Risultato:</strong> Consigli personalizzati per entrambi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-xl border border-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              {/* Cosa Descrivere */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">Cosa Descrivere</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-amber-600 font-bold mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">Comportamento specifico osservato</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-amber-600 font-bold mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">Contesto e situazione</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-amber-600 font-bold mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">Cambiamenti rispetto al solito</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-amber-600 font-bold mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">Postura e segnali del corpo</span>
                  </div>
                </div>
              </div>

              {/* Come Scegliere il Metodo Giusto */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Come Scegliere il Metodo Giusto?</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                    <Upload className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                    <p className="font-bold text-lg mb-2">Upload File</p>
                    <p className="text-sm text-muted-foreground">Hai già registrazioni o video del tuo pet</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                    <Mic className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <p className="font-bold text-lg mb-2">Registra Ora</p>
                    <p className="text-sm text-muted-foreground">Vuoi catturare l'emozione in tempo reale</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                    <FileText className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                    <p className="font-bold text-lg mb-2">Descrivi Testo</p>
                    <p className="text-sm text-muted-foreground">Preferisci descrivere il comportamento</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border shadow-sm">
                    <div className="flex justify-center gap-2 mb-3">
                      <Heart className="h-4 w-4 text-red-500" />
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-bold text-lg mb-2">Analisi Doppia</p>
                    <p className="text-sm text-muted-foreground">Vuoi analizzare anche le tue emozioni</p>
                  </div>
                </div>
              </div>

              {/* Doppia Analisi AI */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-100 to-blue-100 dark:from-red-900/30 dark:to-blue-900/30 rounded-xl">
                    <div className="flex gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Doppia Analisi AI</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Heart className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-300">Pet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Emozione rilevata dalle tue descrizioni</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Brain className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">Tu</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Emozione rilevata dal tuo tono di voce</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300">Risultato</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Consigli personalizzati per entrambi</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Stats Preview */}
          {analyses.length > 0 && (
            <div className="bg-muted/30 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Le Tue Analisi Recenti
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('results')}
                  className="text-primary hover:text-primary/80"
                >
                  Vedi Tutti i Risultati
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-primary">{analyses.length}</p>
                  <p className="text-sm text-muted-foreground">Analisi Totali</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((analyses.reduce((sum, a) => sum + a.primary_confidence, 0) / analyses.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Confidenza Media</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border">
                  <p className="text-2xl font-bold text-blue-600">
                    {analyses[0]?.primary_emotion || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Ultima Emozione</p>
                </div>
              </div>
            </div>
          )}
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

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wellness Trend Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Benessere Futuro
                </CardTitle>
                <CardDescription>
                  Previsione del benessere basata sui dati storici
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    if (analyses.length === 0 && diaryData.length === 0 && healthData.length === 0 && wellnessData.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Carica dati per visualizzare le previsioni avanzate</p>
                        </div>
                      );
                    }

                    // ANALISI COMPLETA MULTIDIMENSIONALE usando TUTTI i dati disponibili
                    const sortedAnalyses = [...analyses].sort((a, b) => 
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );

                    // DATI DIARIO - analisi mood e comportamento
                    const sortedDiary = [...diaryData].sort((a, b) => 
                      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
                    );
                    
                    // DATI SALUTE - metriche vitali
                    const sortedHealth = [...healthData].sort((a, b) => 
                      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
                    );
                    
                    // DATI BENESSERE - punteggi wellness
                    const sortedWellness = [...wellnessData].sort((a, b) => 
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );

                    // CALCOLO TREND MULTIDIMENSIONALE
                    let overallTrend = 0;
                    let trendComponents = [];
                    let confidenceScore = 0;
                    let totalDataPoints = 0;

                    // 1. TREND DA ANALISI EMOTIVE
                    if (sortedAnalyses.length >= 3) {
                      const thirdSize = Math.floor(sortedAnalyses.length / 3);
                      const oldAnalyses = sortedAnalyses.slice(0, thirdSize);
                      const recentAnalyses = sortedAnalyses.slice(thirdSize * 2);

                      const oldAvg = oldAnalyses.reduce((sum, a) => sum + a.primary_confidence, 0) / oldAnalyses.length;
                      const recentAvg = recentAnalyses.reduce((sum, a) => sum + a.primary_confidence, 0) / recentAnalyses.length;
                      
                      const emotionTrend = recentAvg - oldAvg;
                      overallTrend += emotionTrend * 0.4; // 40% del peso
                      trendComponents.push({ source: 'Analisi Emotive', trend: emotionTrend, weight: 0.4 });
                      totalDataPoints += sortedAnalyses.length;
                    }

                    // 2. TREND DA MOOD SCORE DEL DIARIO
                    if (sortedDiary.length >= 3) {
                      const moodEntries = sortedDiary.filter(entry => entry.mood_score !== null);
                      if (moodEntries.length >= 3) {
                        const thirdSize = Math.floor(moodEntries.length / 3);
                        const oldMoods = moodEntries.slice(0, thirdSize);
                        const recentMoods = moodEntries.slice(thirdSize * 2);

                        const oldMoodAvg = oldMoods.reduce((sum, entry) => sum + entry.mood_score, 0) / oldMoods.length;
                        const recentMoodAvg = recentMoods.reduce((sum, entry) => sum + entry.mood_score, 0) / recentMoods.length;
                        
                        const moodTrend = ((recentMoodAvg - oldMoodAvg) / 10) * 100; // Normalizza a percentuale
                        overallTrend += moodTrend * 0.3; // 30% del peso
                        trendComponents.push({ source: 'Mood Diario', trend: moodTrend, weight: 0.3 });
                        totalDataPoints += moodEntries.length;
                      }
                    }

                    // 3. TREND DA METRICHE DI SALUTE
                    if (sortedHealth.length >= 3) {
                      const healthTrends = {};
                      const healthMetrics = ['peso', 'temperatura', 'battito_cardiaco', 'respirazione'];
                      
                      let healthTrendSum = 0;
                      let healthTrendCount = 0;

                      healthMetrics.forEach(metric => {
                        const metricData = sortedHealth.filter(h => h.metric_type === metric && h.value !== null);
                        if (metricData.length >= 3) {
                          const thirdSize = Math.floor(metricData.length / 3);
                          const oldValues = metricData.slice(0, thirdSize);
                          const recentValues = metricData.slice(thirdSize * 2);

                          const oldAvg = oldValues.reduce((sum, v) => sum + parseFloat(v.value), 0) / oldValues.length;
                          const recentAvg = recentValues.reduce((sum, v) => sum + parseFloat(v.value), 0) / recentValues.length;
                          
                          // Calcola trend normalizzato per tipo di metrica
                          let normalizedTrend = 0;
                          if (metric === 'peso') {
                            // Per il peso, stabilità è positiva
                            const weightChange = Math.abs(recentAvg - oldAvg);
                            normalizedTrend = Math.max(-10, Math.min(10, (3 - weightChange) * 3)); // Meno variazione = meglio
                          } else if (metric === 'temperatura') {
                            // Per la temperatura, vicinanza alla norma (38-39°C per cani) è positiva  
                            const optimalTemp = 38.5;
                            const oldDistance = Math.abs(oldAvg - optimalTemp);
                            const recentDistance = Math.abs(recentAvg - optimalTemp);
                            normalizedTrend = (oldDistance - recentDistance) * 20; // Avvicinamento alla norma = positivo
                          }
                          
                          healthTrendSum += normalizedTrend;
                          healthTrendCount++;
                        }
                      });

                      if (healthTrendCount > 0) {
                        const avgHealthTrend = healthTrendSum / healthTrendCount;
                        overallTrend += avgHealthTrend * 0.2; // 20% del peso
                        trendComponents.push({ source: 'Metriche Salute', trend: avgHealthTrend, weight: 0.2 });
                        totalDataPoints += sortedHealth.length;
                      }
                    }

                    // 4. TREND DA WELLNESS SCORES
                    if (sortedWellness.length >= 3) {
                      const thirdSize = Math.floor(sortedWellness.length / 3);
                      const oldWellness = sortedWellness.slice(0, thirdSize);
                      const recentWellness = sortedWellness.slice(thirdSize * 2);

                      const oldWellnessAvg = oldWellness.reduce((sum, w) => sum + w.wellness_score, 0) / oldWellness.length;
                      const recentWellnessAvg = recentWellness.reduce((sum, w) => sum + w.wellness_score, 0) / recentWellness.length;
                      
                      const wellnessTrend = recentWellnessAvg - oldWellnessAvg;
                      overallTrend += wellnessTrend * 0.1; // 10% del peso
                      trendComponents.push({ source: 'Punteggi Wellness', trend: wellnessTrend, weight: 0.1 });
                      totalDataPoints += sortedWellness.length;
                    }

                    // FATTORI DI RISCHIO DA HEALTH ALERTS
                    let riskFactor = 0;
                    const activeAlerts = healthAlerts.filter(alert => !alert.is_resolved);
                    if (activeAlerts.length > 0) {
                      riskFactor = activeAlerts.length * -5; // Ogni alert riduce di 5 punti
                      overallTrend += riskFactor;
                    }

                    // FATTORI POSITIVI DA EVENTI CALENDARIO
                    let activityBonus = 0;
                    const recentEvents = calendarEvents.filter(event => {
                      const eventDate = new Date(event.start_time);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return eventDate >= weekAgo && ['vet', 'grooming', 'exercise', 'training'].includes(event.category);
                    });
                    if (recentEvents.length > 0) {
                      activityBonus = Math.min(recentEvents.length * 2, 10); // Max 10 punti bonus
                      overallTrend += activityBonus;
                    }

                    // FATTORI PET-SPECIFICI
                    let ageFactor = 0;
                    if (petData && petData.age) {
                      // I pet più anziani potrebbero avere trend più lenti
                      if (petData.age > 7) {
                        ageFactor = -2; // Piccolo malus per età avanzata
                      } else if (petData.age < 2) {
                        ageFactor = 2; // Piccolo bonus per pet giovani
                      }
                      overallTrend += ageFactor;
                    }

                    // CALCOLO CONFIDENZA BASATA SU QUANTITÀ E VARIETÀ DATI
                    const dataVariety = [
                      analyses.length > 0,
                      diaryData.length > 0, 
                      healthData.length > 0,
                      wellnessData.length > 0,
                      healthAlerts.length > 0,
                      calendarEvents.length > 0
                    ].filter(Boolean).length;
                    
                    confidenceScore = Math.min(95, Math.max(20, 
                      (totalDataPoints * 2) + (dataVariety * 10) - (activeAlerts.length * 5)
                    ));

                    // DETERMINAZIONE ETICHETTE E COLORI
                    let trendLabel = 'Dati Insufficienti';
                    let trendColor = 'text-gray-500';
                    let trendIcon = <div className="h-5 w-5 bg-gray-400 rounded-full" />;
                    let trendDescription = 'Aggiungi più dati per previsioni accurate.';

                    if (totalDataPoints >= 5) {
                      if (overallTrend > 15) {
                        trendLabel = 'Miglioramento Significativo';
                        trendColor = 'text-green-600';
                        trendIcon = <TrendingUp className="h-5 w-5 text-green-600" />;
                        trendDescription = `Eccellente! Il benessere sta migliorando costantemente. Confidenza: ${Math.round(confidenceScore)}%`;
                      } else if (overallTrend > 5) {
                        trendLabel = 'Leggero Miglioramento';
                        trendColor = 'text-green-500';
                        trendIcon = <TrendingUp className="h-5 w-5 text-green-500" />;
                        trendDescription = `Il benessere mostra segni positivi. Continua così! Confidenza: ${Math.round(confidenceScore)}%`;
                      } else if (overallTrend < -15) {
                        trendLabel = 'Declino Significativo';
                        trendColor = 'text-red-600';
                        trendIcon = <TrendingDown className="h-5 w-5 text-red-600" />;
                        trendDescription = `Attenzione: trend negativo rilevato. Consulta urgentemente un veterinario. Confidenza: ${Math.round(confidenceScore)}%`;
                      } else if (overallTrend < -5) {
                        trendLabel = 'Leggero Peggioramento';
                        trendColor = 'text-orange-500';
                        trendIcon = <TrendingDown className="h-5 w-5 text-orange-500" />;
                        trendDescription = `Trend in calo. Monitora attentamente e considera controlli veterinari. Confidenza: ${Math.round(confidenceScore)}%`;
                      } else {
                        trendLabel = 'Stabile';
                        trendColor = 'text-blue-600';
                        trendIcon = <div className="h-5 w-5 bg-blue-500 rounded-full" />;
                        trendDescription = `Benessere stabile. Mantieni routine attuale. Confidenza: ${Math.round(confidenceScore)}%`;
                      }
                    }

                    // CALCOLO PREVISIONE
                    const currentValue = analyses.length > 0 ? sortedAnalyses[sortedAnalyses.length - 1].primary_confidence : 75;
                    const predictedValue = Math.max(0, Math.min(100, currentValue + (overallTrend * 0.8)));

                    return (
                      <>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {trendIcon}
                            <span className={`font-medium ${trendColor}`}>{trendLabel}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({totalDataPoints} punti dati, {dataVariety}/6 fonti)
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{trendDescription}</p>
                          
                          {/* Breakdown dei fattori contributivi */}
                          {trendComponents.length > 0 && (
                            <div className="mt-3 p-2 bg-muted/30 rounded text-xs">
                              <div className="font-medium mb-1">Fattori Contribuenti:</div>
                              {trendComponents.map((comp, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{comp.source}:</span>
                                  <span className={comp.trend > 0 ? 'text-green-600' : comp.trend < 0 ? 'text-red-600' : 'text-gray-600'}>
                                    {comp.trend > 0 ? '+' : ''}{comp.trend.toFixed(1)} 
                                  </span>
                                </div>
                              ))}
                              {riskFactor !== 0 && (
                                <div className="flex justify-between text-red-600">
                                  <span>Alert Attivi:</span>
                                  <span>{riskFactor.toFixed(1)}</span>
                                </div>
                              )}
                              {activityBonus > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Attività Recenti:</span>
                                  <span>+{activityBonus.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {totalDataPoints > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Benessere Attuale</span>
                              <span>{Math.round(currentValue)}%</span>
                            </div>
                            <Progress value={currentValue} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>Previsione 30gg</span>
                              <span className={trendColor}>
                                {Math.round(predictedValue)}%
                              </span>
                            </div>
                            
                            {/* Grafico multidimensionale */}
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                              <h4 className="text-sm font-medium mb-2">Analisi Multidimensionale</h4>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <div className="font-medium">Fonti Dati Attive:</div>
                                  {analyses.length > 0 && <div>• Analisi Emotive ({analyses.length})</div>}
                                  {diaryData.length > 0 && <div>• Diario ({diaryData.length})</div>}
                                  {healthData.length > 0 && <div>• Metriche Salute ({healthData.length})</div>}
                                  {wellnessData.length > 0 && <div>• Wellness ({wellnessData.length})</div>}
                                  {healthAlerts.length > 0 && <div>• Health Alerts ({healthAlerts.length})</div>}
                                  {calendarEvents.length > 0 && <div>• Eventi ({calendarEvents.length})</div>}
                                </div>
                                <div>
                                  <div className="font-medium">Fattori Aggiuntivi:</div>
                                  {petData?.age && <div>• Età: {petData.age} anni</div>}
                                  {petData?.breed && <div>• Razza: {petData.breed}</div>}
                                  {activeAlerts.length > 0 && <div className="text-red-600">• Alert attivi: {activeAlerts.length}</div>}
                                  {recentEvents.length > 0 && <div className="text-green-600">• Attività recenti: {recentEvents.length}</div>}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Health Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Raccomandazioni AI
                </CardTitle>
                <CardDescription>
                  Suggerimenti basati sui pattern rilevati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const recommendations = [];
                    
                    if (analyses.length === 0) {
                      recommendations.push({
                        type: 'info',
                        text: 'Carica alcune analisi per ricevere raccomandazioni personalizzate.',
                        priority: 1
                      });
                    } else {
                      // Analisi delle emozioni dominanti
                      const emotionCounts = analyses.reduce((acc: Record<string, number>, a) => {
                        acc[a.primary_emotion] = (acc[a.primary_emotion] || 0) + 1;
                        return acc;
                      }, {});

                      const totalAnalyses = analyses.length;
                      const sortedEmotions = Object.entries(emotionCounts)
                        .sort(([,a], [,b]) => b - a);

                      // Check per emozioni negative dominanti
                      const negativeEmotions = ['stress', 'ansioso', 'agitato', 'nervoso', 'paura', 'triste', 'depresso'];
                      const negativeCount = analyses.filter(a => 
                        negativeEmotions.some(emotion => a.primary_emotion.toLowerCase().includes(emotion.toLowerCase()))
                      ).length;

                      if (negativeCount > totalAnalyses * 0.4) {
                        recommendations.push({
                          type: 'warning',
                          text: `Rilevate emozioni negative nel ${Math.round((negativeCount / totalAnalyses) * 100)}% delle analisi. Considera di ridurre i fattori di stress ambientali e consulta un veterinario.`,
                          priority: 3
                        });
                      }

                      // Check per confidenza bassa persistente
                      const avgConfidence = analyses.reduce((sum, a) => sum + a.primary_confidence, 0) / analyses.length;
                      if (avgConfidence < 60) {
                        recommendations.push({
                          type: 'warning',
                          text: `Confidenza media bassa (${Math.round(avgConfidence)}%). Verifica la qualità delle registrazioni e l'ambiente di ripresa.`,
                          priority: 2
                        });
                      } else if (avgConfidence < 75) {
                        recommendations.push({
                          type: 'info',
                          text: `La qualità delle registrazioni può essere migliorata per analisi più precise (confidenza attuale: ${Math.round(avgConfidence)}%).`,
                          priority: 1
                        });
                      }

                      // Check per emozioni positive
                      const positiveEmotions = ['felice', 'giocoso', 'contento', 'rilassato', 'calmo', 'sereno'];
                      const positiveCount = analyses.filter(a => 
                        positiveEmotions.some(emotion => a.primary_emotion.toLowerCase().includes(emotion.toLowerCase()))
                      ).length;

                      if (positiveCount > totalAnalyses * 0.7) {
                        recommendations.push({
                          type: 'success',
                          text: `Ottimi livelli di benessere! ${Math.round((positiveCount / totalAnalyses) * 100)}% di emozioni positive. Continua con le attuali strategie.`,
                          priority: 1
                        });
                      }

                      // Analisi temporale
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      const recentAnalyses = analyses.filter(a => new Date(a.created_at) >= oneWeekAgo);

                      if (recentAnalyses.length < 2 && analyses.length > 10) {
                        recommendations.push({
                          type: 'info',
                          text: 'Non ci sono analisi recenti. Aumenta la frequenza di monitoraggio per previsioni più accurate.',
                          priority: 2
                        });
                      }

                      // Check per variazioni drastiche
                      if (analyses.length >= 3) {
                        const sortedAnalyses = [...analyses].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                        const recent = sortedAnalyses.slice(-2);
                        const confidenceVariation = Math.abs(recent[1].primary_confidence - recent[0].primary_confidence);
                        
                        if (confidenceVariation > 30) {
                          recommendations.push({
                            type: 'warning',
                            text: 'Rilevate variazioni significative nel benessere. Monitora attentamente e considera fattori ambientali recenti.',
                            priority: 3
                          });
                        }
                      }

                      // Check per diversità emotiva
                      const uniqueEmotions = Object.keys(emotionCounts).length;
                      if (uniqueEmotions === 1 && analyses.length > 5) {
                        recommendations.push({
                          type: 'info',
                          text: 'Emozione molto costante rilevata. Potrebbe indicare una routine stabile o necessità di maggior stimolazione.',
                          priority: 1
                        });
                      }

                      if (recommendations.length === 0) {
                        recommendations.push({
                          type: 'success',
                          text: 'Parametri nella norma. Continua il monitoraggio regolare per mantenere il benessere ottimale.',
                          priority: 1
                        });
                      }
                    }
                    
                    // Ordina per priorità e mostra solo le prime 4
                    return recommendations
                      .sort((a, b) => b.priority - a.priority)
                      .slice(0, 4)
                      .map((rec, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                          rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                          rec.type === 'success' ? 'bg-green-50 border-green-400' :
                          'bg-blue-50 border-blue-400'
                        }`}>
                          <p className="text-sm">{rec.text}</p>
                        </div>
                      ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Predictions - Basate sui dati reali */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Pattern Temporali e Previsioni
              </CardTitle>
              <CardDescription>
                Analisi dei pattern comportamentali basata sui tuoi dati
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                if (analyses.length < 3) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Servono almeno 3 analisi per identificare pattern temporali</p>
                    </div>
                  );
                }

                // Analisi per ora del giorno
                const timeAnalysis = analyses.reduce((acc: Record<string, { count: number, avgConfidence: number, emotions: string[] }>, analysis) => {
                  const date = new Date(analysis.created_at);
                  const hour = date.getHours();
                  
                  let period;
                  if (hour >= 6 && hour < 12) period = 'Mattina';
                  else if (hour >= 12 && hour < 18) period = 'Pomeriggio';
                  else if (hour >= 18 && hour < 22) period = 'Sera';
                  else period = 'Notte';

                  if (!acc[period]) {
                    acc[period] = { count: 0, avgConfidence: 0, emotions: [] };
                  }
                  
                  acc[period].count++;
                  acc[period].avgConfidence = (acc[period].avgConfidence * (acc[period].count - 1) + analysis.primary_confidence) / acc[period].count;
                  acc[period].emotions.push(analysis.primary_emotion);
                  
                  return acc;
                }, {});

                // Analisi per giorno della settimana
                const dayAnalysis = analyses.reduce((acc: Record<string, { count: number, avgConfidence: number }>, analysis) => {
                  const date = new Date(analysis.created_at);
                  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
                  const dayName = dayNames[date.getDay()];
                  
                  if (!acc[dayName]) {
                    acc[dayName] = { count: 0, avgConfidence: 0 };
                  }
                  
                  acc[dayName].count++;
                  acc[dayName].avgConfidence = (acc[dayName].avgConfidence * (acc[dayName].count - 1) + analysis.primary_confidence) / acc[dayName].count;
                  
                  return acc;
                }, {});

                return (
                  <div className="space-y-6">
                    {/* Pattern per ora del giorno */}
                    <div>
                      <h4 className="font-medium mb-3">Pattern per Momento del Giorno</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(timeAnalysis).map(([period, data]) => {
                          const mostCommonEmotion = data.emotions.reduce((acc: Record<string, number>, emotion) => {
                            acc[emotion] = (acc[emotion] || 0) + 1;
                            return acc;
                          }, {});
                          
                          const dominantEmotion = Object.entries(mostCommonEmotion)
                            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

                          return (
                            <div key={period} className="p-4 border rounded-lg">
                              <h5 className="font-medium mb-2">{period}</h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Analisi:</span>
                                  <span className="font-medium">{data.count}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Benessere:</span>
                                  <span className={`font-medium ${
                                    data.avgConfidence > 80 ? 'text-green-600' :
                                    data.avgConfidence > 60 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {Math.round(data.avgConfidence)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Emozione:</span>
                                  <span className="font-medium text-xs">{dominantEmotion}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pattern per giorno della settimana - solo se ci sono dati sufficienti */}
                    {Object.keys(dayAnalysis).length >= 3 && (
                      <div>
                        <h4 className="font-medium mb-3">Pattern Settimanali</h4>
                        <div className="grid grid-cols-7 gap-2">
                          {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map(day => {
                            const data = dayAnalysis[day];
                            if (!data) return (
                              <div key={day} className="p-2 text-center border rounded opacity-50">
                                <div className="text-xs font-medium">{day.slice(0, 3)}</div>
                                <div className="text-xs text-muted-foreground">N/D</div>
                              </div>
                            );

                            return (
                              <div key={day} className="p-2 text-center border rounded">
                                <div className="text-xs font-medium">{day.slice(0, 3)}</div>
                                <div className={`text-xs font-bold ${
                                  data.avgConfidence > 80 ? 'text-green-600' :
                                  data.avgConfidence > 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {Math.round(data.avgConfidence)}%
                                </div>
                                <div className="text-xs text-muted-foreground">({data.count})</div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          I numeri tra parentesi indicano il numero di analisi per quel giorno
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
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