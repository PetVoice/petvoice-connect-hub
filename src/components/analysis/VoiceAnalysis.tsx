import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Play, Pause, Loader2, Heart, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePets } from '@/contexts/PetContext';

interface VoiceAnalysisProps {
  onAnalysisComplete?: (analysisId: string) => void;
}

const VoiceAnalysis: React.FC<VoiceAnalysisProps> = ({ onAnalysisComplete }) => {
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
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer per il tempo di registrazione
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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

  const analyzeRecording = async () => {
    if (!recordedBlob) {
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      // Converti il blob in base64
      const arrayBuffer = await recordedBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binaryString);

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
    }
  };

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
    <Card className="h-full">
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
              className={`w-20 h-20 rounded-full ${
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
            
            {isRecording && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <Badge variant="destructive" className="animate-pulse">
                  {formatTime(recordingTime)}
                </Badge>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {isRecording 
              ? "Descrivi cosa sta facendo il tuo pet..." 
              : recordedBlob 
                ? "Registrazione completata"
                : "Tocca per iniziare a registrare"
            }
          </p>
        </div>

        {/* Recording Controls */}
        {recordedBlob && !isRecording && (
          <div className="space-y-3">
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={playRecording}
                disabled={isAnalyzing}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausa
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ascolta
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetRecording}
                disabled={isAnalyzing}
              >
                Elimina
              </Button>
            </div>

            <Button 
              onClick={analyzeRecording}
              disabled={isAnalyzing || !selectedPet}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analizzando emozioni...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analizza Emozioni (Pet + Proprietario)
                </>
              )}
            </Button>
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

        {/* Help */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">🎯 Cosa analizza l'IA:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span><strong>Emozione del pet</strong> - dalle tue descrizioni del comportamento</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span><strong>La tua emozione</strong> - dal tono di voce e dalle parole</span>
            </div>
            <div className="mt-2 text-xs">
              💡 <strong>Consigli personalizzati</strong> basati su entrambe le emozioni rilevate
            </div>
          </div>
        </div>

        {!selectedPet && (
          <p className="text-sm text-muted-foreground text-center">
            Seleziona un pet per iniziare l'analisi
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAnalysis;