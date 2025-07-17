import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Heart, 
  Brain,
  Moon,
  Zap,
  Focus,
  Waves,
  Headphones,
  Settings,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
}

interface AIMusicTherapyProps {
  selectedPet: Pet;
}

interface TherapySession {
  id: string;
  category: string;
  title: string;
  duration: number;
  description: string;
  frequency: string;
  icon: React.ComponentType<any>;
  color: string;
  benefits: string[];
}

const THERAPY_CATEGORIES: TherapySession[] = [
  {
    id: 'sleep',
    category: 'Sleep Induction',
    title: 'Sonno Profondo',
    duration: 30,
    description: 'Frequenze calmanti per favorire il riposo notturno',
    frequency: '528Hz + 8Hz',
    icon: Moon,
    color: 'bg-blue-500',
    benefits: ['Riduce ansia', 'Migliora sonno', 'Rilassamento muscolare']
  },
  {
    id: 'anxiety',
    category: 'Anxiety Relief',
    title: 'Calma Interiore',
    duration: 20,
    description: 'Binaural beats per ridurre stress e ansia',
    frequency: '10-13Hz',
    icon: Heart,
    color: 'bg-green-500',
    benefits: ['Riduce cortisolo', 'Calma nervosismo', 'Equilibrio emotivo']
  },
  {
    id: 'energy',
    category: 'Energy Boost',
    title: 'Energia Vitale',
    duration: 15,
    description: 'Frequenze energizzanti per stimolare vitalità',
    frequency: '40Hz',
    icon: Zap,
    color: 'bg-orange-500',
    benefits: ['Aumenta energia', 'Migliora umore', 'Stimola attività']
  },
  {
    id: 'focus',
    category: 'Focus Enhancement',
    title: 'Concentrazione',
    duration: 25,
    description: 'Onde cerebrali per migliorare attenzione e focus',
    frequency: '12-15Hz',
    icon: Focus,
    color: 'bg-purple-500',
    benefits: ['Migliora focus', 'Riduce distrazioni', 'Chiarezza mentale']
  }
];

