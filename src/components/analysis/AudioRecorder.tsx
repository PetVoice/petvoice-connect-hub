import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Download,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // in seconds
  onStartRecording?: () => boolean;
  autoAnalyze?: boolean; // Nuovo prop per l'analisi automatica
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  duration: number;
  audioBlob?: Blob;
  audioUrl?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  maxDuration = 300, // 5 minutes default
  onStartRecording,
  autoAnalyze = false // Default false per retrocompatibilità
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    isPlaying: false,
    duration: 0
  });
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      cleanup();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermission(permission.state as 'granted' | 'denied' | 'prompt');
    } catch (error) {
      console.warn('Unable to check microphone permission:', error);
    }
  };

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (recordingState.audioUrl) {
      URL.revokeObjectURL(recordingState.audioUrl);
    }
  }, [recordingState.audioUrl]);

  // Auto-analyze after recording completion
  useEffect(() => {
    if (autoAnalyze && recordingState.audioBlob && !recordingState.isRecording) {
      // Avvia automaticamente l'analisi dopo un breve delay per permettere il rendering
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoAnalyze, recordingState.audioBlob, recordingState.isRecording]);

  const setupAudioContext = async (stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);
    
    visualizeAudio();
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevels = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Convert to levels for visualization
      const levels = [];
      const step = Math.floor(bufferLength / 20);
      
      for (let i = 0; i < 20; i++) {
        const start = i * step;
        const end = start + step;
        const average = dataArray.slice(start, end).reduce((sum, value) => sum + value, 0) / step;
        levels.push(Math.min(100, (average / 255) * 100));
      }
      
      setAudioLevels(levels);
      
      if (recordingState.isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      }
    };

    updateLevels();
  };

  const startRecording = async () => {
    // Check if we should allow recording to start
    if (onStartRecording && !onStartRecording()) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      setPermission('granted');
      
      await setupAudioContext(stream);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordingState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
          isPaused: false
        }));
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0
      }));
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingState(prev => {
          const newDuration = prev.duration + 1;
          
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          
          return { ...prev, duration: newDuration };
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setPermission('denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevels(new Array(20).fill(0));
    
    // Force state update to ensure UI reflects stopped recording
    setRecordingState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false
    }));
  };

  const playRecording = () => {
    if (!recordingState.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = new Audio(recordingState.audioUrl);
    audioRef.current.play();
    
    setRecordingState(prev => ({ ...prev, isPlaying: true }));
    setCurrentTime(0);

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    audioRef.current.onended = () => {
      setRecordingState(prev => ({ ...prev, isPlaying: false }));
      setCurrentTime(0);
    };
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setRecordingState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const deleteRecording = () => {
    if (recordingState.audioUrl) {
      URL.revokeObjectURL(recordingState.audioUrl);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setRecordingState({
      isRecording: false,
      isPaused: false,
      isPlaying: false,
      duration: 0
    });
    setCurrentTime(0);
  };

  const handleAnalyze = () => {
    if (recordingState.audioBlob) {
      onRecordingComplete(recordingState.audioBlob);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (recordingState.audioUrl) {
      const a = document.createElement('a');
      a.href = recordingState.audioUrl;
      a.download = `recording_${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-green-500" />
          Registrazione Diretta
        </CardTitle>
        <CardDescription>
          Registra direttamente dal microfono (max {Math.floor(maxDuration / 60)} minuti)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission === 'denied' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4" />
            Accesso al microfono negato. Abilita i permessi nelle impostazioni del browser.
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            {/* Recording indicator ring */}
            {recordingState.isRecording && (
              <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-75 pointer-events-none" />
            )}
            
            {/* Microphone Button */}
            <Button
              onClick={recordingState.isRecording ? stopRecording : startRecording}
              disabled={permission === 'denied'}
              className={cn(
                "relative z-10 w-32 h-32 rounded-full text-white transition-all duration-200",
                recordingState.isRecording
                  ? "bg-red-500 hover:bg-red-600 shadow-lg animate-pulse"
                  : "bg-green-500 hover:bg-green-600 hover:scale-105 shadow-lg"
              )}
            >
              {recordingState.isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-mono">
              {formatTime(recordingState.duration)}
            </p>
            <p className="text-sm text-muted-foreground">
              {recordingState.isRecording ? 'Registrazione in corso...' : 'Clicca per iniziare'}
            </p>
          </div>

          {/* Progress bar for max duration */}
          {recordingState.isRecording && (
            <Progress 
              value={(recordingState.duration / maxDuration) * 100} 
              className="w-full"
            />
          )}
        </div>

        {/* Audio Visualizer */}
        {recordingState.isRecording && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Livelli Audio</p>
            <div className="flex items-end justify-center gap-1 h-16">
              {audioLevels.map((level, index) => (
                <div
                  key={index}
                  className="bg-green-500 rounded-sm transition-all duration-100"
                  style={{
                    width: '8px',
                    height: `${Math.max(4, (level / 100) * 60)}px`,
                    opacity: level > 0 ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Playback Controls */}
        {recordingState.audioBlob && !recordingState.isRecording && !autoAnalyze && (
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Registrazione completata</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(recordingState.duration)}
              </span>
            </div>

            {/* Playback progress */}
            <div className="space-y-2">
              <Progress 
                value={recordingState.duration > 0 ? (currentTime / recordingState.duration) * 100 : 0} 
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(recordingState.duration)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={recordingState.isPlaying ? pausePlayback : playRecording}
                className="flex items-center gap-2"
              >
                {recordingState.isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausa
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Riproduci
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={downloadRecording}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="destructive"
                onClick={deleteRecording}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>

              <Button
                onClick={handleAnalyze}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Analizza
              </Button>
            </div>
          </div>
        )}

        {/* Auto-analyze message */}
        {recordingState.audioBlob && !recordingState.isRecording && autoAnalyze && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                ✨ Registrazione completata
              </span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {formatTime(recordingState.duration)}
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              🚀 Avvio analisi automatica in corso...
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">🎤 Suggerimenti per la Registrazione</h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <p>• Registra in un ambiente silenzioso</p>
            <p>• Posizionati vicino al tuo pet</p>
            <p>• Durata consigliata: 10-60 secondi</p>
            <p>• Massimo {Math.floor(maxDuration / 60)} minuti di registrazione</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;