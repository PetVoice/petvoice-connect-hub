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
  Lightbulb,
  Microscope
} from 'lucide-react';

import { format, subDays, subMonths, subYears, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { it, enUS, es } from 'date-fns/locale';
import { usePets } from '@/contexts/PetContext';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { useNotificationEventsContext } from '@/contexts/NotificationEventsContext';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import { WeatherMoodPredictor } from '@/components/ai-features/WeatherMoodPredictor';
import { NaturalLanguageProcessing } from '@/components/ai-features/NaturalLanguageProcessing';
import { useAuth } from '@/contexts/AuthContext';
// Translation system removed - Italian only

// Components
import FileUploader from '@/components/analysis/FileUploader';
import AudioRecorder from '@/components/analysis/AudioRecorder';
import TextAnalyzer from '@/components/analysis/TextAnalyzer';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';
import ProcessingAnimation from '@/components/analysis/ProcessingAnimation';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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
  user_description?: string;
}

// Helper function to generate readable analysis names
const getReadableAnalysisName = (analysis: AnalysisData, language: string = 'it') => {
  const date = new Date(analysis.created_at);
  
   // Format date parts based on language
   const day = format(date, 'dd');
   const locale = language === 'it' ? it : language === 'es' ? es : enUS;
   const month = format(date, 'MMMM', { locale });
   const time = format(date, 'HH:mm');
  
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


interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  currentFile?: string;
}

