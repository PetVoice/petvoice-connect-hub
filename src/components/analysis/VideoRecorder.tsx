import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Download,
  Camera,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob) => void;
  maxDuration?: number; // in seconds
  onStartRecording?: () => boolean;
  autoAnalyze?: boolean; // Nuovo prop per l'analisi automatica
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  duration: number;
  videoBlob?: Blob;
  videoUrl?: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
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
  const [currentTime, setCurrentTime] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup preview when recording starts
  useEffect(() => {
    if (recordingState.isRecording && streamRef.current && previewRef.current) {
      console.log('Setting up preview video element...');
      const video = previewRef.current;
      video.srcObject = streamRef.current;
      video.play().then(() => {
        console.log('Preview should be playing now');
      }).catch((err) => {
        console.error('Preview play failed:', err);
      });
    }
  }, [recordingState.isRecording]);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
    return () => {
      cleanup();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermission(permission.state as 'granted' | 'denied' | 'prompt');
    } catch (error) {
      console.warn('Unable to check camera permission:', error);
    }
  };

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recordingState.videoUrl) {
      URL.revokeObjectURL(recordingState.videoUrl);
    }
  }, [recordingState.videoUrl]);

  // Auto-analyze after recording completion
  useEffect(() => {
    if (autoAnalyze && recordingState.videoBlob && !recordingState.isRecording) {
      // Avvia automaticamente l'analisi dopo un breve delay per permettere il rendering
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoAnalyze, recordingState.videoBlob, recordingState.isRecording]);

  const startRecording = async () => {
    // Check if we should allow recording to start
    if (onStartRecording && !onStartRecording()) {
      return;
    }

    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: facingMode
        },
        audio: true
      });
      
      console.log('Camera access granted, stream:', stream);
      streamRef.current = stream;
      setPermission('granted');
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        setRecordingState(prev => ({
          ...prev,
          videoBlob,
          videoUrl,
          isRecording: false,
          isPaused: false
        }));

        // Stop preview
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
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
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Force state update to ensure UI reflects stopped recording
    setRecordingState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false
    }));
  };

  const playRecording = () => {
    if (!recordingState.videoUrl) return;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    if (videoRef.current) {
      videoRef.current.src = recordingState.videoUrl;
      videoRef.current.play();
    }
    
    setRecordingState(prev => ({ ...prev, isPlaying: true }));
    setCurrentTime(0);

    if (videoRef.current) {
      videoRef.current.ontimeupdate = () => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      };

      videoRef.current.onended = () => {
        setRecordingState(prev => ({ ...prev, isPlaying: false }));
        setCurrentTime(0);
      };
    }
  };

  const pausePlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setRecordingState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  const deleteRecording = () => {
    if (recordingState.videoUrl) {
      URL.revokeObjectURL(recordingState.videoUrl);
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current = null;
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
    if (recordingState.videoBlob) {
      onRecordingComplete(recordingState.videoBlob);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (recordingState.videoUrl) {
      const a = document.createElement('a');
      a.href = recordingState.videoUrl;
      a.download = `recording_${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const switchCamera = async () => {
    if (!recordingState.isRecording) return;
    
    try {
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Switch facing mode
      const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
      setFacingMode(newFacingMode);
      
      // Get new stream with switched camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode
        },
        audio: true
      });
      
      streamRef.current = newStream;
      
      // Update preview
      if (previewRef.current) {
        previewRef.current.srcObject = newStream;
        previewRef.current.play();
      }
      
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Registrazione Video
        </CardTitle>
        <CardDescription>
          Registra direttamente dalla camera (max {Math.floor(maxDuration / 60)} minuti)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission === 'denied' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4" />
            Accesso alla camera negato. Abilita i permessi nelle impostazioni del browser.
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center space-y-4">
          {/* Video Preview */}
          {recordingState.isRecording && (
            <div className="relative mx-auto w-64 h-48 bg-gray-200 rounded-lg overflow-hidden">
              <video
                ref={previewRef}
                className="w-full h-full object-cover bg-gray-400"
                muted
                autoPlay
                playsInline
                controls={false}
                style={{ backgroundColor: '#f0f0f0' }}
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                REC
              </div>
              {/* Switch Camera Button */}
              <div className="absolute bottom-2 right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={switchCamera}
                  className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="relative w-32 h-32 mx-auto">
            {/* Recording indicator ring */}
            {recordingState.isRecording && (
              <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-75 pointer-events-none" />
            )}
            
            {/* Camera Button */}
            <Button
              onClick={recordingState.isRecording ? stopRecording : startRecording}
              disabled={permission === 'denied'}
              className={cn(
                "relative z-10 w-32 h-32 rounded-full text-white transition-all duration-200",
                recordingState.isRecording
                  ? "bg-red-500 hover:bg-red-600 shadow-lg animate-pulse"
                  : "gradient-coral hover:scale-105 shadow-lg"
              )}
            >
              {recordingState.isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Camera className="h-8 w-8" />
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

        {/* Playback Controls */}
        {recordingState.videoBlob && !recordingState.isRecording && !autoAnalyze && (
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Registrazione completata</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(recordingState.duration)}
              </span>
            </div>

            {/* Video Player */}
            <div className="mx-auto w-64 h-48 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls={false}
                playsInline
              />
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
                className="gradient-coral text-white flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Analizza
              </Button>
            </div>
          </div>
        )}

        {/* Auto-analyze message */}
        {recordingState.videoBlob && !recordingState.isRecording && autoAnalyze && (
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

        {/* Analysis Description */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🎬 Analisi Video Avanzata con IA</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                La nostra IA analizza i video per rilevare comportamenti e stati emotivi attraverso:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>🎭 Analisi espressioni facciali</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>🏃 Movimento e postura</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>🎵 Audio sincronizzato</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>🧠 Riconoscimento patterns comportamentali</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                ⏱️ Tempo analisi: 20-45 secondi • 🎯 Accuratezza video: 90-98% • 📊 Combina audio + visuale
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoRecorder;