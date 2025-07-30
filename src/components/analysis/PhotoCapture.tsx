import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  RotateCcw, 
  Trash2, 
  Download,
  Image,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onPhotoComplete: (photoBlob: Blob) => void;
  onStartCapture?: () => boolean;
  autoAnalyze?: boolean; // Nuovo prop per l'analisi automatica
}

interface CaptureState {
  hasPhoto: boolean;
  photoBlob?: Blob;
  photoUrl?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  onPhotoComplete, 
  onStartCapture,
  autoAnalyze = false // Default false per retrocompatibilità
}) => {
  
  const [captureState, setCaptureState] = useState<CaptureState>({
    hasPhoto: false
  });
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Default camera posteriore

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check camera permission on mount
  useEffect(() => {
    checkCameraPermission();
    return () => {
      cleanup();
    };
  }, []);

  // Auto-analyze after photo capture
  useEffect(() => {
    if (autoAnalyze && captureState.photoBlob && captureState.hasPhoto) {
      // Avvia automaticamente l'analisi dopo un breve delay per permettere il rendering
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoAnalyze, captureState.photoBlob, captureState.hasPhoto]);

  const checkCameraPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermission(permission.state as 'granted' | 'denied' | 'prompt');
    } catch (error) {
      console.warn('Unable to check camera permission:', error);
    }
  };

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (captureState.photoUrl) {
      URL.revokeObjectURL(captureState.photoUrl);
    }
  }, [captureState.photoUrl]);

  const startCapture = async () => {
    // Check if we should allow capture to start
    if (onStartCapture && !onStartCapture()) {
      return;
    }

    try {
      setIsCapturing(true);
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: facingMode
        }
      });
      
      console.log('Camera access granted, stream:', stream);
      streamRef.current = stream;
      setPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('Camera preview started');
      }
      
    } catch (error) {
      console.error('Error starting camera:', error);
      setPermission('denied');
      setIsCapturing(false);
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (streamRef.current) {
      // Stop current stream
      streamRef.current.getTracks().forEach(track => track.stop());
      
      try {
        // Start new stream with different camera
        const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: newFacingMode
          }
        });
        
        streamRef.current = newStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Error switching camera:', error);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const photoUrl = URL.createObjectURL(blob);
        
        setCaptureState({
          hasPhoto: true,
          photoBlob: blob,
          photoUrl
        });

        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setIsCapturing(false);
      }
    }, 'image/jpeg', 0.95);
  };

  const deletePhoto = () => {
    if (captureState.photoUrl) {
      URL.revokeObjectURL(captureState.photoUrl);
    }
    
    setCaptureState({
      hasPhoto: false
    });
  };

  const handleAnalyze = () => {
    if (captureState.photoBlob) {
      onPhotoComplete(captureState.photoBlob);
      deletePhoto();
    }
  };

  const downloadPhoto = () => {
    if (captureState.photoUrl) {
      const a = document.createElement('a');
      a.href = captureState.photoUrl;
      a.download = `photo_${new Date().toISOString().slice(0, 19)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const retakePhoto = () => {
    deletePhoto();
    startCapture();
  };

  return (
    <Card className="h-full bg-gradient-to-br from-pink/5 to-pink/10 border border-pink/20 shadow-soft hover:shadow-glow transition-all duration-200 flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="h-5 w-5 text-pink-600" />
          Scatta Foto
        </CardTitle>
        <CardDescription>
          Scatta direttamente dalla camera (max 10 MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col">
        {permission === 'denied' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="h-4 w-4" />
            Accesso alla camera negato. Abilita i permessi nelle impostazioni del browser.
          </div>
        )}

        {/* Camera Controls */}
        <div className="text-center space-y-4">
          {/* Camera Preview */}
          {isCapturing && (
            <div className="relative mx-auto w-64 h-48 bg-gray-200 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover bg-gray-400"
                autoPlay
                playsInline
                muted
                style={{ backgroundColor: '#f0f0f0' }}
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                LIVE
              </div>
              {/* Switch Camera Button */}
              <Button
                onClick={switchCamera}
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2 bg-white/80 hover:bg-white/90"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Photo Preview */}
          {captureState.hasPhoto && captureState.photoUrl && (
            <div className="relative mx-auto w-64 h-48 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={captureState.photoUrl}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                CAPTURED
              </div>
            </div>
          )}

          <div className="relative w-32 h-32 mx-auto">
            {/* Camera Button */}
            <Button
              onClick={isCapturing ? capturePhoto : captureState.hasPhoto ? retakePhoto : startCapture}
              disabled={permission === 'denied'}
              variant="ghost"
              className={cn(
                "relative z-10 w-32 h-32 rounded-full text-white transition-all duration-200 !bg-pink-700 hover:!bg-pink-800 hover:scale-105 shadow-lg",
                isCapturing && "!bg-red-500 hover:!bg-red-600"
              )}
            >
              <Camera className="h-8 w-8" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-mono">
              {captureState.hasPhoto ? '1' : '0'}/1
            </p>
            <p className="text-sm text-muted-foreground">
              {isCapturing ? 'Clicca per scattare la foto' : 
               captureState.hasPhoto ? 'Foto catturata!' : 
               'Clicca per iniziare a scattare'}
            </p>
          </div>
        </div>

        {/* Photo Controls */}
        {captureState.hasPhoto && !autoAnalyze && (
          <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Foto catturata</span>
              <span className="text-sm text-muted-foreground">
                JPG
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Rifai
              </Button>

              <Button
                variant="outline"
                onClick={downloadPhoto}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="destructive"
                onClick={deletePhoto}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>

              <Button
                onClick={handleAnalyze}
                className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                Analizza
              </Button>
            </div>
          </div>
        )}

        {/* Auto-analyze message */}
        {captureState.hasPhoto && autoAnalyze && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                ✨ Foto catturata
              </span>
              <span className="text-sm text-green-700 dark:text-green-300">
                JPG
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              🚀 Avvio analisi automatica in corso...
            </p>
          </div>
        )}

        {/* Analysis Description */}
        <div className="bg-pink/5 p-4 rounded-lg border border-pink/20">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-pink-700 mb-2">📸 Analisi Foto Avanzata con IA</h4>
              <p className="text-sm text-muted-foreground mb-3">
                La nostra IA analizza le foto per rilevare emozioni e comportamenti attraverso:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>😊 Espressioni facciali</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🐕 Postura corporea</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👁️ Direzione dello sguardo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌟 Stato d'animo generale</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                ⏱️ Tempo analisi: 10-20 secondi • 🎯 Accuratezza: 85-95% • 📊 Computer Vision avanzata
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>
    </Card>
  );
};

export default PhotoCapture;