const AnalysisPage: React.FC = () => {
  // Helper functions for emotion mapping (available throughout the component)
  const isAnxiousEmotion = (emotion: string) => ['ansioso', 'anxious', 'ansioso'].includes(emotion.toLowerCase());
  const isSadEmotion = (emotion: string) => ['triste', 'sad', 'triste'].includes(emotion.toLowerCase());
  const isAggressiveEmotion = (emotion: string) => ['aggressivo', 'aggressive', 'agresivo'].includes(emotion.toLowerCase());
  const isHappyEmotion = (emotion: string) => ['felice', 'giocoso', 'calmo', 'happy', 'playful', 'calm', 'feliz', 'juguetón', 'tranquilo'].includes(emotion.toLowerCase());
  
  // Function to translate emotions from database
  const getEmotionTranslation = (emotion: string, language: string): string => {
    const emotionMappings = {
      it: { felice: 'Felice', calmo: 'Calmo', ansioso: 'Ansioso', eccitato: 'Eccitato', triste: 'Triste', aggressivo: 'Aggressivo', giocoso: 'Giocoso', rilassato: 'Rilassato' },
      en: { felice: 'Happy', calmo: 'Calm', ansioso: 'Anxious', eccitato: 'Excited', triste: 'Sad', aggressivo: 'Aggressive', giocoso: 'Playful', rilassato: 'Relaxed' },
      es: { felice: 'Feliz', calmo: 'Tranquilo', ansioso: 'Ansioso', eccitato: 'Emocionado', triste: 'Triste', aggressivo: 'Agresivo', giocoso: 'Juguetón', rilassato: 'Relajado' }
    };
    
    return emotionMappings[language]?.[emotion.toLowerCase()] || emotion;
  };

  // Helper function to translate insights using current language
  const translateInsight = (insight: string) => {
    try {
      // Mapping diretto delle stringhe di insight alle chiavi di traduzione
      const keyMappings: Record<string, string> = {
        'Challenging behavior with prolonged staring and rigid movement': 'analysis.insights.challengingBehaviorStaringRigid',
        'Postura corporea rilassata con coda alzata e orecchie erette': 'analysis.insights.relaxedPostureTailEars',
        'Behavioral activation aimed at play with repetitive sequences': 'analysis.insights.behavioralActivationPlay',
        'Stato di rilassamento profondo con respirazione regolare e lenta': 'analysis.insights.deepRelaxationBreathing',
        'Vocalizzazioni aggressive accompagnate da ringhio e abbaiare intenso': 'analysis.insights.aggressiveVocalizationsGrowling',
        'Difficulty in impulse control with repetitive behaviors': 'analysis.insights.difficultyImpulseControl',
        'Exploratory behavior with curiosity towards new objects and spaces': 'analysis.insights.exploratoryBehaviorCuriosity'
      };
      
      // Traduzioni concrete per ogni lingua (fallback diretto se qualcosa va storto)
      const insightTranslations = {
        it: {
          'difficultyImpulseControl': 'Difficoltà nel controllo degli impulsi con comportamenti ripetitivi',
          'exploratoryBehaviorCuriosity': 'Comportamento esplorativo con curiosità verso nuovi oggetti e spazi',
          'challengingBehaviorStaringRigid': 'Comportamento problematico con sguardo fisso prolungato e movimenti rigidi',
          'relaxedPostureTailEars': 'Postura corporea rilassata con coda alzata e orecchie erette',
          'behavioralActivationPlay': 'Attivazione comportamentale orientata al gioco con sequenze ripetitive',
          'deepRelaxationBreathing': 'Stato di rilassamento profondo con respirazione regolare e lenta',
          'aggressiveVocalizationsGrowling': 'Vocalizzazioni aggressive accompagnate da ringhio e abbaiare intenso'
        },
        en: {
          'difficultyImpulseControl': 'Difficulty in impulse control with repetitive behaviors',
          'exploratoryBehaviorCuriosity': 'Exploratory behavior with curiosity towards new objects and spaces',
          'challengingBehaviorStaringRigid': 'Challenging behavior with prolonged staring and rigid movement',
          'relaxedPostureTailEars': 'Relaxed body posture with raised tail and erect ears',
          'behavioralActivationPlay': 'Behavioral activation aimed at play with repetitive sequences',
          'deepRelaxationBreathing': 'Deep relaxation state with regular and slow breathing',
          'aggressiveVocalizationsGrowling': 'Aggressive vocalizations accompanied by growling and intense barking'
        },
        es: {
          'difficultyImpulseControl': 'Dificultad en el control de impulsos con comportamientos repetitivos',
          'exploratoryBehaviorCuriosity': 'Comportamiento exploratorio con curiosidad hacia nuevos objetos y espacios',
          'challengingBehaviorStaringRigid': 'Comportamiento desafiante con mirada fija prolongada y movimiento rígido',
          'relaxedPostureTailEars': 'Postura corporal relajada con cola levantada y orejas erguidas',
          'behavioralActivationPlay': 'Activación conductual orientada al juego con secuencias repetitivas',
          'deepRelaxationBreathing': 'Estado de relajación profunda con respiración regular y lenta',
          'aggressiveVocalizationsGrowling': 'Vocalizaciones agresivas acompañadas de gruñidos y ladridos intensos'
        }
      };
      
      // Prima proviamo a trovare la chiave di traduzione corrispondente all'insight
      const translationKey = keyMappings[insight];
      
      if (translationKey) {
        // Estrai la chiave breve (solo l'ultima parte dopo l'ultimo punto)
        const shortKey = translationKey.split('.').pop() || '';
        
        // Usa la traduzione diretta basata sulla lingua
        if (shortKey && insightTranslations[language] && insightTranslations[language][shortKey]) {
          return insightTranslations[language][shortKey];
        }
        
        // Se non riusciamo a trovare una traduzione diretta, restituiamo l'insight originale
      }
      
      // Fallback all'insight originale
      return insight;
    } catch (error) {
      console.error('Error translating insight:', error);
      return insight;
    }
  };

  const { user } = useAuth();
  // Translation system removed - Italian only
  const language = 'it';
  const [searchParams] = useSearchParams();
  const { selectedPet } = usePets();
  const { showToast } = useTranslatedToast();
  const { subscription } = useSubscription();
  const { showUpgradeModal, setShowUpgradeModal } = usePlanLimits();
  const notificationEvents = (() => {
    try {
      return useNotificationEventsContext();
    } catch (error) {
      console.warn('NotificationEventsContext not available:', error);
      return {
        triggerAnalysisCompleted: () => console.warn('Analysis completed notification not available'),
        triggerDiaryAdded: () => console.warn('Diary added notification not available'),
        triggerWellnessReminder: () => console.warn('Wellness reminder notification not available'),
        triggerAppointmentReminder: () => console.warn('Appointment reminder notification not available'),
      };
    }
  })();
  const { triggerAnalysisCompleted } = notificationEvents;
  const [activeTab, setActiveTab] = useState(() => {
    // Leggi il parametro tab dall'URL, default a 'upload'
    const tab = searchParams.get('tab');
    return ['upload', 'results', 'history', 'predictions'].includes(tab || '') ? tab || 'upload' : 'upload';
  });
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'Preparazione analisi'
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
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisData | null>(null);
  
  // State per le previsioni (dalla StatsPage)
  const [diaryData, setDiaryData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);
  const [predictionDateRange, setPredictionDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });

  // Load analyses
  useEffect(() => {
    if (selectedPet) {
      loadAnalyses();
      loadPredictionData();
    }
  }, [selectedPet]);
  
  // Load prediction data (per la tab Previsioni)
  const loadPredictionData = async () => {
    if (!selectedPet) return;
    
    try {
      const { from, to } = predictionDateRange;
      const fromStr = format(startOfDay(from), 'yyyy-MM-dd HH:mm:ss');
      const toStr = format(endOfDay(to), 'yyyy-MM-dd HH:mm:ss');

      // Fetch REAL diary entries per le previsioni
      const { data: diaryEntries } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .gte('entry_date', format(from, 'yyyy-MM-dd'))
        .lte('entry_date', format(to, 'yyyy-MM-dd'))
        .order('entry_date', { ascending: true });

      // Fetch REAL health metrics per le previsioni
      const { data: healthMetrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .gte('recorded_at', fromStr)
        .lte('recorded_at', toStr)
        .order('recorded_at', { ascending: true });

      // Fetch REAL wellness scores dal database
      const { data: wellnessScores } = await supabase
        .from('pet_wellness_scores')
        .select('*')
        .eq('pet_id', selectedPet.id)
        .gte('score_date', format(from, 'yyyy-MM-dd'))
        .lte('score_date', format(to, 'yyyy-MM-dd'))
        .order('score_date', { ascending: true });

      // Se non ci sono wellness scores, calcoliamo in base alle analisi REALI
      if (!wellnessScores || wellnessScores.length === 0) {
        const calculatedWellness = await calculateWellnessFromAnalyses();
        setWellnessData(calculatedWellness);
      } else {
        setWellnessData(wellnessScores);
      }

      setDiaryData(diaryEntries || []);
      setHealthData(healthMetrics || []);
    } catch (error) {
      console.error('Error loading REAL prediction data:', error);
    }
  };

  // Calcola wellness scores REALI dalle analisi esistenti
  const calculateWellnessFromAnalyses = async () => {
    if (!selectedPet) return [];
    
    const emotionScores: Record<string, number> = {
      'felice': 90,
      'calmo': 85,
      'giocoso': 88,
      'eccitato': 75,
      'ansioso': 40,
      'triste': 30,
      'aggressivo': 25
    };

    // Raggruppa analisi per giorno
    const dailyScores: Record<string, { total: number; count: number; date: string }> = {};
    
    analyses.forEach(analysis => {
      const date = format(new Date(analysis.created_at), 'yyyy-MM-dd');
      const emotionScore = emotionScores[analysis.primary_emotion] || 50;
      const confidenceBonus = (analysis.primary_confidence - 0.5) * 10; // Bonus più contenuto: -5 a +5
      const finalScore = Math.max(0, Math.min(100, emotionScore + confidenceBonus)); // Limite tra 0-100
      
      if (!dailyScores[date]) {
        dailyScores[date] = { total: 0, count: 0, date };
      }
      dailyScores[date].total += finalScore;
      dailyScores[date].count += 1;
    });

    // Converti in formato wellness_scores
    return Object.values(dailyScores).map(day => ({
      id: crypto.randomUUID(),
      pet_id: selectedPet!.id,
      user_id: selectedPet!.user_id,
      wellness_score: Math.round(day.total / day.count),
      score_date: day.date,
      factors: {
        calculated_from_analyses: true,
        total_analyses: day.count,
        avg_emotion_score: day.total / day.count
      },
      created_at: new Date().toISOString()
    }));
  };

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['upload', 'results', 'history', 'predictions'].includes(tab) && tab !== activeTab) {
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
      const newAnalyses = data || [];
      setAnalyses(newAnalyses);
      
      // Se non c'è un'analisi selezionata e ci sono analisi disponibili, seleziona la più recente
      if (!selectedAnalysis && newAnalyses.length > 0) {
        setSelectedAnalysis(newAnalyses[0]);
      }
      
      return newAnalyses;
    } catch (error: any) {
      showToast({
        title: 'Qualcosa è andato storto',
        description: 'Errore nel caricamento delle analisi',
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        getReadableAnalysisName(analysis, language).toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      showToast({
        title: 'Qualcosa è andato storto',
        description: 'Seleziona un pet per continuare',
        variant: "destructive"
      });
      return;
    }

    // Rimuovo controllo limite analisi - solo piano premium disponibile

    setProcessing({
      isProcessing: true,
      progress: 0,
      stage: 'Caricamento file'
    });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await processFile(file, i + 1, files.length);
      }
      
      const newAnalyses = await loadAnalyses();
      
      // FORZA la selezione dell'analisi più recente (appena completata)
      if (newAnalyses && newAnalyses.length > 0) {
        setSelectedAnalysis(newAnalyses[0]);
        // Forza il refresh del componente AnalysisResults
        setAnalyses([...newAnalyses]);
      }
      
      setActiveTab('results');
      
      // Scroll to top of page when analysis is completed
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
      showToast({
        title: 'Analisi completata',
        description: `${files.length} file analizzato${files.length > 1 ? 'i' : ''} con successo`,
      });
    } catch (error: any) {
      showToast({
        title: 'Qualcosa è andato storto',
        description: error.message || 'Errore durante l\'analisi',
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
      stage: 'Analisi AI'
    }));

    // Mock analysis - in real app this would call an edge function
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis = generateMockAnalysis(file, uploadData.path);

    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 60,
      stage: 'Salvataggio risultati'
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
      stage: current === total ? 'Completato' : `Preparazione ${current + 1}...`
    }));
  };

  const generateMockAnalysis = (file: File, storagePath: string) => {
    const emotions = ['felice', 'calmo', 'ansioso', 'eccitato', 'triste', 'aggressivo', 'giocoso'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = (Math.floor(Math.random() * 30) + 70) / 100; // 0.70-1.00
    
    const secondaryEmotions: Record<string, number> = {};
    emotions.filter(e => e !== primaryEmotion).slice(0, 2).forEach(emotion => {
      secondaryEmotions[emotion] = Math.floor(Math.random() * 30) + 10;
    });

    // Use translated insights based on emotion
    const getRandomInsight = (emotion: string) => {
      const insightsByEmotion: Record<string, string[]> = {
        felice: ['Comportamento gioioso con buona socializzazione', 'Stato emotivo positivo e rilassato', 'Energia equilibrata e benessere generale'],
        calmo: ['Postura rilassata e respirazione regolare', 'Stato di tranquillità e comfort', 'Equilibrio emotivo ottimale'],
        ansioso: ['Segnali di stress e tensione emotiva', 'Comportamento ansioso con possibili trigger', 'Necessità di rassicurazione e comfort'],
        eccitato: ['Energia elevata e stimolazione positiva', 'Comportamento vivace e reattivo', 'Buona motivazione e coinvolgimento'],
        triste: ['Stato emotivo depresso con energia ridotta', 'Possibili segnali di malinconia', 'Necessità di supporto emotivo'],
        aggressivo: ['Comportamento difensivo o territoriale', 'Segnali di irritabilità e tensione', 'Necessità di gestione comportamentale'],
        giocoso: ['Energia positiva orientata al gioco', 'Comportamento sociale e interattivo', 'Stato emotivo sano e dinamico']
      };
      
      const insights = insightsByEmotion[emotion] || ['Comportamento da monitorare attentamente'];
      return insights[Math.floor(Math.random() * insights.length)];
    };

    const getRandomRecommendations = (emotion: string) => {
      const recommendationsByEmotion: Record<string, string[]> = {
        felice: ['Continua con le attività che promuovono questo stato positivo', 'Mantieni la routine attuale', 'Rinforza i comportamenti positivi con premi'],
        calmo: ['Preserva l\'ambiente tranquillo', 'Mantieni orari regolari per i pasti e il riposo', 'Continua con le attività rilassanti'],
        ansioso: ['Crea un ambiente sicuro e prevedibile', 'Utilizza tecniche di rilassamento', 'Consulta un veterinario comportamentale', 'Riduci i fattori di stress ambientali'],
        eccitato: ['Incanalare l\'energia con attività strutturate', 'Fornire stimolazione mentale adeguata', 'Mantenere routine di esercizio regolare'],
        triste: ['Aumenta le interazioni positive', 'Consulta un veterinario per escludere problemi fisici', 'Incrementa attività stimolanti ma dolci'],
        aggressivo: ['Consulta immediatamente un esperto comportamentale', 'Evita situazioni scatenanti', 'Implementa protocolli di sicurezza'],
        giocoso: ['Fornire giocattoli appropriati', 'Organizzare sessioni di gioco regolari', 'Socializzazione controllata con altri animali']
      };
      
      const recommendations = recommendationsByEmotion[emotion] || ['Monitora attentamente il comportamento'];
      const count = Math.floor(Math.random() * 3) + 2;
      return recommendations.slice(0, count);
    };

    const getRandomTriggers = (emotion: string) => {
      const triggersByEmotion: Record<string, string[]> = {
        ansioso: ['Rumori forti', 'Estranei', 'Cambiamenti routine', 'Separazione'],
        felice: ['Giochi', 'Cibo preferito', 'Coccole', 'Uscite'],
        triste: ['Solitudine', 'Mancanza attenzioni', 'Cambiamenti casa', 'Malattia'],
        aggressivo: ['Territorio minacciato', 'Protezione risorse', 'Paura', 'Dominanza'],
        calmo: ['Ambiente tranquillo', 'Routine stabile', 'Presenza proprietario', 'Comfort'],
        eccitato: ['Nuove esperienze', 'Altri animali', 'Attività fisica', 'Stimoli'],
        giocoso: ['Giocattoli', 'Interazione sociale', 'Spazio aperto', 'Energia alta']
      };
      
      const triggers = triggersByEmotion[emotion] || ['Da determinare'];
      const triggerCount = Math.floor(Math.random() * 3) + 1;
      return triggers.slice(0, triggerCount);
    };

    return {
      primary_emotion: primaryEmotion,
      primary_confidence: confidence,
      secondary_emotions: secondaryEmotions,
      behavioral_insights: getRandomInsight(primaryEmotion),
      recommendations: getRandomRecommendations(primaryEmotion),
      triggers: getRandomTriggers(primaryEmotion),
      analysis_duration: `${Math.floor(Math.random() * 5) + 2} seconds`
    };
  };

  const generateTextAnalysis = (description: string) => {
    // Analisi più intelligente basata su parole chiave nella descrizione
    const anxiousKeywords = ['agitato', 'nervoso', 'trema', 'nasconde', 'abbaia', 'ansioso', 'paura', 'scappa'];
    const happyKeywords = ['felice', 'gioca', 'scodinzola', 'corre', 'salta', 'allegro', 'gioioso'];
    const sadKeywords = ['triste', 'apatia', 'solo', 'non mangia', 'depresso', 'isolato', 'silenzioso'];
    const aggressiveKeywords = ['aggressivo', 'ringhia', 'attacca', 'morde', 'territoriale', 'minaccia'];
    const calmKeywords = ['calmo', 'rilassato', 'tranquillo', 'pacifico', 'sereno', 'riposato'];
    const excitedKeywords = ['eccitato', 'energico', 'iperattivo', 'entusiasta', 'vivace'];
    const playfulKeywords = ['giocoso', 'gioca', 'scherzoso', 'divertente', 'ludico'];

    const lowerDescription = description.toLowerCase();
    
    let emotionScores: Record<string, number> = {
      ansioso: 0,
      felice: 0,
      triste: 0,
      aggressivo: 0,
      calmo: 0,
      eccitato: 0,
      giocoso: 0
    };

    // Conta le parole chiave per ogni emozione
    anxiousKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.ansioso += 1;
    });
    happyKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.felice += 1;
    });
    sadKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.triste += 1;
    });
    aggressiveKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.aggressivo += 1;
    });
    calmKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.calmo += 1;
    });
    excitedKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.eccitato += 1;
    });
    playfulKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword)) emotionScores.giocoso += 1;
    });

    // Trova l'emozione primaria
    const primaryEmotion = Object.keys(emotionScores).reduce((a, b) => 
      emotionScores[a] > emotionScores[b] ? a : b
    );

    // Se nessuna parola chiave trovata, usa analisi casuale ma pesata verso "calmo"
    if (emotionScores[primaryEmotion] === 0) {
      const defaultEmotions = ['calmo', 'calmo', 'felice', 'ansioso']; // peso maggiore per calmo
      const randomEmotion = defaultEmotions[Math.floor(Math.random() * defaultEmotions.length)];
      const analysis = generateMockAnalysis(new File([], 'text'), '');
      analysis.primary_emotion = randomEmotion;
      return analysis;
    }

    // Calcola confidenza basata su quante parole chiave abbiamo trovato
    const totalKeywords = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
    const confidence = Math.min(0.95, 0.65 + (emotionScores[primaryEmotion] / totalKeywords) * 0.3);

    // Crea emozioni secondarie
    const secondaryEmotions: Record<string, number> = {};
    Object.entries(emotionScores)
      .filter(([emotion, score]) => emotion !== primaryEmotion && score > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .forEach(([emotion, score]) => {
        secondaryEmotions[emotion] = Math.floor((score / totalKeywords) * 100);
      });

    const analysis = generateMockAnalysis(new File([], 'text'), '');
    analysis.primary_emotion = primaryEmotion;
    analysis.primary_confidence = confidence;
    analysis.secondary_emotions = secondaryEmotions;
    
    return analysis;
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const file = new File([audioBlob], `Registrazione_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.wav`, { type: 'audio/wav' });
    const fileList = new DataTransfer();
    fileList.items.add(file);
    await handleFileUpload(fileList.files);
  };

  const handleTextAnalysis = async (description: string) => {
    if (!selectedPet) {
      showToast({
        title: 'Qualcosa è andato storto',
        description: 'Seleziona un pet per continuare',
        variant: "destructive"
      });
      return;
    }

    setProcessing({
      isProcessing: true,
      progress: 0,
      stage: 'Analisi in corso'
    });

    try {
      setProcessing(prev => ({
        ...prev,
        progress: 30,
        stage: 'Analisi AI in corso'
      }));

      // Call the edge function for real AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-pet-behavior', {
        body: {
          description,
          petType: selectedPet.type,
          petName: selectedPet.name
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        // Fallback to simple analysis if edge function fails
        console.log('Using fallback analysis...');
        const fallbackAnalysis = {
          primary_emotion: 'calmo',
          primary_confidence: 0.75,
          secondary_emotions: {},
          behavioral_insights: 'Analisi basata sulla descrizione fornita. Comportamento osservato.',
          recommendations: [
            'Continua ad osservare il comportamento',
            'Mantieni una routine regolare',
            'Consulta un veterinario se necessario'
          ],
          triggers: ['Da determinare'],
          analysis_duration: '00:00:03'
        };
        
        const analysisData: AnalysisData = {
          id: crypto.randomUUID(),
          pet_id: selectedPet.id,
          user_id: selectedPet.user_id,
          file_name: `Descrizione_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
          file_type: 'text',
          file_size: description.length,
          storage_path: null,
          primary_emotion: fallbackAnalysis.primary_emotion,
          primary_confidence: fallbackAnalysis.primary_confidence, // Keep as decimal 0-1
          secondary_emotions: fallbackAnalysis.secondary_emotions,
          behavioral_insights: fallbackAnalysis.behavioral_insights,
          recommendations: fallbackAnalysis.recommendations,
          triggers: fallbackAnalysis.triggers,
          analysis_duration: fallbackAnalysis.analysis_duration,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_description: description
        };
        
        // Save fallback analysis
        const { error: dbError } = await supabase
          .from('pet_analyses')
          .insert({
            pet_id: analysisData.pet_id,
            user_id: analysisData.user_id,
            file_name: analysisData.file_name,
            file_type: analysisData.file_type,
            file_size: analysisData.file_size,
            storage_path: null,
            primary_emotion: analysisData.primary_emotion,
            primary_confidence: analysisData.primary_confidence,
            secondary_emotions: analysisData.secondary_emotions,
            behavioral_insights: analysisData.behavioral_insights,
            recommendations: analysisData.recommendations,
            triggers: analysisData.triggers,
            analysis_duration: analysisData.analysis_duration
          });
          
        if (dbError) throw dbError;
        
        setProcessing(prev => ({
          ...prev,
          progress: 100,
          stage: 'Completato'
        }));
        
        await loadAnalyses();
        
        showToast({
          title: 'Analisi completata',
          description: 'Analisi del testo completata con successo',
        });
        
        return;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Analisi non riuscita');
      }

      setProcessing(prev => ({
        ...prev,
        progress: 70,
        stage: 'Generazione report'
      }));

      // Create analysis data with real AI results
      const analysisData: AnalysisData = {
        id: crypto.randomUUID(),
        pet_id: selectedPet.id,
        user_id: selectedPet.user_id,
        file_name: `Descrizione_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
        file_type: 'text',
        file_size: description.length,
        storage_path: null, // No storage path for text
        primary_emotion: data.analysis.primary_emotion,
        primary_confidence: data.analysis.primary_confidence, // Keep as decimal 0-1
        secondary_emotions: data.analysis.secondary_emotions,
        behavioral_insights: data.analysis.behavioral_insights,
        recommendations: data.analysis.recommendations,
        triggers: data.analysis.triggers,
        analysis_duration: data.analysis.analysis_duration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_description: description // Store the original description
      };

      setProcessing(prev => ({
        ...prev,
        progress: 50,
        stage: 'Analisi emotiva'
      }));

      // Save to database
      const { error: dbError } = await supabase
        .from('pet_analyses')
        .insert({
          pet_id: analysisData.pet_id,
          user_id: analysisData.user_id,
          file_name: analysisData.file_name,
          file_type: analysisData.file_type,
          file_size: analysisData.file_size,
          storage_path: null, // Null for text analysis
          primary_emotion: analysisData.primary_emotion,
          primary_confidence: analysisData.primary_confidence,
          secondary_emotions: analysisData.secondary_emotions,
          behavioral_insights: analysisData.behavioral_insights,
          recommendations: analysisData.recommendations,
          triggers: analysisData.triggers,
          analysis_duration: analysisData.analysis_duration
        });

      if (dbError) throw dbError;

      setProcessing(prev => ({
        ...prev,
        progress: 100,
        stage: 'Completato'
      }));

      // Refresh analyses
      await loadAnalyses();

      showToast({
        title: 'Analisi completata',
        description: 'Analisi del testo completata con successo',
      });

      // Switch to results tab
      setActiveTab('results');
      
      // Scroll to top of page when analysis is completed
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
    } catch (error: any) {
      console.error('Text analysis error:', error);
      showToast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'analisi',
        variant: "destructive"
      });
    } finally {
      setProcessing({
        isProcessing: false,
        progress: 0,
        stage: 'Preparazione'
      });
    }
  };

  const handleStartRecording = () => {
    if (!selectedPet) {
      showToast({
        title: 'Errore',
        description: 'Seleziona un pet per continuare',
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
      addText(`File: ${getReadableAnalysisName(analysis, language)}`);
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
      showToast({
        title: 'Errore',
        description: 'Seleziona almeno un\'analisi da esportare',
        variant: "destructive"
      });
      return;
    }

    try {
      showToast({
        title: 'Generazione in corso',
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
        // Titolo hardcoded per ogni lingua
        const title = language === 'it' ? 'REPORT ANALISI MULTIPLE - PET VOICE' : 
                    language === 'es' ? 'INFORME DE ANÁLISIS MÚLTIPLES - PET VOICE' : 
                    'MULTIPLE ANALYSIS REPORT - PET VOICE';
        pdf.text(title, 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(14);
        // Etichetta pet hardcoded
        const petLabel = language === 'it' ? 'Pet' : language === 'es' ? 'Mascota' : 'Pet';
        pdf.text(`${petLabel}: ${selectedPet?.name || 'N/A'}`, 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        // Etichetta conteggio hardcoded
        const countLabel = language === 'it' ? 'Numero analisi' : 
                         language === 'es' ? 'Número de análisis' : 
                         'Analysis count';
        pdf.text(`${countLabel}: ${selectedAnalysesData.length}`, 20, yPosition);
        yPosition += 10;
        
        selectedAnalysesData.forEach((analysis, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${getReadableAnalysisName(analysis, language)}`, 20, yPosition);
          yPosition += lineHeight;
          
           pdf.setFont('helvetica', 'normal');
           // Usa testo hardcoded basato sulla lingua
           const dateLabel = language === 'it' ? 'Data' : language === 'es' ? 'Fecha' : 'Date';
           pdf.text(`${dateLabel}: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm')}`, 25, yPosition);
           yPosition += lineHeight;
           
           // Usa etichette hardcoded per le emozioni
           const emotionLabel = language === 'it' ? 'Emozione' : language === 'es' ? 'Emoción' : 'Emotion';
           const translatedEmotion = getEmotionTranslation(analysis.primary_emotion, language);
           pdf.text(`${emotionLabel}: ${translatedEmotion} (${(analysis.primary_confidence * 100).toFixed(0)}%)`, 25, yPosition);
           yPosition += lineHeight;
           
           if (analysis.behavioral_insights) {
             // Usa etichette hardcoded per gli insights
             const insightsLabel = language === 'it' ? 'Insight comportamentale' : 
                                 language === 'es' ? 'Insight conductual' : 'Behavioral insight';
             const translatedInsight = translateInsight(analysis.behavioral_insights);
             const insight = translatedInsight.length > 100 
               ? translatedInsight.substring(0, 100) + '...'
               : translatedInsight;
             pdf.text(`${insightsLabel}: ${insight}`, 25, yPosition);
            yPosition += lineHeight;
          }
          yPosition += 5;
        });

        const fileName = `analisi-multiple-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
        pdf.save(fileName);
      }

      showToast({
        title: 'PDF generato',
        description: 'Dati esportati con successo',
      });
    } catch (error) {
      showToast({
        title: 'Errore',
        description: 'Errore durante la generazione del PDF',
        variant: "destructive"
      });
    }
  };

  const handleBatchCompare = async () => {
    if (selectedAnalyses.length < 2) {
      showToast({
        title: 'Errore',
        description: 'Seleziona almeno due analisi per confrontarle',
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
      pdf.text(language === 'it' ? 'CONFRONTO ANALISI EMOTIVE - PET VOICE' : language === 'es' ? 'COMPARACIÓN DE ANÁLISIS EMOCIONALES - PET VOICE' : 'EMOTIONAL ANALYSIS COMPARISON - PET VOICE', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(14);
      pdf.text(`${language === 'it' ? 'Pet' : language === 'es' ? 'Mascota' : 'Pet'}: ${selectedPet?.name || 'N/A'}`, 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`${language === 'it' ? 'Periodo' : language === 'es' ? 'Período' : 'Period'}: ${format(new Date(Math.min(...analysesToCompare.map(a => new Date(a.created_at).getTime()))), 'dd/MM/yyyy')} - ${format(new Date(Math.max(...analysesToCompare.map(a => new Date(a.created_at).getTime()))), 'dd/MM/yyyy')}`, 20, yPosition);
      yPosition += 10;

      // Emotion distribution
      const emotionCounts: Record<string, number> = {};
      analysesToCompare.forEach(analysis => {
        emotionCounts[analysis.primary_emotion] = (emotionCounts[analysis.primary_emotion] || 0) + 1;
      });

      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'it' ? 'DISTRIBUZIONE EMOZIONI:' : language === 'es' ? 'DISTRIBUCIÓN DE EMOCIONES:' : 'EMOTION DISTRIBUTION:', 20, yPosition);
      yPosition += lineHeight;
      
      pdf.setFont('helvetica', 'normal');
       Object.entries(emotionCounts).forEach(([emotion, count]) => {
         const percentage = ((count / analysesToCompare.length) * 100).toFixed(1);
         const translatedEmotion = getEmotionTranslation(emotion, language);
         const timesText = language === 'it' ? 'volte' : language === 'es' ? 'veces' : 'times';
         pdf.text(`- ${translatedEmotion}: ${count} ${timesText} (${percentage}%)`, 25, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 5;

      // Average confidence
       const avgConfidence = (analysesToCompare.reduce((sum, a) => sum + (a.primary_confidence * 100), 0) / analysesToCompare.length).toFixed(1);
       pdf.setFont('helvetica', 'bold');
       pdf.text(`${language === 'it' ? 'CONFIDENZA MEDIA' : language === 'es' ? 'CONFIANZA PROMEDIO' : 'AVERAGE CONFIDENCE'}: ${avgConfidence}%`, 20, yPosition);
      yPosition += 10;

      // Timeline
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'it' ? 'CRONOLOGIA ANALISI:' : language === 'es' ? 'CRONOLOGÍA DE ANÁLISIS:' : 'ANALYSIS TIMELINE:', 20, yPosition);
      yPosition += lineHeight;
      
      analysesToCompare
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .forEach((analysis, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${index + 1}. ${format(new Date(analysis.created_at), 'dd/MM HH:mm')} - ${getEmotionTranslation(analysis.primary_emotion, language)} (${(analysis.primary_confidence * 100).toFixed(0)}%)`, 25, yPosition);
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

      showToast({
        title: 'Eliminato',
        description: `${selectedAnalyses.length} analisi eliminate`,
      });

      setSelectedAnalyses([]);
      loadAnalyses();
    } catch (error: any) {
      showToast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione',
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

      showToast({
        title: 'PDF generato',
        description: `File salvato: ${fileName}`,
      });
    } catch (error: any) {
      showToast({
        title: 'Errore',
        description: 'Errore durante la generazione del PDF',
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

      showToast({
        title: 'Promemoria programmato',
        description: `Promemoria creato per il ${format(followUpDate, 'dd/MM/yyyy')}`,
      });
    } catch (error: any) {
      showToast({
        title: 'Errore',
        description: 'Impossibile creare il promemoria',
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

      showToast({
        title: 'Eliminato',
        description: 'Analisi eliminata con successo',
      });

      setSelectedAnalyses(prev => prev.filter(id => id !== deleteConfirm.analysisId));
      loadAnalyses();
    } catch (error: any) {
      showToast({
        title: 'Errore',
        description: 'Errore durante l\'eliminazione',
        variant: "destructive"
      });
    }
  };

  if (!selectedPet) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nessun pet selezionato</h2>
          <p className="text-muted-foreground">
            Seleziona un pet dal menu per iniziare l'analisi
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
            <Microscope className="h-8 w-8 text-primary" />
            Analisi Emotiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Analizza le vocalizzazioni di {selectedPet.name}
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

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-guide="upload-button">
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
          <div className="w-full">
            <TextAnalyzer 
              onTextSubmitted={handleTextAnalysis}
              isProcessing={processing.isProcessing}
            />
          </div>
        </TabsContent>


        <TabsContent value="results" className="space-y-6" data-guide="results-section">
          {analyses.length > 0 ? (
            <AnalysisResults 
              analyses={analyses.slice(0, 3)} 
              petName={selectedPet.name}
            />
          ) : (
            <Card className="text-center p-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nessuna analisi disponibile</h3>
              <p className="text-muted-foreground mb-4">
                Nuova Analisi - carica un file audio o video
              </p>
              <Button onClick={() => setActiveTab('upload')} className="bg-primary text-primary-foreground">
                <Upload className="h-4 w-4 mr-2" />
                Inizia Analisi
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
                Filtri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cerca</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome file"
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
                      <SelectItem value="all">Tutte</SelectItem>
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
                  <label className="text-sm font-medium">Confidenza</label>
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
                    Mostrando {filteredAnalyses.length} di {analyses.length} analisi
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
                  Previsione basata sui dati storici
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPet ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          // Calcola trend basato sulle analisi reali degli ultimi 30 giorni
                          const last30Days = analyses.filter(a => 
                            new Date(a.created_at) >= subDays(new Date(), 30)
                          );
                          const last7Days = analyses.filter(a => 
                            new Date(a.created_at) >= subDays(new Date(), 7)
                          );
                          
                          // Calcola score di benessere basato su emozioni positive vs negative
                          const calculateWellnessScore = (analysisArray: any[]) => {
                            if (analysisArray.length === 0) return 0;
                            const positiveEmotions = ['felice', 'giocoso', 'calmo', 'rilassato', 'happy', 'playful', 'calm', 'relaxed'];
                            const positiveCount = analysisArray.filter(a => 
                              positiveEmotions.some(emotion => a.primary_emotion.toLowerCase().includes(emotion))
                            ).length;
                            return (positiveCount / analysisArray.length) * 100;
                          };
                          
                          const currentScore = calculateWellnessScore(last7Days);
                          const previousScore = calculateWellnessScore(
                            analyses.filter(a => {
                              const date = new Date(a.created_at);
                              return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
                            })
                          );
                          
                          const trend = currentScore - previousScore;
                          
                          return trend > 5 ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : trend < -5 ? (
                            <TrendingDown className="h-5 w-5 text-destructive" />
                          ) : (
                            <div className="h-5 w-5 bg-warning rounded-full" />
                          );
                        })()}
                        <span className="font-medium">
                          {(() => {
                            // Stesso calcolo del trend per il testo
                            const last7Days = analyses.filter(a => 
                              new Date(a.created_at) >= subDays(new Date(), 7)
                            );
                            const previousWeek = analyses.filter(a => {
                              const date = new Date(a.created_at);
                              return date >= subDays(new Date(), 14) && date < subDays(new Date(), 7);
                            });
                            
                            const calculateWellnessScore = (analysisArray: any[]) => {
                              if (analysisArray.length === 0) return 0;
                              const positiveEmotions = ['felice', 'giocoso', 'calmo', 'rilassato', 'happy', 'playful', 'calm', 'relaxed'];
                              const positiveCount = analysisArray.filter(a => 
                                positiveEmotions.some(emotion => a.primary_emotion.toLowerCase().includes(emotion))
                              ).length;
                              return (positiveCount / analysisArray.length) * 100;
                            };
                            
                            const currentScore = calculateWellnessScore(last7Days);
                            const previousScore = calculateWellnessScore(previousWeek);
                            const trend = currentScore - previousScore;
                            
                            return trend > 5 ? "Miglioramento Significativo" : 
                                   trend < -5 ? "Peggioramento Rilevato" : 
                                   "Andamento Stabile";
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(() => {
                          const last7Days = analyses.filter(a => 
                            new Date(a.created_at) >= subDays(new Date(), 7)
                          );
                          const positiveEmotions = ['felice', 'giocoso', 'calmo', 'rilassato'];
                          const positiveCount = last7Days.filter(a => 
                            positiveEmotions.some(emotion => a.primary_emotion.toLowerCase().includes(emotion))
                          ).length;
                          
                          const positivePercentage = last7Days.length > 0 ? 
                            Math.round((positiveCount / last7Days.length) * 100) : 0;
                          
                          return `Basato su ${last7Days.length} analisi recenti: ${positivePercentage}% emozioni positive`;
                        })()}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Dati insufficienti per previsioni - Effettua più analisi
                      </p>
                    </div>
                  )}
                  
                  {analyses.length > 0 && (() => {
                    const last7Days = analyses.filter(a => 
                      new Date(a.created_at) >= subDays(new Date(), 7)
                    );
                    const last30Days = analyses.filter(a => 
                      new Date(a.created_at) >= subDays(new Date(), 30)
                    );
                    
                    const calculateWellnessScore = (analysisArray: any[]) => {
                      if (analysisArray.length === 0) return 0;
                      const positiveEmotions = ['felice', 'giocoso', 'calmo', 'rilassato', 'happy', 'playful', 'calm', 'relaxed'];
                      const positiveCount = analysisArray.filter(a => 
                        positiveEmotions.some(emotion => a.primary_emotion.toLowerCase().includes(emotion))
                      ).length;
                      return (positiveCount / analysisArray.length) * 100;
                    };
                    
                    const currentScore = calculateWellnessScore(last7Days);
                    const monthlyScore = calculateWellnessScore(last30Days);
                    const avgConfidence = last7Days.length > 0 ? 
                      last7Days.reduce((sum, a) => sum + (a.primary_confidence * 100), 0) / last7Days.length : 0;
                    
                    // Previsione realistica basata sui dati
                    const prediction = Math.max(0, Math.min(100, 
                      currentScore + (avgConfidence > 80 ? 5 : avgConfidence > 60 ? 0 : -5)
                    ));
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Benessere attuale (7 giorni)</span>
                          <span className="font-medium">{Math.round(currentScore)}%</span>
                        </div>
                        <Progress value={currentScore} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Previsione 30 giorni</span>
                          <span className="font-medium text-primary">{Math.round(prediction)}%</span>
                        </div>
                        <Progress value={prediction} className="h-2 opacity-70" />
                        <div className="text-xs text-muted-foreground">
                          <div>📊 Affidabilità dati: {Math.round(avgConfidence)}%</div>
                          <div>📈 Trend mensile: {Math.round(monthlyScore)}%</div>
                        </div>
                      </div>
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
                  Suggerimenti personalizzati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    // RACCOMANDAZIONI AI COMPLETE - Analisi integrata di tutti i dati
                    const generateComprehensiveAIRecommendations = () => {
                      const recommendations = [];
                      
                      // DATI ANALISI COMPORTAMENTALI (ultimi 7 e 30 giorni)
                      const last7Days = analyses.filter(a => 
                        new Date(a.created_at) >= subDays(new Date(), 7)
                      );
                      const last30Days = analyses.filter(a => 
                        new Date(a.created_at) >= subDays(new Date(), 30)
                      );
                      
                      // DATI DIARIO (ultimi 7 e 14 giorni)
                      const recentDiary = diaryData.filter(d => 
                        new Date(d.entry_date) >= subDays(new Date(), 7)
                      );
                      const last14DaysDiary = diaryData.filter(d => 
                        new Date(d.entry_date) >= subDays(new Date(), 14)
                      );
                      
                      // DATI SALUTE (ultimi 7 giorni)
                      const recentHealth = healthData.filter(h => 
                        new Date(h.recorded_at) >= subDays(new Date(), 7)
                      );
                      
                      // DATI WELLNESS (ultimi 30 giorni)
                      const recentWellness = wellnessData.filter(w => 
                        new Date(w.score_date) >= subDays(new Date(), 30)
                      );
                      
                      // Helper per classificare emozioni
                      const isAnxiousEmotion = (emotion: string) => ['ansioso', 'stressato', 'nervoso'].includes(emotion.toLowerCase());
                      const isSadEmotion = (emotion: string) => ['triste', 'depresso', 'apatico'].includes(emotion.toLowerCase());
                      const isAggressiveEmotion = (emotion: string) => ['aggressivo', 'irritato', 'arrabbiato'].includes(emotion.toLowerCase());
                      const isHappyEmotion = (emotion: string) => ['felice', 'giocoso', 'calmo', 'rilassato', 'affettuoso'].includes(emotion.toLowerCase());
                      
                      // 1. ANALISI COMPORTAMENTALE
                      const anxiousCount = last7Days.filter(a => isAnxiousEmotion(a.primary_emotion)).length;
                      const sadCount = last7Days.filter(a => isSadEmotion(a.primary_emotion)).length;
                      const aggressiveCount = last7Days.filter(a => isAggressiveEmotion(a.primary_emotion)).length;
                      const happyCount = last7Days.filter(a => isHappyEmotion(a.primary_emotion)).length;
                      
                      // 2. ANALISI DIARIO
                      const avgMood = recentDiary.length > 0 ? 
                        recentDiary.reduce((sum, d) => sum + (d.mood_score || 5), 0) / recentDiary.length : 5;
                      const lowMoodDays = recentDiary.filter(d => (d.mood_score || 5) <= 3).length;
                      const highMoodDays = recentDiary.filter(d => (d.mood_score || 5) >= 8).length;
                      
                      // Analisi behavioral tags dal diario
                      const negativeTags = recentDiary.reduce((count, d) => {
                        return count + (d.behavioral_tags?.filter(tag => 
                          ['aggressivo', 'ansioso', 'triste', 'agitato', 'spaventato', 'apatico'].includes(tag.toLowerCase())
                        )?.length || 0);
                      }, 0);
                      
                      const positiveTags = recentDiary.reduce((count, d) => {
                        return count + (d.behavioral_tags?.filter(tag => 
                          ['felice', 'giocoso', 'calmo', 'affettuoso', 'energico', 'socievole'].includes(tag.toLowerCase())
                        )?.length || 0);
                      }, 0);
                      
                      // 3. ANALISI SALUTE
                      const tempMetrics = recentHealth.filter(h => h.metric_type === 'temperature');
                      const heartMetrics = recentHealth.filter(h => h.metric_type === 'heart_rate');
                      const criticalHealthIssues = recentHealth.filter(h => {
                        if (h.metric_type === 'temperature') {
                          return h.value < 37.5 || h.value > 40;
                        }
                        if (h.metric_type === 'heart_rate') {
                          return h.value < 50 || h.value > 180;
                        }
                        return false;
                      }).length;
                      
                      // 4. ANALISI WELLNESS TREND
                      const wellnessTrend = recentWellness.length >= 2 ? 
                        recentWellness[recentWellness.length - 1].wellness_score - recentWellness[0].wellness_score : 0;
                      
                      // GENERAZIONE RACCOMANDAZIONI PERSONALIZZATE
                      
                      // SALUTE CRITICA (priorità massima)
                      if (criticalHealthIssues > 0) {
                        recommendations.push({
                          type: 'critical',
                          text: `🚨 URGENTE: ${criticalHealthIssues} parametri vitali critici rilevati - contatta immediatamente il veterinario`,
                          priority: 'critical',
                          category: 'salute'
                        });
                      }
                      
                      // PATTERN COMPORTAMENTALI PROBLEMATICI
                      if (anxiousCount >= 3 || (recentDiary.length > 0 && negativeTags >= 5)) {
                        recommendations.push({
                          type: 'warning',
                          text: `⚠️ Pattern ansia rilevato: ${anxiousCount} episodi comportamentali + ${negativeTags} segnali negativi nel diario`,
                          priority: 'high',
                          category: 'comportamento'
                        });
                      }
                      
                      if (aggressiveCount > 0) {
                        recommendations.push({
                          type: 'warning',
                          text: `🔴 Aggressività rilevata: ${aggressiveCount} episodi - valuta trigger ambientali e stress`,
                          priority: 'high',
                          category: 'comportamento'
                        });
                      }
                      
                      // TREND MOOD DIARIO
                      if (lowMoodDays >= 3) {
                        recommendations.push({
                          type: 'warning',
                          text: `😔 Umore basso persistente: ${lowMoodDays} giorni con mood ≤3/10 - considera supporto comportamentale`,
                          priority: 'medium',
                          category: 'benessere'
                        });
                      } else if (avgMood < 4) {
                        recommendations.push({
                          type: 'info',
                          text: `📊 Mood medio basso (${avgMood.toFixed(1)}/10) - aumenta attività positive e interazioni`,
                          priority: 'medium',
                          category: 'benessere'
                        });
                      }
                      
                      // MONITORAGGIO SALUTE
                      if (tempMetrics.length === 0 && heartMetrics.length === 0) {
                        recommendations.push({
                          type: 'info',
                          text: `💡 Nessun monitoraggio vitali recente - aggiungi temperatura e battito per prevenzione`,
                          priority: 'medium',
                          category: 'salute'
                        });
                      }
                      
                      // FREQUENZA DATI
                      if (recentDiary.length < 3) {
                        recommendations.push({
                          type: 'info',
                          text: `📝 Diario incompleto: solo ${recentDiary.length} voci negli ultimi 7 giorni - migliora tracciamento`,
                          priority: 'low',
                          category: 'monitoraggio'
                        });
                      }
                      
                      if (last7Days.length < 2) {
                        recommendations.push({
                          type: 'info',
                          text: `🔍 Poche analisi comportamentali: ${last7Days.length} negli ultimi 7 giorni - aumenta frequenza`,
                          priority: 'low',
                          category: 'monitoraggio'
                        });
                      }
                      
                      // TREND POSITIVI
                      if (happyCount >= 4 && positiveTags >= 8) {
                        recommendations.push({
                          type: 'success',
                          text: `🎉 Stato ottimale: ${happyCount} emozioni positive + ${positiveTags} comportamenti positivi - mantieni routine`,
                          priority: 'low',
                          category: 'benessere'
                        });
                      }
                      
                      if (wellnessTrend > 10) {
                        recommendations.push({
                          type: 'success',
                          text: `📈 Miglioramento wellness: +${wellnessTrend} punti - continua così!`,
                          priority: 'low',
                          category: 'benessere'
                        });
                      }
                      
                      // RACCOMANDAZIONI STAGIONALI/METEO (se disponibili)
                      const currentSeason = new Date().getMonth();
                      if (currentSeason >= 5 && currentSeason <= 7) { // Estate
                        recommendations.push({
                          type: 'info',
                          text: `☀️ Estate: monitora temperatura corporea e idratazione - evita passeggiate nelle ore calde`,
                          priority: 'medium',
                          category: 'stagionale'
                        });
                      } else if (currentSeason >= 11 || currentSeason <= 1) { // Inverno
                        recommendations.push({
                          type: 'info',
                          text: `❄️ Inverno: aumenta attività indoor e monitora articolazioni - protezione dal freddo`,
                          priority: 'medium',
                          category: 'stagionale'
                        });
                      }
                      
                      // Se non ci sono problemi specifici
                      if (recommendations.length === 0) {
                        recommendations.push({
                          type: 'success',
                          text: `✅ Stato generale buono - continua monitoraggio regolare per prevenzione`,
                          priority: 'low',
                          category: 'generale'
                        });
                      }
                      
                      // Ordina per priorità e categoria
                      return recommendations.sort((a, b) => {
                        const priorityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                      }).slice(0, 5); // Massimo 5 raccomandazioni
                    };
                    
                    const comprehensiveRecommendations = generateComprehensiveAIRecommendations();
                    
                    return comprehensiveRecommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 bg-card text-card-foreground shadow-soft hover:shadow-glow transition-smooth border-l-primary">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-foreground">{rec.text}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="text-xs bg-background text-foreground border-border">
                              {rec.priority === 'critical' ? "🚨 CRITICA" :
                               rec.priority === 'high' ? "🔴 Alta" : 
                               rec.priority === 'medium' ? "🟡 Media" : 
                               rec.priority === 'low' ? "🟢 Bassa" : "ℹ️ Info"}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                              {rec.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Dati integrati: {analyses.length}A + {diaryData.length}D + {healthData.length}S + {wellnessData.length}W
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Predictions REALI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Pattern Stagionali
              </CardTitle>
              <CardDescription>
                Tendenze basate sui dati storici
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Function to translate emotions from database (local scope)
                const getEmotionTranslationLocal = (emotion: string, language: string): string => {
                  const emotionMappings = {
                    it: { felice: 'Felice', calmo: 'Calmo', ansioso: 'Ansioso', eccitato: 'Eccitato', triste: 'Triste', aggressivo: 'Aggressivo', giocoso: 'Giocoso', rilassato: 'Rilassato' },
                    en: { felice: 'Happy', calmo: 'Calm', ansioso: 'Anxious', eccitato: 'Excited', triste: 'Sad', aggressivo: 'Aggressive', giocoso: 'Playful', rilassato: 'Relaxed' },
                    es: { felice: 'Feliz', calmo: 'Tranquilo', ansioso: 'Ansioso', eccitato: 'Emocionado', triste: 'Triste', aggressivo: 'Agresivo', giocoso: 'Juguetón', rilassato: 'Relajado' }
                  };
                  
                  return emotionMappings[language]?.[emotion.toLowerCase()] || emotion;
                };
                
                // Calcola pattern stagionali REALI dalle analisi
                const getSeasonFromDate = (date: string) => {
                  const month = new Date(date).getMonth() + 1; // 1-12
                  if (month >= 3 && month <= 5) return "Primavera";
                  if (month >= 6 && month <= 8) return "Estate";
                  if (month >= 9 && month <= 11) return "Autunno";
                  return "Inverno";
                };
                
                const seasonalData: Record<string, { total: number; positive: number; negative: number; analyses: any[] }> = {
                  "Primavera": { total: 0, positive: 0, negative: 0, analyses: [] },
                  "Estate": { total: 0, positive: 0, negative: 0, analyses: [] },
                  "Autunno": { total: 0, positive: 0, negative: 0, analyses: [] },
                  "Inverno": { total: 0, positive: 0, negative: 0, analyses: [] }
                };
                
                // Aggrega dati REALI per stagione
                analyses.forEach(analysis => {
                  const season = getSeasonFromDate(analysis.created_at);
                  seasonalData[season].total++;
                  seasonalData[season].analyses.push(analysis);
                  
                  if (isHappyEmotion(analysis.primary_emotion)) {
                    seasonalData[season].positive++;
                  } else if (isAnxiousEmotion(analysis.primary_emotion) || isSadEmotion(analysis.primary_emotion) || isAggressiveEmotion(analysis.primary_emotion)) {
                    seasonalData[season].negative++;
                  }
                });
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(seasonalData).map(([season, data]) => {
                      const positiveRate = data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0;
                      const negativeRate = data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0;
                      const mostCommonEmotion = data.analyses.length > 0 ? 
                        data.analyses.reduce((acc, curr) => {
                          acc[curr.primary_emotion] = (acc[curr.primary_emotion] || 0) + 1;
                          return acc;
                        }, {}) : {};
                      
                      const topEmotion = Object.keys(mostCommonEmotion).length > 0 ?
                        Object.entries(mostCommonEmotion).sort(([,a], [,b]) => (b as number) - (a as number))[0] : ['N/A', 0];
                      
                      return (
                        <div key={season} className="p-4 border rounded-lg bg-card">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            {season}
                            <Badge variant="outline" className="text-xs">
                              {data.total} analisi
                            </Badge>
                          </h4>
                          
                          {data.total > 0 ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Emozioni positive</span>
                                <span className="font-medium text-success">{positiveRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Problemi rilevati</span>
                                <span className="font-medium text-destructive">{negativeRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Emozione predominante</span>
                                <span className="font-medium capitalize">{getEmotionTranslationLocal(topEmotion[0] as string, language)}</span>
                              </div>
                              <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground">
                                  Dati da {data.analyses.length} analisi
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm">
                              <p>Nessun dato disponibile</p>
                              <p className="text-xs">Continua ad analizzare per vedere i pattern</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Weather Mood Predictor */}
          {user && (
            <WeatherMoodPredictor 
              user={user}
              onWeatherUpdate={(data) => {
                console.log('Weather data updated:', data);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={detailsModal.open} onOpenChange={(open) => setDetailsModal({ open, analysis: null })}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dettagli Analisi
            </DialogTitle>
            <DialogDescription>
              {`Panoramica completa dell'analisi di ${detailsModal.analysis?.file_name}`}
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
                      <Label className="text-sm font-medium">File</Label>
                      <p className="text-sm">{getReadableAnalysisName(detailsModal.analysis, language)}</p>
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
                      <Label className="text-sm font-medium">Durata</Label>
                      <p className="text-sm">{String(detailsModal.analysis.analysis_duration)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data</Label>
                      <p className="text-sm">{format(new Date(detailsModal.analysis.created_at), 'dd MMMM yyyy, HH:mm', { locale: it })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emotional Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analisi Emotiva</CardTitle>
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
                        <Progress value={detailsModal.analysis.primary_confidence * 100} className="w-32 h-3" />
                        <span className="font-semibold text-lg">{(detailsModal.analysis.primary_confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {Object.keys(detailsModal.analysis.secondary_emotions).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Emozioni Secondarie</Label>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {Object.entries(detailsModal.analysis.secondary_emotions).map(([emotion, confidence]) => (
                           <Badge key={emotion} variant="outline" className="text-sm">
                             {emotion}: {Number(confidence).toFixed(0)}%
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
               {language === 'it' ? 'Confronta Analisi' : language === 'es' ? 'Comparar Análisis' : 'Compare Analyses'}
            </DialogTitle>
            <DialogDescription>
               {language === 'it' ? `Confronto di ${compareModal.analyses.length} risultati selezionati` : 
                language === 'es' ? `Comparación de ${compareModal.analyses.length} resultados seleccionados` : 
                `Comparison of ${compareModal.analyses.length} selected results`}
            </DialogDescription>
          </DialogHeader>
          
          {compareModal.analyses.length > 0 && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{compareModal.analyses.length}</div>
                    <p className="text-xs text-muted-foreground">{language === 'it' ? 'Confronta Analisi' : language === 'es' ? 'Comparar Análisis' : 'Compare Analyses'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {format(new Date(Math.min(...compareModal.analyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')} - {format(new Date(Math.max(...compareModal.analyses.map(a => new Date(a.created_at).getTime()))), 'dd/MM')}
                    </div>
                    <p className="text-xs text-muted-foreground">Periodo</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {(compareModal.analyses.reduce((sum, a) => sum + (a.primary_confidence * 100), 0) / compareModal.analyses.length).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Confidenza</p>
                  </CardContent>
                </Card>
              </div>

              {/* Emotion Distribution */}
              <Card>
                <CardHeader>
                   <CardTitle className="text-lg">{language === 'it' ? 'Emozioni' : language === 'es' ? 'Emociones' : 'Emotions'}</CardTitle>
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
                                <span className="font-medium capitalize">{getEmotionTranslation(emotion, language)}</span>
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
                  <CardTitle className="text-lg">{language === 'it' ? 'Cronologia' : language === 'es' ? 'Cronología' : 'History'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {compareModal.analyses
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((analysis, index) => (
                        <div key={analysis.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{index + 1}.</span>
                            <span className="text-sm font-medium">{getReadableAnalysisName(analysis, language)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{format(new Date(analysis.created_at), 'dd/MM HH:mm', { locale: language === 'it' ? undefined : undefined })}</span>
                            <Badge variant="outline">{getEmotionTranslation(analysis.primary_emotion, language)}</Badge>
                            <span className="font-medium">{(analysis.primary_confidence * 100).toFixed(0)}%</span>
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
                       const fileName = language === 'it' ? `confronto-analisi-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf` :
                                       language === 'es' ? `comparacion-analisis-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf` :
                                       `analysis-comparison-${selectedPet?.name}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
                      pdf.save(fileName);
                      
                      showToast({
                        title: 'PDF generato',
                        description: `Dati esportati: ${fileName}`,
                      });
                    } catch (error) {
                      showToast({
                        title: 'Errore',
                        description: 'Errore durante la generazione del PDF',
                        variant: "destructive"
                      });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {language === 'it' ? 'Scarica PDF' : language === 'es' ? 'Descargar PDF' : 'Download PDF'}
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
        title={deleteConfirm.isMultiple ? "Conferma eliminazione" : "Conferma eliminazione"}
        description={
          deleteConfirm.isMultiple 
            ? `Sei sicuro di voler eliminare ${selectedAnalyses.length} analisi?`
            : "Sei sicuro di voler eliminare questa analisi?"
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