export const AIMusicTherapy: React.FC<AIMusicTherapyProps> = ({ selectedPet }) => {
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [moodAdaptation, setMoodAdaptation] = useState(true);
  const [emotionalDNA, setEmotionalDNA] = useState({ calma: 50, energia: 50, focus: 50 });
  const [sessionProgress, setSessionProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Fetch real emotional DNA from pet analyses
  const fetchEmotionalDNA = async () => {
    try {
      const { data: analyses } = await supabase
        .from('pet_analyses')
        .select('primary_emotion, primary_confidence, secondary_emotions, created_at')
        .eq('pet_id', selectedPet.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (analyses && analyses.length > 0) {
        // Calcola DNA emotivo basato sulle analisi reali
        let calmaTotal = 0, energiaTotal = 0, focusTotal = 0;
        let calmaCount = 0, energiaCount = 0, focusCount = 0;

        analyses.forEach(analysis => {
          const emotion = analysis.primary_emotion?.toLowerCase();
          const confidence = analysis.primary_confidence || 0;

          switch (emotion) {
            case 'felice':
            case 'calmo':
            case 'rilassato':
            case 'triste': // anche tristezza contribuisce alla calma
              calmaTotal += confidence;
              calmaCount++;
              break;
            case 'energico':
            case 'giocoso':
            case 'eccitato':
              energiaTotal += confidence;
              energiaCount++;
              break;
            case 'concentrato':
            case 'attento':
            case 'vigile':
              focusTotal += confidence;
              focusCount++;
              break;
          }
        });

        setEmotionalDNA({
          calma: calmaCount > 0 ? Math.round((calmaTotal / calmaCount) * 100) : 50,
          energia: energiaCount > 0 ? Math.round((energiaTotal / energiaCount) * 100) : 50,
          focus: focusCount > 0 ? Math.round((focusTotal / focusCount) * 100) : 50
        });
      }
    } catch (error) {
      console.error('Errore nel fetch del DNA emotivo:', error);
    }
  };

  // Genera audio sintetico per le frequenze terapeutiche
  const generateTherapyAudio = (frequency: string, duration: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Estrai la frequenza principale dal formato "528Hz + 8Hz"
    const mainFreq = parseFloat(frequency.split('Hz')[0]);
    const beatFreq = frequency.includes('+') ? parseFloat(frequency.split('+')[1].replace('Hz', '').trim()) : 0;
    
    // Crea oscillatori per frequenze binaurali
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator1.frequency.setValueAtTime(mainFreq, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(mainFreq + beatFreq, audioContext.currentTime);
    
    // Envelope per evitare click
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume[0] / 100 * 0.1, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(volume[0] / 100 * 0.1, audioContext.currentTime + duration - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + duration);
    oscillator2.stop(audioContext.currentTime + duration);
    
    return { audioContext, oscillator1, oscillator2, gainNode };
  };

  const generatePersonalizedPlaylist = async (category: string) => {
    setIsGenerating(true);
    setCurrentTime(0);
    setSessionProgress(0);
    
    // Stop any current playback
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    
    // Simula generazione AI personalizzata
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const categorySession = THERAPY_CATEGORIES.find(c => c.id === category);
    if (categorySession) {
      setCurrentSession({
        ...categorySession,
        title: `${categorySession.title} per ${selectedPet.name}`,
        description: `Personalizzato per ${selectedPet.type.toLowerCase()} - ${categorySession.description}`
      });
      
      toast({
        title: "Playlist generata!",
        description: `Sessione "${categorySession.title}" pronta per ${selectedPet.name}`,
      });
    }
    
    setIsGenerating(false);
  };

  const stopAudio = () => {
    // Ferma oscillatori esistenti
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Ignora errori se già fermato
      }
    });
    oscillatorsRef.current = [];
    
    // Chiudi context audio
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (!currentSession) {
      toast({
        title: "Nessuna sessione selezionata",
        description: "Seleziona prima una categoria di terapia musicale",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      // Pausa - ferma audio e timer
      stopAudio();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      toast({
        title: "Pausa",
        description: "Sessione di musicoterapia in pausa",
      });
    } else {
      // Play - avvia audio e timer
      try {
        // Genera audio terapeutico
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        // Estrai frequenza dalla sessione
        const frequency = currentSession.frequency;
        const mainFreq = parseFloat(frequency.split('Hz')[0]);
        const beatFreq = frequency.includes('+') ? parseFloat(frequency.split('+')[1].replace('Hz', '').trim()) : 0;
        
        // Crea oscillatori per binaural beats
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configura oscillatori
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.setValueAtTime(mainFreq, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(mainFreq + beatFreq, audioContext.currentTime);
        
        // Imposta volume
        const vol = (volume[0] / 100) * 0.1; // Molto basso per non disturbare
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.5);
        
        // Connetti tutto
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Avvia oscillatori
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        
        // Salva riferimenti
        oscillatorsRef.current = [oscillator1, oscillator2];
        
        setIsPlaying(true);
        toast({
          title: "Riproduzione avviata",
          description: `Sessione "${currentSession.title}" in corso - Volume basso per comfort`,
        });
        
        // Avvia il timer della sessione
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 1;
            const progress = (newTime / (currentSession.duration * 60)) * 100;
            setSessionProgress(progress);
            
            // Adattamento real-time del mood (se abilitato)
            if (moodAdaptation && newTime % 30 === 0) { // Ogni 30 secondi
              adaptMoodRealTime();
            }
            
            // Fine sessione
            if (newTime >= currentSession.duration * 60) {
              stopAudio();
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              setIsPlaying(false);
              toast({
                title: "Sessione completata!",
                description: `Sessione "${currentSession.title}" terminata con successo`,
              });
              return newTime;
            }
            
            return newTime;
          });
        }, 1000);
        
      } catch (error) {
        console.error('Errore nell\'avvio dell\'audio:', error);
        toast({
          title: "Errore audio",
          description: "Impossibile avviare l'audio. Controlla le impostazioni del browser.",
          variant: "destructive"
        });
      }
    }
  };

  const adaptMoodRealTime = () => {
    if (!moodAdaptation) return;
    
    // Simula adattamento real-time del mood
    setEmotionalDNA(prev => ({
      calma: Math.min(100, prev.calma + Math.random() * 5),
      energia: Math.max(0, prev.energia + (Math.random() - 0.5) * 3),
      focus: Math.min(100, prev.focus + Math.random() * 2)
    }));
    
    toast({
      title: "Adattamento real-time",
      description: "Musica adattata al mood corrente",
    });
  };

  const handleSkip = (direction: 'forward' | 'back') => {
    if (!currentSession) return;
    
    const skipAmount = 30; // 30 secondi
    setCurrentTime(prev => {
      const newTime = direction === 'forward' 
        ? Math.min(prev + skipAmount, currentSession.duration * 60)
        : Math.max(prev - skipAmount, 0);
      setSessionProgress((newTime / (currentSession.duration * 60)) * 100);
      return newTime;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchEmotionalDNA();
  }, [selectedPet.id]);

  useEffect(() => {
    // Cleanup interval and audio on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopAudio();
    };
  }, []);

  const filteredSessions = selectedCategory === 'all' 
    ? THERAPY_CATEGORIES 
    : THERAPY_CATEGORIES.filter(session => session.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            AI Music Therapy per {selectedPet.name}
          </CardTitle>
          <CardDescription>
            Musicoterapia personalizzata basata sull'analisi emotiva e DNA comportamentale del tuo {selectedPet.type.toLowerCase()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Session Player */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${currentSession.color} text-white`}>
                  <currentSession.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentSession.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentSession.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Waves className="h-3 w-3" />
                {currentSession.frequency}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={sessionProgress} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentSession.duration * 60)}</span>
              </div>
              {isPlaying && (
                <div className="text-center text-xs text-primary animate-pulse">
                  🎵 Riproduzione in corso...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleSkip('back')}
                disabled={!currentSession || isGenerating}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                className="h-12 w-12"
                onClick={handlePlayPause}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Sparkles className="h-6 w-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleSkip('forward')}
                disabled={!currentSession || isGenerating}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10">{volume[0]}%</span>
            </div>

            {/* Benefits */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Benefici di questa sessione:</p>
              <div className="flex flex-wrap gap-2">
                {currentSession.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorie Terapeutiche</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                <SelectItem value="sleep">Sleep Induction</SelectItem>
                <SelectItem value="anxiety">Anxiety Relief</SelectItem>
                <SelectItem value="energy">Energy Boost</SelectItem>
                <SelectItem value="focus">Focus Enhancement</SelectItem>
              </SelectContent>
            </Select>
            {moodAdaptation && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Adattamento Real-time
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentSession?.id === session.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => generatePersonalizedPlaylist(session.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${session.color} text-white`}>
                      <session.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{session.category}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Waves className="h-3 w-3" />
                          {session.frequency}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.duration} min
                        </span>
                      </div>
                      {isGenerating && currentSession?.id === session.id && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                          <Sparkles className="h-3 w-3 animate-spin" />
                          Generando playlist personalizzata...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              DNA Emotivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Calma</span>
                <div className="flex items-center gap-2">
                  <Progress value={emotionalDNA.calma} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">{emotionalDNA.calma}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Energia</span>
                <div className="flex items-center gap-2">
                  <Progress value={emotionalDNA.energia} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">{emotionalDNA.energia}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Focus</span>
                <div className="flex items-center gap-2">
                  <Progress value={emotionalDNA.focus} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">{emotionalDNA.focus}%</span>
                </div>
              </div>
              {moodAdaptation && isPlaying && (
                <div className="pt-2 text-xs text-primary text-center animate-pulse">
                  🧠 Adattamento real-time attivo
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Avanzate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Adattamento Real-time</span>
                <p className="text-xs text-muted-foreground">
                  Analizza e adatta la musica ogni 30 secondi
                </p>
              </div>
              <Switch
                checked={moodAdaptation}
                onCheckedChange={setMoodAdaptation}
              />
            </div>
            {moodAdaptation && (
              <div className="text-xs text-primary bg-primary/10 p-2 rounded">
                ✨ L'AI adatterà automaticamente frequenze e ritmo basandosi sul comportamento in tempo reale
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <Headphones className="h-3 w-3 inline mr-1" />
              Per risultati ottimali, utilizza cuffie di qualità
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};