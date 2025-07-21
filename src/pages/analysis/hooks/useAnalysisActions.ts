import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotificationEventsContext } from '@/contexts/NotificationEventsContext';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  currentFile?: string;
}

export const useAnalysisActions = (petId?: string, onComplete?: () => void) => {
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'Preparazione...'
  });
  
  const { toast } = useToast();
  const { triggerAnalysisCompleted } = useNotificationEventsContext();

  const generateMockAnalysis = useCallback((file: File, storagePath: string) => {
    const emotions = ['felice', 'calmo', 'ansioso', 'eccitato', 'triste', 'aggressivo', 'giocoso'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    const secondaryEmotions: Record<string, number> = {};
    emotions.filter(e => e !== primaryEmotion).slice(0, 2).forEach(emotion => {
      secondaryEmotions[emotion] = Math.floor(Math.random() * 30) + 10;
    });

    const mockInsights = [
      "Il pet mostra segni di benessere emotivo con interazioni positive",
      "Comportamento tipico per questa situazione specifica",
      "Livelli di stress nella norma per il contesto osservato",
      "Risposta emotiva appropriata agli stimoli ambientali"
    ];

    const mockRecommendations = [
      "Continua con le routine attuali che favoriscono questo stato",
      "Mantieni un ambiente calmo e stimolante",
      "Considera attività che rinforzano il benessere emotivo"
    ];

    const mockTriggers = [
      "Ambiente familiare",
      "Presenza del proprietario",
      "Routine quotidiana"
    ];

    return {
      primary_emotion: primaryEmotion,
      primary_confidence: confidence,
      secondary_emotions: secondaryEmotions,
      behavioral_insights: mockInsights[Math.floor(Math.random() * mockInsights.length)],
      recommendations: mockRecommendations,
      triggers: mockTriggers,
      analysis_duration: Math.floor(Math.random() * 10) + 5
    };
  }, []);

  const processFile = useCallback(async (file: File, current: number, total: number) => {
    if (!petId) throw new Error('Pet ID non disponibile');

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
      .upload(`${userID}/analyses/${petId}/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Simulate AI analysis
    setProcessing(prev => ({
      ...prev,
      progress: fileProgress + 30,
      stage: `Analisi AI in corso...`
    }));

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
        user_id: userID,
        pet_id: petId,
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
  }, [petId, generateMockAnalysis]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!petId) {
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
      
      onComplete?.();
      
      toast({
        title: "Successo!",
        description: `${files.length} file analizzati con successo`,
      });

      // Trigger notification
      const pet = await supabase
        .from('pets')
        .select('name')
        .eq('id', petId)
        .single();
      
      if (pet.data) {
        triggerAnalysisCompleted(pet.data.name);
      }
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
  }, [petId, processFile, onComplete, toast, triggerAnalysisCompleted]);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    if (!petId) {
      toast({
        title: "Errore",
        description: "Seleziona un pet prima di iniziare l'analisi",
        variant: "destructive"
      });
      return;
    }

    const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, { 
      type: 'audio/webm' 
    });
    
    await handleFileUpload(new FileList() as any);
  }, [petId, handleFileUpload, toast]);

  const handleStartRecording = useCallback(() => {
    // Recording start logic handled by AudioRecorder component
  }, []);

  return {
    processing,
    handleFileUpload,
    handleRecordingComplete,
    handleStartRecording
  };
};