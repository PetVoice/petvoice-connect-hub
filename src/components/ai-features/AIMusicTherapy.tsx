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
    id: 'ansioso',
    category: 'Ansia e Stress',
    title: 'Calma Profonda - 528Hz',
    duration: 25,
    description: 'Frequenze specifiche per ridurre ansia e stress. Terapia per animali ansiosi',
    frequency: '528Hz + 8Hz',
    icon: Heart,
    color: 'bg-azure-500',
    benefits: ['Riduce ansia e stress', 'Abbassa frequenza cardiaca', 'Rilassamento muscolare', 'Equilibrio neurochimico']
  },
  {
    id: 'agitato',
    category: 'Iperattivazione',
    title: 'Relax Guidato - 10-13Hz',
    duration: 20,
    description: 'Sequenze per calmare iperattivazione e agitazione negli animali',
    frequency: '10-13Hz',
    icon: Waves,
    color: 'bg-azure-600',
    benefits: ['Calma iperattivazione', 'Riduce agitazione', 'Rilassamento graduale', 'Controllo impulsi']
  },
  {
    id: 'triste',
    category: 'Umore Basso',
    title: 'Energia Positiva - 40Hz',
    duration: 15,
    description: 'Stimolazione dolce per migliorare umore depresso e letargia',
    frequency: '40Hz + 10Hz',
    icon: Zap,
    color: 'bg-azure-700',
    benefits: ['Migliora umore', 'Aumenta energia', 'Stimola attività', 'Contrasta depressione']
  },
  {
    id: 'aggressivo',
    category: 'Controllo Comportamentale',
    title: 'Calma e Controllo - 432Hz',
    duration: 20,
    description: 'Frequenze per ridurre aggressività e comportamenti reattivi',
    frequency: '432Hz + 8Hz',
    icon: Shield,
    color: 'bg-azure-800',
    benefits: ['Riduce aggressività', 'Controllo emotivo', 'Calma reattività', 'Gestione impulsi']
  },
  {
    id: 'stressato',
    category: 'Stress Acuto',
    title: 'Anti-Stress - 528Hz',
    duration: 30,
    description: 'Terapia per stress cronico e tensione accumulata',
    frequency: '528Hz + 6Hz',
    icon: ShieldCheck,
    color: 'bg-azure-900',
    benefits: ['Riduce cortisolo', 'Rilascia tensioni', 'Equilibra sistema nervoso', 'Recupero post-stress']
  },
  {
    id: 'pauroso',
    category: 'Supporto Emotivo',
    title: 'Sicurezza Interiore - 111Hz',
    duration: 25,
    description: 'Frequenze protettive per animali paurosi e insicuri',
    frequency: '111Hz + 8Hz',
    icon: Moon,
    color: 'bg-azure-600',
    benefits: ['Aumenta sicurezza', 'Riduce paure', 'Stabilizza emozioni', 'Supporto psicologico']
  }
];

