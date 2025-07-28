import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  Square,
  Volume2,
  Heart, 
  Brain,
  Moon,
  Zap,
  Focus,
  Waves,
  Headphones,
  Settings,
  Sparkles,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const AIMusicTherapy: React.FC<AIMusicTherapyProps> = ({ selectedPet }) => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Create therapy categories in Italian
  const THERAPY_CATEGORIES: TherapySession[] = [
    {
      id: 'ansioso',
      category: 'Ansia e Stress',
      title: 'Rilassamento Profondo',
      duration: 25,
      description: 'Frequenze calmanti per ridurre ansia e tensione nervosa',
      frequency: '528Hz + 8Hz',
      icon: Heart,
      color: 'bg-blue-500',
      benefits: ['Riduce il cortisolo', 'Calma il sistema nervoso', 'Migliora il sonno']
    },
    {
      id: 'agitato',
      category: 'Iperattivazione',
      title: 'Controllo Impulsi',
      duration: 20,
      description: 'Suoni per calmare comportamenti iperattivi',
      frequency: '10-13Hz',
      icon: Waves,
      color: 'bg-cyan-500',
      benefits: ['Riduce iperattività', 'Migliora focus', 'Calma agitazione']
    },
    {
      id: 'triste',
      category: 'Umore Basso',
      title: 'Sollevamento Emotivo',
      duration: 15,
      description: 'Frequenze energizzanti per migliorare l\'umore',
      frequency: '40Hz + 10Hz',
      icon: Zap,
      color: 'bg-yellow-500',
      benefits: ['Aumenta serotonina', 'Migliora energia', 'Riduce apatia']
    },
    {
      id: 'aggressivo',
      category: 'Controllo Aggressività',
      title: 'Pacificazione',
      duration: 20,
      description: 'Melodie calmanti per ridurre comportamenti aggressivi',
      frequency: '432Hz + 8Hz',
      icon: Shield,
      color: 'bg-red-500',
      benefits: ['Riduce aggressività', 'Migliora socializzazione', 'Calma tensioni']
    },
    {
      id: 'stressato',
      category: 'Stress Acuto',
      title: 'Rilassamento Intensivo',
      duration: 30,
      description: 'Terapia intensiva per stress elevato',
      frequency: '528Hz + 6Hz',
      icon: ShieldCheck,
      color: 'bg-purple-500',
      benefits: ['Riduce cortisolo', 'Rilassa muscoli', 'Stabilizza umore']
    },
    {
      id: 'pauroso',
      category: 'Supporto Emotivo',
      title: 'Sicurezza e Comfort',
      duration: 25,
      description: 'Suoni rassicuranti per animali paurosi',
      frequency: '111Hz + 8Hz',
      icon: Moon,
      color: 'bg-indigo-500',
      benefits: ['Riduce paura', 'Aumenta sicurezza', 'Calma tremori']
    }
  ];
  
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [moodAdaptation, setMoodAdaptation] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [emotionalDNA, setEmotionalDNA] = useState({ calma: 50, energia: 50, focus: 50 });
  const [sessionProgress, setSessionProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Gestisci playlist dalla dashboard con auto-start
  useEffect(() => {
    const playlistParam = searchParams.get('playlist');
    const autoStart = searchParams.get('autoStart') === 'true';
    
    if (playlistParam) {
      try {
        let playlistData;
        try {
          playlistData = JSON.parse(decodeURIComponent(playlistParam));
        } catch (uriError) {
          playlistData = JSON.parse(playlistParam);
        }
        
        // Verifica se l'emozione è negativa
        const negativeEmotions = ['ansioso', 'stressato', 'triste', 'aggressivo', 'agitato', 'pauroso', 'spaventato', 'depresso', 'nervoso', 'irritato', 'iperattivo'];
        const currentEmotion = playlistData.emotion?.toLowerCase() || '';
        const isNegativeEmotion = negativeEmotions.includes(currentEmotion);
        
        if (!isNegativeEmotion) {
          toast({
            title: "Emozione positiva rilevata",
            description: `${selectedPet.name} sembra già sereno! Puoi comunque scegliere una categoria per il benessere.`,
          });
          setShowCategories(true);
          return;
        }
        
        // Crea una sessione temporanea dalla playlist raccomandata
        const recommendedSession: TherapySession = {
          id: 'analysis-recommendation',
          title: playlistData.name || '🎵 Playlist Raccomandata',
          description: playlistData.description || 'Terapia personalizzata basata sull\'analisi',
          category: 'Raccomandazione AI',
          frequency: playlistData.frequency || '528Hz + 10Hz',
          duration: playlistData.duration || 15,
          icon: Sparkles,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          benefits: ['Raccomandazione personalizzata', 'Basata su analisi', 'Ottimizzata per il tuo pet']
        };
        
        setCurrentSession(recommendedSession);
        setShowCategories(false);
        
        toast({
          title: '🎵 Playlist generata dall\'analisi',
          description: `"${recommendedSession.title}" è pronta per ${selectedPet.name}`,
        });
        
      } catch (error) {
        console.error('Errore nel parsing della playlist:', error);
        toast({
          title: "Errore nel caricamento playlist",
          description: "Impossibile caricare la playlist dall'analisi",
          variant: "destructive"
        });
        setShowCategories(true);
      }
    } else {
      setShowCategories(true);
    }
  }, [searchParams, selectedPet.name]);

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
        let calmaTotal = 0, energiaTotal = 0, focusTotal = 0;
        let calmaCount = 0, energiaCount = 0, focusCount = 0;

        analyses.forEach(analysis => {
          const emotion = analysis.primary_emotion?.toLowerCase();
          const confidence = analysis.primary_confidence || 0;

          switch (emotion) {
            case 'felice':
            case 'calmo':
            case 'rilassato':
            case 'triste':
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

  const generatePersonalizedPlaylist = async (category: string) => {
    setIsGenerating(true);
    setCurrentTime(0);
    setSessionProgress(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    
    await fetchEmotionalDNA();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const categorySession = THERAPY_CATEGORIES.find(c => c.id === category);
    
    if (categorySession) {
      const personalizedSession = {
        ...categorySession,
        title: `${categorySession.title} per ${selectedPet.name}`,
        description: `${categorySession.description}`,
        duration: categorySession.duration + Math.round((emotionalDNA.energia - 50) / 10)
      };
      
      setCurrentSession(personalizedSession);
      
      toast({
        title: "Playlist generata",
        description: `"${categorySession.title}" è pronta per ${selectedPet.name}`,
      });
    }
    
    setIsGenerating(false);
  };

  const stopAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Ignora errori se già fermato
      }
    });
    oscillatorsRef.current = [];
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleStop = () => {
    if (!currentSession) return;
    
    stopAudio();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setSessionProgress(0);
    
    toast({
      title: "Riproduzione interrotta",
      description: "Sessione terminata",
    });
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSession) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.floor(percentage * currentSession.duration * 60);
    
    setCurrentTime(newTime);
    setSessionProgress(percentage * 100);
    
    toast({
      title: "Posizione aggiornata",
      description: `Spostato a ${formatTime(newTime)}`,
    });
  };

  const handlePlayPause = () => {
    if (!currentSession) {
      toast({
        title: "Nessuna sessione selezionata",
        description: "Scegli prima una categoria",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      stopAudio();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      toast({
        title: "In pausa",
        description: "Riproduzione messa in pausa",
      });
    } else {
      const startAudio = async () => {
        try {
          stopAudio();
          
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          audioContextRef.current = audioContext;
        
          const frequency = currentSession.frequency;
          let mainFreq = 220;
          let beatFreq = 10;
          
          if (frequency.includes('+')) {
            const parts = frequency.split('+');
            let rawMainFreq = parseFloat(parts[0].replace('Hz', '').trim());
            beatFreq = parseFloat(parts[1].replace('Hz', '').trim());
            
            if (rawMainFreq < 100) {
              mainFreq = rawMainFreq + 200;
              beatFreq = beatFreq;
            } else {
              mainFreq = rawMainFreq;
            }
          } else if (frequency.includes('-')) {
            const range = frequency.replace('Hz', '').split('-');
            const min = parseFloat(range[0].trim());
            const max = parseFloat(range[1].trim());
            mainFreq = 220;
            beatFreq = (min + max) / 2;
          } else {
            const singleFreq = parseFloat(frequency.replace('Hz', '').trim());
            if (singleFreq < 100) {
              mainFreq = 220;
              beatFreq = singleFreq;
            } else {
              mainFreq = singleFreq;
              beatFreq = 8;
            }
          }
          
          const oscillator1 = audioContext.createOscillator();
          const oscillator2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator1.type = 'sine';
          oscillator2.type = 'sine';
          oscillator1.frequency.setValueAtTime(mainFreq, audioContext.currentTime);
          oscillator2.frequency.setValueAtTime(mainFreq + beatFreq, audioContext.currentTime);
          
          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillatorsRef.current = [oscillator1, oscillator2];
          gainNodeRef.current = gainNode;
          
          let targetVolume = volume[0] / 100 * 0.1;
          
          if (mainFreq < 150 || beatFreq < 20) {
            targetVolume = Math.min(targetVolume * 2, 0.3);
          }
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 0.1);
          
          const startTime = audioContext.currentTime;
          oscillator1.start(startTime);
          oscillator2.start(startTime);
          
          setIsPlaying(true);
          
          toast({
            title: "Riproduzione avviata",
            description: `"${currentSession.title}" - ${mainFreq}Hz + ${beatFreq}Hz`,
          });
          
          intervalRef.current = setInterval(() => {
            setCurrentTime(prev => {
              const newTime = prev + 1;
              const progress = (newTime / (currentSession.duration * 60)) * 100;
              setSessionProgress(progress);
              
              if (newTime >= currentSession.duration * 60) {
                stopAudio();
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                setIsPlaying(false);
                setCurrentTime(0);
                setSessionProgress(0);
                toast({
                  title: "Sessione completata",
                  description: "La terapia musicale è terminata",
                });
                return 0;
              }
              return newTime;
            });
          }, 1000);
          
        } catch (error) {
          console.error('Errore durante avvio audio:', error);
          setIsPlaying(false);
          toast({
            title: "Errore audio",
            description: "Impossibile avviare l'audio",
            variant: "destructive"
          });
        }
      };
      
      startAudio();
    }
  };

  const adaptMoodRealTime = async () => {
    if (!moodAdaptation) return;
    
    await fetchEmotionalDNA();
    
    if (audioContextRef.current && oscillatorsRef.current.length > 0 && currentSession) {
      stopAudio();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const baseFreq = parseFloat(currentSession.frequency.split('Hz')[0]);
      const adaptedFreq = baseFreq + (emotionalDNA.energia - 50) * 0.5;
      const beatFreq = Math.max(5, Math.min(15, emotionalDNA.calma / 10));
      
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      oscillator1.frequency.setValueAtTime(adaptedFreq, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(adaptedFreq + beatFreq, audioContext.currentTime);
      
      const vol = (volume[0] / 100) * 0.1;
      gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      
      oscillatorsRef.current = [oscillator1, oscillator2];
    }
    
    toast({
      title: "Adattamento in tempo reale",
      description: `Frequenze adattate: Calma ${emotionalDNA.calma}%, Energia ${emotionalDNA.energia}%, Focus ${emotionalDNA.focus}%`,
    });
  };

  const handleSkip = (direction: 'forward' | 'back') => {
    if (!currentSession) return;
    
    const skipAmount = 30;
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
      {/* Current Session Player */}
      {currentSession && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
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
              <div 
                className="cursor-pointer"
                onClick={handleProgressClick}
              >
                <Progress 
                  value={sessionProgress} 
                  className="h-2"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentSession.duration * 60)}</span>
              </div>
              {isPlaying && (
                <div className="text-center text-xs text-primary animate-pulse">
                  In riproduzione...
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
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
                variant="destructive"
                size="icon"
                onClick={handleStop}
                disabled={!currentSession || isGenerating}
              >
                <Square className="h-4 w-4" />
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

            {/* Benefits */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Benefici della Sessione</p>
              <div className="flex flex-wrap gap-2">
                {currentSession.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      {showCategories && (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Categorie Terapeutiche</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Tutte le categorie</SelectItem>
                 <SelectItem value="ansioso">Ansia e Stress</SelectItem>
                 <SelectItem value="agitato">Iperattivazione</SelectItem>
                 <SelectItem value="triste">Umore Basso</SelectItem>
                 <SelectItem value="aggressivo">Controllo Aggressività</SelectItem>
                 <SelectItem value="stressato">Stress Acuto</SelectItem>
                 <SelectItem value="pauroso">Supporto Emotivo</SelectItem>
               </SelectContent>
            </Select>
            {moodAdaptation && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Adattamento in tempo reale
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all hover:shadow-md bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-800 ${
                  currentSession?.id === session.id ? 'ring-2 ring-primary' : ''
                }`}
                 onClick={() => {
                   generatePersonalizedPlaylist(session.id);
                 }}
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
                          Generazione playlist...
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
      )}

      {/* AI Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
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
                  Adattamento attivo
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Impostazioni Avanzate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Adattamento in tempo reale</span>
                <p className="text-xs text-muted-foreground">
                  Modifica automaticamente le frequenze basandosi sul comportamento
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