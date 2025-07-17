import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Cloud, Sun, CloudRain, Music, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  pressure: number;
  description: string;
}

interface MoodPrediction {
  predicted_mood: string;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface PlaylistSuggestion {
  name: string;
  description: string;
  tracks: string[];
  mood_alignment: number;
}

export const WeatherMoodPredictor = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [moodPrediction, setMoodPrediction] = useState<MoodPrediction | null>(null);
  const [playlistSuggestions, setPlaylistSuggestions] = useState<PlaylistSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>('');

  // Simulated weather data
  const mockWeatherData: WeatherData = {
    condition: 'sunny',
    temperature: 22,
    humidity: 65,
    pressure: 1013,
    description: 'Giornata soleggiata e piacevole'
  };

  // Simulated mood prediction
  const mockMoodPrediction: MoodPrediction = {
    predicted_mood: 'energico',
    confidence: 0.87,
    factors: ['Temperatura ideale', 'Buona luminosità', 'Bassa umidità', 'Pressione stabile'],
    recommendations: [
      'Perfetto per attività all\'aperto',
      'Ideale per giochi interattivi',
      'Buon momento per socializzazione',
      'Energia elevata prevista'
    ]
  };

  // Simulated playlist suggestions
  const mockPlaylists: PlaylistSuggestion[] = [
    {
      name: 'Sunny Day Vibes',
      description: 'Musica energica per giornate soleggiate',
      tracks: ['Upbeat Jazz', 'Classical Energetic', 'Nature Sounds'],
      mood_alignment: 0.92
    },
    {
      name: 'Active Pet Session',
      description: 'Ritmi perfetti per il gioco attivo',
      tracks: ['Playful Piano', 'Energetic Strings', 'Happy Melodies'],
      mood_alignment: 0.88
    },
    {
      name: 'Outdoor Adventure',
      description: 'Accompagnamento per avventure all\'aperto',
      tracks: ['Adventure Theme', 'Nature Symphony', 'Uplifting Orchestra'],
      mood_alignment: 0.85
    }
  ];

  useEffect(() => {
    // Simulate getting user location
    setLocation('Milano, IT');
    fetchWeatherAndPrediction();
  }, []);

  const fetchWeatherAndPrediction = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWeatherData(mockWeatherData);
      setMoodPrediction(mockMoodPrediction);
      setPlaylistSuggestions(mockPlaylists);
      
      toast.success('Previsione meteo-comportamentale aggiornata!');
    } catch (error) {
      toast.error('Errore nel caricamento dei dati meteo');
    } finally {
      setIsLoading(false);
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
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      'energico': 'bg-yellow-100 text-yellow-800',
      'calmo': 'bg-blue-100 text-blue-800',
      'rilassato': 'bg-green-100 text-green-800',
      'attivo': 'bg-orange-100 text-orange-800',
      'sonnolento': 'bg-purple-100 text-purple-800'
    };
    return colors[mood as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Previsione Meteo-Comportamentale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Analizzando condizioni meteo...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Previsione Meteo-Comportamentale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {weatherData && getWeatherIcon(weatherData.condition)}
              </div>
              <div className="text-2xl font-bold">{weatherData?.temperature}°C</div>
              <div className="text-sm text-muted-foreground">{location}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Umidità:</span>
                <span className="text-sm font-medium">{weatherData?.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pressione:</span>
                <span className="text-sm font-medium">{weatherData?.pressure} hPa</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {weatherData?.description}
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={fetchWeatherAndPrediction}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Aggiorna
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood Prediction */}
      {moodPrediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Previsione Comportamentale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getMoodColor(moodPrediction.predicted_mood)}>
                    {moodPrediction.predicted_mood}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(moodPrediction.confidence * 100)}% confidenza
                  </span>
                </div>
                <Progress value={moodPrediction.confidence * 100} className="w-24" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Fattori Influenti:</h4>
                  <ul className="space-y-1">
                    {moodPrediction.factors.map((factor, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Raccomandazioni:</h4>
                  <ul className="space-y-1">
                    {moodPrediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist Suggestions */}
      {playlistSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Playlist Suggerite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playlistSuggestions.map((playlist, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{playlist.name}</h4>
                    <Badge variant="outline">
                      {Math.round(playlist.mood_alignment * 100)}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {playlist.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {playlist.tracks.map((track, trackIndex) => (
                      <Badge key={trackIndex} variant="secondary" className="text-xs">
                        {track}
                      </Badge>
                    ))}
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