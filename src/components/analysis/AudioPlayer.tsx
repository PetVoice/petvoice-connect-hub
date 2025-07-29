import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Volume2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedToast } from '@/hooks/use-unified-toast';


interface AudioPlayerProps {
  storagePath: string;
  fileName: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ storagePath, fileName, className }) => {
  const language = 'it';
  
  // Simple translation function just for this component
  const getRecordingLabel = () => {
    return 'Registrazione';
  };
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showToast } = useUnifiedToast();

  // Load audio URL when component mounts
  useEffect(() => {
    loadAudio();
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [storagePath]);

  const loadAudio = async () => {
    if (!storagePath) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('pet-media')
        .download(storagePath);
      
      if (downloadError) {
        throw new Error(`Errore download: ${downloadError.message}`);
      }
      
      const url = URL.createObjectURL(data);
      setAudioUrl(url);
      
    } catch (err: any) {
      console.error('Error loading audio:', err);
      setError(err.message || 'Errore nel caricamento audio');
      showToast({
        title: "Errore",
        description: "Impossibile caricare il file audio",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup audio element when URL is available
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setError('Errore nella riproduzione audio');
        setIsPlaying(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const handlePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Error playing audio:', err);
        setError('Errore nella riproduzione');
      });
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current || !duration) return;
    
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`p-3 bg-destructive/10 border border-destructive/20 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Audio non disponibile</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-secondary/30 border rounded-lg space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Volume2 className="h-4 w-4" />
        <span>{getRecordingLabel()}: {fileName}</span>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Caricamento audio...
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={duration > 0 ? (currentTime / duration) * 100 : 0} 
              className="w-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                handleSeek([percentage]);
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
              disabled={!audioUrl}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pausa
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Play
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!audioUrl || (!isPlaying && currentTime === 0)}
              className="flex items-center gap-2"
            >
              <Square className="h-3 w-3" />
              Stop
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;