export const AIMusicTherapy: React.FC<AIMusicTherapyProps> = ({ selectedPet }) => {
  const [searchParams] = useSearchParams();
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
    
    console.log('🎵 Checking for playlist param:', playlistParam ? 'FOUND' : 'NOT FOUND');
    
    if (playlistParam) {
      console.log('🎵 Processing playlist from analysis...');
      try {
        // Parsing più robusto per evitare errori URI malformed
        let playlistData;
        try {
          playlistData = JSON.parse(decodeURIComponent(playlistParam));
        } catch (uriError) {
          // Fallback: prova senza decodeURIComponent
          playlistData = JSON.parse(playlistParam);
        }
        
        console.log('🎵 Playlist data:', playlistData);
        
        // Verifica se l'emozione è negativa (solo per emozioni negative mostriamo playlist)
        const negativeEmotions = ['ansioso', 'stressato', 'triste', 'aggressivo', 'agitato', 'pauroso', 'spaventato', 'depresso', 'nervoso', 'irritato', 'iperattivo'];
        const currentEmotion = playlistData.emotion?.toLowerCase() || '';
        const isNegativeEmotion = negativeEmotions.includes(currentEmotion);
        
        console.log(`🎵 Emozione rilevata: "${currentEmotion}", È negativa: ${isNegativeEmotion}`);
        
        if (!isNegativeEmotion) {
          console.log('🎵 Emozione positiva rilevata, nessuna playlist necessaria');
          toast({
            title: "✨ Stato Emotivo Positivo",
            description: `${selectedPet.name} sta bene! Nessuna musicoterapia necessaria.`,
          });
          setShowCategories(true);
          return;
        }
        
        // Crea una sessione temporanea dalla playlist raccomandata
        const recommendedSession: TherapySession = {
          id: 'analysis-recommendation',
          title: playlistData.name || 'Playlist dall\'Analisi',
          description: playlistData.description || 'Playlist personalizzata basata sull\'analisi emotiva',
          category: 'Raccomandazione AI',
          frequency: playlistData.frequency || '528Hz + 10Hz',
          duration: playlistData.duration || 15,
          icon: Sparkles,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          benefits: ['Raccomandazione personalizzata', 'Basata su analisi', 'Ottimizzata per il tuo pet']
        };
        
        console.log('🎵 Setting session and hiding categories...');
        setCurrentSession(recommendedSession);
        setShowCategories(false);
        
        toast({
          title: "🎵 Playlist dall'Analisi Caricata",
          description: `"${recommendedSession.title}" pronta per ${selectedPet.name}`,
        });
        
      } catch (error) {
        console.error('❌ Error parsing playlist data:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare la playlist dall'analisi",
          variant: "destructive"
        });
        setShowCategories(true);
      }
    } else {
      console.log('🎵 No playlist param, showing categories');
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
    
    // Fetch fresh emotional DNA before generating playlist
    await fetchEmotionalDNA();
    
    // Simula generazione AI personalizzata basata su DNA emotivo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const categorySession = THERAPY_CATEGORIES.find(c => c.id === category);
    console.log(`🎵 GENERAZIONE PLAYLIST per categoria: "${category}"`);
    console.log(`🎵 Sessione trovata:`, categorySession);
    
    if (categorySession) {
      // Personalizza la sessione basandosi sul DNA emotivo
      const personalizedSession = {
        ...categorySession,
        title: `${categorySession.title} per ${selectedPet.name}`,
        description: `Personalizzato per ${selectedPet.type.toLowerCase()} - Adattato al DNA emotivo (Calma: ${emotionalDNA.calma}%, Energia: ${emotionalDNA.energia}%, Focus: ${emotionalDNA.focus}%) - ${categorySession.description}`,
        // Modifica durata basata sul livello di energia del pet
        duration: categorySession.duration + Math.round((emotionalDNA.energia - 50) / 10) // ±5 min basato su energia
      };
      
      console.log(`🎵 Sessione personalizzata creata:`, personalizedSession);
      setCurrentSession(personalizedSession);
      
      toast({
        title: "Playlist AI Generata!",
        description: `Sessione "${categorySession.title}" personalizzata per ${selectedPet.name} basata sul suo DNA emotivo`,
      });
    } else {
      console.log(`🎵 ERRORE: Categoria "${category}" non trovata!`);
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

  const handleStop = () => {
    if (!currentSession) return;
    
    // Ferma tutto e porta a 0:00
    stopAudio();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setSessionProgress(0);
    
    toast({
      title: "Riproduzione fermata",
      description: "Sessione interrotta e portata a 0:00",
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
        description: "Seleziona prima una categoria di terapia musicale",
        variant: "destructive"
      });
      return;
    }

    console.log(`🎵 PLAY/PAUSE per sessione: "${currentSession.title}" (ID: ${currentSession.id})`);

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
      // Play - avvia audio IMMEDIATAMENTE con user gesture
      const startAudio = async () => {
        try {
          console.log('🎵 Avvio riproduzione audio...');
          
          // Ferma audio precedente se presente
          stopAudio();
          
          // Crea AudioContext immediatamente - CRUCIALE per funzionamento
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Resume context se sospeso (richiesto dai browser)
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('🎵 AudioContext resumed');
          }
          
          audioContextRef.current = audioContext;
        
        // Estrai frequenza dalla sessione con parsing migliorato
        const frequency = currentSession.frequency;
        let mainFreq = 220; // Frequenza carrier di base
        let beatFreq = 10;  // Frequenza binaural di default
        
        console.log(`🎵 Parsing frequenza: "${frequency}"`);
        
        if (frequency.includes('+')) {
          // Formato: "528Hz + 8Hz"
          const parts = frequency.split('+');
          let rawMainFreq = parseFloat(parts[0].replace('Hz', '').trim());
          beatFreq = parseFloat(parts[1].replace('Hz', '').trim());
          
          // CORREZIONE: Se la frequenza carrier è troppo bassa, renderla udibile
          if (rawMainFreq < 100) {
            // Frequenze sotto 100Hz: usa come carrier invece di beat per renderle udibili
            mainFreq = rawMainFreq + 200; // Sposta in gamma udibile (es: 40Hz → 240Hz)
            beatFreq = beatFreq; // Mantieni il beat originale
            console.log(`🎵 Frequenza bassa spostata in gamma udibile: carrier=${mainFreq}Hz (da ${rawMainFreq}Hz), beat=${beatFreq}Hz`);
          } else {
            mainFreq = rawMainFreq;
            console.log(`🎵 Formato + normale: carrier=${mainFreq}Hz, beat=${beatFreq}Hz`);
          }
        } else if (frequency.includes('-')) {
          // Formato: "10-13Hz" - usa la frequenza media come beat
          const range = frequency.replace('Hz', '').split('-');
          const min = parseFloat(range[0].trim());
          const max = parseFloat(range[1].trim());
          mainFreq = 220; // Frequenza carrier fissa per range bassi
          beatFreq = (min + max) / 2;
          console.log(`🎵 Formato range: carrier=${mainFreq}Hz, beat=${beatFreq}Hz (media di ${min}-${max})`);
        } else {
          // Formato: "40Hz" o "528Hz" - frequenza singola
          const singleFreq = parseFloat(frequency.replace('Hz', '').trim());
          if (singleFreq < 100) {
            // Frequenza bassa - usa come binaural beat
            mainFreq = 220;
            beatFreq = singleFreq;
            console.log(`🎵 Formato singolo basso: carrier=${mainFreq}Hz, beat=${beatFreq}Hz`);
          } else {
            // Frequenza alta - usa come carrier
            mainFreq = singleFreq;
            beatFreq = 8; // Beat di default
            console.log(`🎵 Formato singolo alto: carrier=${mainFreq}Hz, beat=${beatFreq}Hz`);
          }
        }
        
        // Crea oscillatori per binaural beats
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configura oscillatori
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.setValueAtTime(mainFreq, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(mainFreq + beatFreq, audioContext.currentTime);
        
        console.log(`🎵 Oscillatori configurati: OSC1=${mainFreq}Hz, OSC2=${mainFreq + beatFreq}Hz`);
        
        // Connetti tutto PRIMA di impostare il volume
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Salva riferimenti SUBITO per cleanup
        oscillatorsRef.current = [oscillator1, oscillator2];
        gainNodeRef.current = gainNode;
        
        // Imposta volume più alto per frequenze più difficili da sentire
        let targetVolume = volume[0] / 100 * 0.1;
        
        // Aumenta volume per frequenze basse che sono più difficili da percepire
        if (mainFreq < 150 || beatFreq < 20) {
          targetVolume = Math.min(targetVolume * 2, 0.3); // Raddoppia ma non oltre 0.3
          console.log(`🎵 Volume aumentato per frequenze basse: ${targetVolume}`);
        }
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 0.1);
        
        console.log(`🎵 Volume configurato: ${targetVolume} (slider: ${volume[0]}%)`);
        
        // Avvia oscillatori IMMEDIATAMENTE
        const startTime = audioContext.currentTime;
        oscillator1.start(startTime);
        oscillator2.start(startTime);
        
        console.log(`🎵 Oscillatori avviati per "${currentSession.title}" con frequenze ${mainFreq}Hz + ${beatFreq}Hz`);
        
        // Imposta stato immediatamente per feedback visivo
        setIsPlaying(true);
        
        toast({
          title: "🎵 Riproduzione avviata",
          description: `"${currentSession.title}" - ${mainFreq}Hz + ${beatFreq}Hz`,
        });
        
        // Avvia il timer della sessione
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 1;
            const progress = (newTime / (currentSession.duration * 60)) * 100;
            setSessionProgress(progress);
            
            // Fine sessione
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
                description: "La sessione di musicoterapia è terminata",
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
          description: "Impossibile avviare la riproduzione",
          variant: "destructive"
        });
      }
      };
      
      // Chiama la funzione async
      startAudio();
    }
  };

  const adaptMoodRealTime = async () => {
    if (!moodAdaptation) return;
    
    // Aggiorna il DNA emotivo con dati reali dal database
    await fetchEmotionalDNA();
    
    // Modifica le frequenze audio in base al nuovo mood
    if (audioContextRef.current && oscillatorsRef.current.length > 0 && currentSession) {
      // Chiudi gli oscillatori attuali
      stopAudio();
      
      // Riavvia con nuove frequenze adattate al mood corrente
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Calcola nuove frequenze basate sul DNA emotivo
      const baseFreq = parseFloat(currentSession.frequency.split('Hz')[0]);
      const adaptedFreq = baseFreq + (emotionalDNA.energia - 50) * 0.5; // Adatta freq in base all'energia
      const beatFreq = Math.max(5, Math.min(15, emotionalDNA.calma / 10)); // Beat freq basato su calma
      
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
      title: "Adattamento AI real-time",
      description: `Frequenze adattate: Calma ${emotionalDNA.calma}%, Energia ${emotionalDNA.energia}%, Focus ${emotionalDNA.focus}%`,
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
            <Music className="h-5 w-5" />
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
                  🎵 Riproduzione in corso...
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
                data-guide="play-button"
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
                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
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

      {/* Category Filter - Nascosto quando viene caricata una playlist dall'analisi */}
      {showCategories && (
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
                 <SelectItem value="ansioso">Ansia e Stress</SelectItem>
                 <SelectItem value="agitato">Iperattivazione</SelectItem>
                 <SelectItem value="triste">Umore Basso</SelectItem>
                 <SelectItem value="aggressivo">Controllo Comportamentale</SelectItem>
                 <SelectItem value="stressato">Stress Acuto</SelectItem>
                 <SelectItem value="pauroso">Supporto Emotivo</SelectItem>
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
          <div className="grid md:grid-cols-2 gap-4" data-guide="therapy-categories">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentSession?.id === session.id ? 'ring-2 ring-primary' : ''
                }`}
                 onClick={() => {
                   console.log(`🎵 CLICK su categoria: ${session.id} - ${session.category}`);
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
      )}

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