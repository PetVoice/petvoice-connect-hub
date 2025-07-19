import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Brain, Cloud, Zap, Play } from 'lucide-react';
import { PlaylistRecommendation } from '@/hooks/usePlaylistRecommendations';
import { useNavigate } from 'react-router-dom';

interface PlaylistRecommendationCardProps {
  recommendations: PlaylistRecommendation[];
  loading: boolean;
  petId?: string;
}

const PlaylistRecommendationCard: React.FC<PlaylistRecommendationCardProps> = ({
  recommendations,
  loading,
  petId
}) => {
  const navigate = useNavigate();

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'emotional_analysis':
        return <Brain className="h-4 w-4" />;
      case 'weather':
        return <Cloud className="h-4 w-4" />;
      case 'combined':
        return <Zap className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'emotional_analysis':
        return 'Analisi Emotiva';
      case 'weather':
        return 'Meteo';
      case 'combined':
        return 'Combinata';
      default:
        return 'Generale';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePlayPlaylist = (playlist: PlaylistRecommendation) => {
    // Naviga alla pagina AI Music Therapy con i parametri della playlist
    navigate(`/ai-music-therapy?petId=${petId}&playlist=${encodeURIComponent(JSON.stringify({
      name: playlist.name,
      frequency: playlist.frequency,
      duration: playlist.duration,
      description: playlist.description
    }))}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Playlist Raccomandate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Playlist Raccomandate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nessuna raccomandazione disponibile. Esegui un'analisi emotiva per ricevere suggerimenti personalizzati.
          </p>
        </CardContent>
      </Card>
    );
  }

  const topRecommendation = recommendations[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Playlist Raccomandate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Raccomandazione principale */}
        <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getSourceIcon(topRecommendation.source)}
              <h4 className="font-semibold text-lg">{topRecommendation.name}</h4>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={getPriorityColor(topRecommendation.priority)}>
                {topRecommendation.priority === 'high' ? 'Alta Priorità' : 
                 topRecommendation.priority === 'medium' ? 'Media Priorità' : 'Bassa Priorità'}
              </Badge>
              <Badge variant="secondary">
                {getSourceLabel(topRecommendation.source)}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {topRecommendation.description}
          </p>
          
          <div className="text-xs text-muted-foreground mb-3">
            <strong>Motivo:</strong> {topRecommendation.reasoning}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span><strong>Frequenza:</strong> {topRecommendation.frequency}</span>
              <span><strong>Durata:</strong> {topRecommendation.duration}min</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => handlePlayPlaylist(topRecommendation)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Riproduci
            </Button>
          </div>
        </div>

        {/* Raccomandazioni secondarie */}
        {recommendations.slice(1).map((rec, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSourceIcon(rec.source)}
                <h5 className="font-medium">{rec.name}</h5>
              </div>
              <Badge variant="outline">
                {getSourceLabel(rec.source)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {rec.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {rec.frequency} • {rec.duration}min
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePlayPlaylist(rec)}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlaylistRecommendationCard;