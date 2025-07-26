import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Zap, 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye,
  Music,
  TrendingUp,
  Sparkles,
  RefreshCw,
  MapPin,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';


interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  location: string;
  description?: string;
}

interface BehaviorPrediction {
  behavior: string;
  probability: number;
  reasoning: string;
  recommendation: string;
}

interface MoodPlaylist {
  name: string;
  description: string;
  tracks: string[];
}

interface WeatherMoodPredictorProps {
  user: any;
  onWeatherUpdate?: (data: WeatherData) => void;
}

export const WeatherMoodPredictor = ({ user, onWeatherUpdate }: WeatherMoodPredictorProps) => {
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [predictions, setPredictions] = useState<BehaviorPrediction[]>([]);
  const [playlist, setPlaylist] = useState<MoodPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [hasLocation, setHasLocation] = useState(false);

  // Dati di fallback in caso di errore API
  const mockWeatherData: WeatherData = {
    condition: 'sunny',
    temperature: 22,
    humidity: 65,
    windSpeed: 8,
    pressure: 1013,
    uvIndex: 6,
    location: 'Simulato',
    description: 'Dati meteorologici simulati per la dimostrazione'
  };

  const mockPredictions: BehaviorPrediction[] = [
    {
      behavior: 'Comportamento normale',
      probability: 75,
      reasoning: 'Errore nel recupero dati meteo, utilizzo dati di fallback',
      recommendation: 'Verifica manualmente il comportamento del tuo animale'
    }
  ];

  const mockPlaylist: MoodPlaylist = {
    name: 'Playlist Generica',
    description: 'Musica rilassante per il tuo animale',
    tracks: ['Suoni della natura', 'Musica rilassante', 'Ambiente tranquillo']
  };

  useEffect(() => {
    getUserLocation();
  }, [user]);

  // Auto-refresh ogni 10 minuti
  useEffect(() => {
    if (!hasLocation) return;

    const interval = setInterval(() => {
      if (hasLocation) {
        getUserLocation();
      }
    }, 10 * 60 * 1000); // 10 minuti

    return () => clearInterval(interval);
  }, [hasLocation]);

  const getUserLocation = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Chiede la geolocalizzazione al browser
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      setHasLocation(true);
      setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      await fetchWeatherAndPrediction(latitude, longitude);
      
    } catch (error) {
      // Silently handle geolocation errors to prevent UI flickering
      setHasLocation(false);
      // Only show toast error if user explicitly tries to enable location
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minuti
        }
      );
    });
  };

  const fetchWeatherAndPrediction = async (latitude: number, longitude: number) => {
    setIsLoading(true);
    
    try {
      console.log('Fetching weather for coordinates:', { latitude, longitude });
      
      // Chiamata all'edge function per ottenere dati meteo reali
      const { data: weatherData, error } = await supabase.functions.invoke('get-weather', {
        body: { latitude, longitude }
      });

      if (error) {
        console.error('Error calling weather function:', error);
        throw new Error('Failed to fetch weather data');
      }

      if (!weatherData) {
        throw new Error('No weather data received');
      }

      console.log('Weather data received:', weatherData);
      
      setWeatherData(weatherData);
      setLocation(weatherData.location);
      
      // Genera previsioni comportamentali basate sul meteo reale
      const behaviorPredictions = generateBehaviorPredictions(weatherData);
      setPredictions(behaviorPredictions);
      
      // Genera playlist suggerita basata sul meteo reale
      const suggestedPlaylist = generatePlaylistSuggestion(weatherData);
      setPlaylist(suggestedPlaylist);
      
      // Notifica il parent component con i dati meteo
      onWeatherUpdate?.(weatherData);
      
      toast.success('Dati meteo aggiornati con successo');
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      
      // Fallback a dati simulati in caso di errore
      console.log('Using fallback mock data');
      setWeatherData(mockWeatherData);
      setPredictions(mockPredictions);
      setPlaylist(mockPlaylist);
      
      toast.error('Errore nel recupero dati meteo, utilizzo dati simulati');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBehaviorPredictions = (weather: WeatherData): BehaviorPrediction[] => {
    const predictions = [];
    
    // Previsioni basate sulla temperatura
    if (weather.temperature > 25) {
      predictions.push({
        behavior: 'Ricerca di ombra',
        probability: 85,
        reasoning: 'Temperature elevate possono causare stress termico negli animali',
        recommendation: 'Assicurati che il tuo animale abbia accesso a zone fresche'
      });
      
      predictions.push({
        behavior: 'Aumento della sete',
        probability: 90,
        reasoning: 'Il caldo intenso aumenta la necessità di idratazione',
        recommendation: 'Mantieni sempre a disposizione acqua fresca e pulita'
      });
    } else if (weather.temperature < 10) {
      predictions.push({
        behavior: 'Ricerca di calore',
        probability: 80,
        reasoning: 'Temperature basse spingono gli animali a cercare fonti di calore',
        recommendation: 'Fornisci un posto caldo e accogliente per il tuo animale'
      });
    }
    
    // Previsioni basate sulle condizioni meteo
    if (weather.condition === 'sunny') {
      predictions.push({
        behavior: 'Iperattività',
        probability: 75,
        reasoning: 'Le giornate soleggiate stimolano l\'energia e la voglia di giocare',
        recommendation: 'Pianifica attività all\'aperto per far sfogare l\'energia'
      });
    } else if (weather.condition === 'rainy') {
      predictions.push({
        behavior: 'Letargia',
        probability: 70,
        reasoning: 'I giorni piovosi tendono a ridurre l\'attività degli animali',
        recommendation: 'Organizza giochi e attività al chiuso per mantenerlo attivo'
      });
    } else if (weather.condition === 'stormy') {
      predictions.push({
        behavior: 'Ansia',
        probability: 85,
        reasoning: 'I temporali possono causare stress e paura negli animali',
        recommendation: 'Crea un ambiente sicuro e tranquillo lontano dai rumori'
      });
    }
    
    // Previsioni basate sulla pressione
    if (weather.pressure < 1000) {
      predictions.push({
        behavior: 'Irrequietezza',
        probability: 65,
        reasoning: 'La bassa pressione atmosferica può influenzare l\'umore degli animali',
        recommendation: 'Monitora attentamente il comportamento e offri rassicurazione'
      });
    }
    
    return predictions;
  };

  const generatePlaylistSuggestion = (weather: WeatherData): MoodPlaylist => {
    if (weather.condition === 'sunny') {
      return {
        name: 'Giornata di Sole',
        description: 'Musica energica per giornate soleggiate',
        tracks: [
          'Upbeat Nature Sounds',
          'Happy Dog Park',
          'Sunny Day Adventure',
          'Playful Afternoon',
          'Birds & Sunshine'
        ]
      };
    } else if (weather.condition === 'rainy') {
      return {
        name: 'Relax Piovoso',
        description: 'Suoni rilassanti per giorni di pioggia',
        tracks: [
          'Gentle Rain Sounds',
          'Cozy Indoor Vibes',
          'Peaceful Piano',
          'Calm & Cuddles',
          'Soft Classical'
        ]
      };
    } else if (weather.condition === 'stormy') {
      return {
        name: 'Calma la Tempesta',
        description: 'Musica rassicurante per temporali',
        tracks: [
          'Soothing Melodies',
          'Anti-Anxiety Music',
          'Peaceful Nature',
          'Comfort Sounds',
          'Calming Frequencies'
        ]
      };
    } else {
      return {
        name: 'Giornata Tranquilla',
        description: 'Musica equilibrata per giornate nuvolose',
        tracks: [
          'Balanced Rhythms',
          'Moderate Energy',
          'Cloudy Day Comfort',
          'Gentle Activities',
          'Neutral Vibes'
        ]
      };
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'stormy':
        return <Zap className="h-6 w-6 text-purple-500" />;
      case 'snowy':
        return <Cloud className="h-6 w-6 text-blue-300" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-red-100 text-red-800';
    if (probability >= 60) return 'bg-orange-100 text-orange-800';
    if (probability >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Se la geolocalizzazione non è disponibile, mostra un messaggio
  if (!hasLocation) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="flex items-center space-x-3 p-6">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-orange-800 font-medium">Geolocalizzazione non disponibile</p>
            <p className="text-orange-600 text-sm">
              Abilita la geolocalizzazione per ottenere previsioni meteo personalizzate
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getUserLocation}
              className="mt-2"
              disabled={isLoading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isLoading ? 'Caricamento...' : 'Attiva Geolocalizzazione'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Predittore Umore Meteorologico
          </CardTitle>
          <CardDescription>
            Analisi comportamentale basata sulle condizioni meteo in tempo reale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Analizzando le condizioni meteo...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Overview */}
      <Card className="bg-white border border-gray-200 shadow-soft hover:shadow-glow transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5 text-sky-600" />
            Predittore Umore Meteorologico
          </CardTitle>
          <CardDescription>
            Analisi comportamentale basata sulle condizioni meteo in tempo reale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {weatherData && getWeatherIcon(weatherData.condition)}
              </div>
              <div className="text-2xl font-bold">{weatherData?.temperature}°C</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </div>
              {weatherData?.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {weatherData.description}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Umidità</span>
                </div>
                <span className="text-sm font-medium">{weatherData?.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Pressione</span>
                </div>
                <span className="text-sm font-medium">{weatherData?.pressure} hPa</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Vento</span>
                </div>
                <span className="text-sm font-medium">{weatherData?.windSpeed} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Indice UV</span>
                </div>
                <span className="text-sm font-medium">{weatherData?.uvIndex}</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">
                  Aggiornamento automatico
                </div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  Dati in tempo reale
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Previsioni Comportamentali
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prediction.behavior}</h4>
                    <Badge className={getProbabilityColor(prediction.probability)}>
                      {prediction.probability}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {prediction.reasoning}
                  </p>
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <strong>Raccomandazione:</strong> {prediction.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};