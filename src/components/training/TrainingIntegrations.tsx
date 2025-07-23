import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useAITrainingSuggestions } from '@/hooks/useAITrainingSuggestions';
import { 
  Microscope, 
  BookOpen, 
  Heart, 
  Network, 
  ArrowRight, 
  Zap, 
  Target, 
  TrendingUp,
  Brain,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface IntegrationSuggestion {
  id: string;
  source: 'analysis' | 'diary' | 'wellness' | 'matching';
  title: string;
  description: string;
  confidence: number;
  reason: string;
  suggestedProtocol: string;
  estimatedDuration: number;
  potentialImprovement: number;
}

interface IntegrationData {
  emotionalTriggers: string[];
  behavioralPatterns: string[];
  wellnessDecline: boolean;
  similarPetSolutions: string[];
  communityRecommendations: string[];
}


export const TrainingIntegrations: React.FC = () => {
  const { showToast } = useTranslatedToast();
  const { suggestions, integrationData, isLoading, refreshSuggestions } = useAITrainingSuggestions();

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'analysis': return <Microscope className="h-5 w-5 text-blue-500" />;
      case 'diary': return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'wellness': return <Heart className="h-5 w-5 text-red-500" />;
      case 'matching': return <Network className="h-5 w-5 text-purple-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'analysis': return 'Analisi Emotiva';
      case 'diary': return 'Diario Comportamentale';
      case 'wellness': return 'Monitoraggio Benessere';
      case 'matching': return 'Pet Matching';
      default: return 'Sconosciuto';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'analysis': return 'bg-blue-500/20 text-blue-700 border-blue-500/20';
      case 'diary': return 'bg-green-500/20 text-green-700 border-green-500/20';
      case 'wellness': return 'bg-red-500/20 text-red-700 border-red-500/20';
      case 'matching': return 'bg-purple-500/20 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/20';
    }
  };

  const handleAcceptSuggestion = (suggestion: IntegrationSuggestion) => {
    showToast({
      title: "Protocollo Integrato Creato!",
      description: `"${suggestion.title}" è stato aggiunto ai tuoi protocolli attivi con dati da ${getSourceLabel(suggestion.source)}.`,
    });
    // Aggiorna i suggerimenti dopo aver accettato uno
    refreshSuggestions();
  };

  const handleViewIntegrationData = (source: string) => {
    showToast({
      title: "Dati di Integrazione",
      description: `Visualizzazione dettagliata dei dati da ${getSourceLabel(source)}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            Stato Integrazioni AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Microscope className="h-4 w-4 text-blue-500" />
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-sm font-medium">Analisi Emotiva</div>
              <div className="text-xs text-muted-foreground">Connesso</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-sm font-medium">Diario</div>
              <div className="text-xs text-muted-foreground">Connesso</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-sm font-medium">Benessere</div>
              <div className="text-xs text-muted-foreground">Connesso</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Network className="h-4 w-4 text-purple-500" />
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-sm font-medium">Pet Matching</div>
              <div className="text-xs text-muted-foreground">Connesso</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Protocolli Suggeriti dall'Integrazione AI
          </h3>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun suggerimento disponibile</h3>
              <p className="text-muted-foreground mb-4">
                Aggiungi più dati attraverso analisi emotive e diario comportamentale per ricevere suggerimenti personalizzati.
              </p>
              <Button onClick={refreshSuggestions} variant="outline">
                Aggiorna Suggerimenti
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(suggestion.source)}
                    <div>
                      <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                      <Badge className={getSourceColor(suggestion.source)}>
                        {getSourceLabel(suggestion.source)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.confidence}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Motivo del Suggerimento:</p>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Protocollo Suggerito:</span>
                    <span className="font-medium">{suggestion.suggestedProtocol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Durata Stimata:</span>
                    <span className="font-medium">{suggestion.estimatedDuration} giorni</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Miglioramento Potenziale:</span>
                    <span className="font-medium text-green-600">{suggestion.potentialImprovement}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewIntegrationData(suggestion.source)}
                  >
                    Vedi Dati
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Crea Protocollo
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Integration Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Riepilogo Dati Integrazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Trigger Emotivi Rilevati</h4>
              <div className="flex flex-wrap gap-2">
                {integrationData.emotionalTriggers.length > 0 ? (
                  integrationData.emotionalTriggers.map((trigger, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nessun trigger emotivo identificato</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Pattern Comportamentali</h4>
              <div className="flex flex-wrap gap-2">
                {integrationData.behavioralPatterns.length > 0 ? (
                  integrationData.behavioralPatterns.map((pattern, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {pattern}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nessun pattern identificato</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Soluzioni Community</h4>
              <div className="flex flex-wrap gap-2">
                {integrationData.similarPetSolutions.length > 0 ? (
                  integrationData.similarPetSolutions.map((solution, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-purple-50">
                      {solution}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nessuna soluzione simile trovata</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Raccomandazioni Mentori</h4>
              <div className="flex flex-wrap gap-2">
                {integrationData.communityRecommendations.length > 0 ? (
                  integrationData.communityRecommendations.map((rec, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-green-50">
                      {rec}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nessuna raccomandazione disponibile</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};