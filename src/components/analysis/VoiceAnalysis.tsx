import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Play, Pause, Loader2, Heart, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePets } from '@/contexts/PetContext';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  currentFile?: string;
}

interface VoiceAnalysisProps {
  onAnalysisComplete?: (analysisId: string) => void;
  setProcessing?: React.Dispatch<React.SetStateAction<ProcessingState>>;
}

const VoiceAnalysis: React.FC<VoiceAnalysisProps> = ({ onAnalysisComplete, setProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { selectedPet } = usePets();
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        // Auto-analizza quando si ferma la registrazione (come Registrazione Diretta)
        setTimeout(() => {
          analyzeBlob(blob);
        }, 500); // Piccolo delay per far vedere che la registrazione è finita
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer per il tempo di registrazione con limite di 120 secondi
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Stop automatico dopo 2 minuti per evitare file troppo grandi
          if (newTime >= 120) {
            stopRecording();
            toast({
              title: "Registrazione fermata",
              description: "Limite di 2 minuti raggiunto per evitare timeout",
              variant: "default"
            });
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (recordedBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(recordedBlob);
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audioRef.current.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const analyzeBlob = async (blob?: Blob) => {
    const recordingToAnalyze = blob || recordedBlob;
    if (!recordingToAnalyze) {
      toast({
        title: "Errore",
        description: "Nessuna registrazione disponibile",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPet) {
      toast({
        title: "Errore",
        description: "Seleziona un pet prima di procedere",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    // Attiva processing animation se disponibile
    setProcessing?.({
      isProcessing: true,
      progress: 10,
      stage: 'Analisi vocale in corso...'
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      // Converti direttamente in base64 senza compressione (più veloce)
      const arrayBuffer = await recordingToAnalyze.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('analyze-voice-emotions', {
        body: {
          audioData: base64Audio,
          petId: selectedPet.id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Errore durante l\'analisi');
      }

      // Aggiorna progresso
      setProcessing?.({
        isProcessing: true,
        progress: 90,
        stage: 'Salvataggio risultati...'
      });

      setTranscription(data.transcription);

      toast({
        title: "Analisi completata!",
        description: `Pet: ${data.analysis.pet_emotion.primary} | Tu: ${data.analysis.owner_emotion.primary}`,
      });

      // Reset
      setRecordedBlob(null);
      setRecordingTime(0);
      onAnalysisComplete?.(data.analysisId);

    } catch (error: any) {
      console.error('Error analyzing voice:', error);
      toast({
        title: "Errore durante l'analisi",
        description: error.message || "Si è verificato un errore durante l'analisi vocale",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      // Il processing viene gestito dal parent in caso di successo
      // Qui gestiamo solo il caso di errore
    }
  };

  // Alias per compatibilità con i controlli esistenti
  const analyzeRecording = () => analyzeBlob();

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setTranscription('');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Heart className="h-5 w-5 text-red-500" />
            <Brain className="h-5 w-5 text-primary" />
          </div>
          Analisi Emotiva Combinata
        </CardTitle>
        <CardDescription>
          Registra una nota vocale descrivendo il comportamento del tuo pet. L'IA analizzerà le emozioni di entrambi e fornirà consigli personalizzati.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Section */}
        <div className="text-center space-y-4">
          <div className="relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
              className={`w-32 h-32 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isRecording ? (
                <Square className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-mono">
              {formatTime(recordingTime)}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRecording 
                ? "Descrivi cosa sta facendo il tuo pet..." 
                : isAnalyzing
                  ? "Analisi in corso..."
                  : "Tocca per iniziare a registrare"
              }
            </p>
            {isAnalyzing && (
              <p className="text-xs text-primary font-medium">
                L'analisi si avvierà automaticamente al termine della registrazione
              </p>
            )}
          </div>
        </div>

        {/* Stato dell'analisi */}
        {isAnalyzing && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analizzando emozioni...</span>
            </div>
          </div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📝 Trascrizione:</h4>
            <p className="text-sm text-muted-foreground italic">
              "{transcription}"
            </p>
          </div>
        )}

        {!selectedPet && (
          <p className="text-sm text-muted-foreground text-center">
            Seleziona un pet per iniziare l'analisi
          </p>
        )}

        {/* Help Section */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h4 className="font-medium mb-3 text-foreground">🎯 Cosa Analizza</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              <span><strong>Emozione del pet:</strong> Dedotta dalle tue descrizioni comportamentali</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span><strong>La tua emozione:</strong> Rilevata dal tono di voce e scelta delle parole</span>
            </div>
            <p>• <strong>Correlazione emotiva:</strong> Come le tue emozioni influenzano quelle del pet</p>
          </div>
          
          <h4 className="font-medium mb-2 mt-4 text-foreground">💡 Consigli per il Miglior Risultato</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Parla naturalmente, senza forzare il tono di voce</p>
            <p>• Descrivi sia quello che vedi che quello che provi</p>
            <p>• Sii spontaneo: le emozioni autentiche danno risultati migliori</p>
            <p>• Registra 30-60 secondi per analisi complete</p>
            <p>• Includi il tuo stato d'animo attuale nella descrizione</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAnalysis;