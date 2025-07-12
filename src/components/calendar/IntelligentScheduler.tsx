import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, MapPin, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format, addHours, parseISO, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';

interface IntelligentSchedulerProps {
  events: any[];
  diaryEntries: any[];
  activePet: any;
  proposedEvent: {
    title: string;
    category: string;
    duration: number; // in hours
    preferredTimeSlots?: string[];
    isOutdoor?: boolean;
  };
  onSuggestionSelect: (suggestion: any) => void;
}

interface SchedulingSuggestion {
  date: Date;
  confidence: number;
  reasoning: string[];
  conflicts: string[];
  weatherFactor?: string;
  moodFactor?: string;
  stressFactor?: string;
  travelTime?: number;
}

// Simulated weather data - in production this would come from an API
const getWeatherForecast = (date: Date) => {
  const weathers = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];
  const temps = [18, 20, 22, 25, 28];
  return {
    condition: weathers[Math.floor(Math.random() * weathers.length)],
    temperature: temps[Math.floor(Math.random() * temps.length)],
    suitable_for_outdoor: Math.random() > 0.3
  };
};

const IntelligentScheduler: React.FC<IntelligentSchedulerProps> = ({
  events,
  diaryEntries,
  activePet,
  proposedEvent,
  onSuggestionSelect
}) => {
  const [suggestions, setSuggestions] = useState<SchedulingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Analyze pet's mood patterns from diary entries
  const analyzeMoodPatterns = () => {
    const patterns = {
      morningMood: 0,
      afternoonMood: 0,
      eveningMood: 0,
      stressfulDays: [] as string[],
      goodDays: [] as string[]
    };

    diaryEntries.forEach(entry => {
      if (entry.mood_score) {
        const entryDate = parseISO(entry.entry_date);
        const hour = entryDate.getHours();
        
        if (hour < 12) patterns.morningMood += entry.mood_score;
        else if (hour < 18) patterns.afternoonMood += entry.mood_score;
        else patterns.eveningMood += entry.mood_score;

        if (entry.mood_score <= 3) {
          patterns.stressfulDays.push(entry.entry_date);
        } else if (entry.mood_score >= 8) {
          patterns.goodDays.push(entry.entry_date);
        }
      }
    });

    return patterns;
  };

  // Calculate optimal timing suggestions
  const generateSuggestions = () => {
    setLoading(true);
    const moodPatterns = analyzeMoodPatterns();
    const suggestions: SchedulingSuggestion[] = [];
    
    // Generate suggestions for next 14 days
    for (let i = 1; i <= 14; i++) {
      const proposedDate = new Date();
      proposedDate.setDate(proposedDate.getDate() + i);
      
      // Check for conflicts
      const dayEvents = events.filter(event => 
        isSameDay(parseISO(event.start_time), proposedDate)
      );
      
      const conflicts: string[] = [];
      let conflictSeverity = 0;
      
      dayEvents.forEach(event => {
        if (event.category === 'veterinary' || event.category === 'grooming') {
          conflicts.push(`${event.title} - potenzialmente stressante`);
          conflictSeverity += 3;
        } else if (event.category === 'medication') {
          conflicts.push(`Farmaci programmati - considerare timing`);
          conflictSeverity += 1;
        } else {
          conflicts.push(`${event.title}`);
          conflictSeverity += 0.5;
        }
      });

      // Weather analysis for outdoor events
      const weather = getWeatherForecast(proposedDate);
      let weatherScore = 1;
      let weatherFactor = '';
      
      if (proposedEvent.isOutdoor) {
        if (weather.suitable_for_outdoor && weather.condition !== 'rainy') {
          weatherScore = 1.5;
          weatherFactor = `Condizioni ideali per attività all'aperto (${weather.condition}, ${weather.temperature}°C)`;
        } else {
          weatherScore = 0.3;
          weatherFactor = `Condizioni non ottimali per attività all'aperto (${weather.condition})`;
        }
      }

      // Mood factor analysis
      let moodScore = 1;
      let moodFactor = '';
      
      const recentEntries = diaryEntries.filter(entry => {
        const entryDate = parseISO(entry.entry_date);
        const daysDiff = Math.abs((proposedDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 3;
      });

      if (recentEntries.length > 0) {
        const avgMood = recentEntries.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / recentEntries.length;
        moodScore = avgMood / 5; // Normalize to 0-2 scale
        
        if (avgMood >= 8) {
          moodFactor = 'Periodo di ottimo umore - ideale per nuove attività';
        } else if (avgMood <= 3) {
          moodFactor = 'Periodo di stress - preferire attività rilassanti';
        } else {
          moodFactor = 'Umore neutrale - qualsiasi attività è appropriata';
        }
      }

      // Stress minimization
      let stressScore = 1;
      let stressFactor = '';
      
      if (proposedEvent.category === 'veterinary' || proposedEvent.category === 'grooming') {
        // Avoid scheduling stressful events too close together
        const hasRecentStress = dayEvents.some(event => 
          event.category === 'veterinary' || event.category === 'grooming'
        );
        
        if (hasRecentStress) {
          stressScore = 0.2;
          stressFactor = 'Troppo vicino ad altri eventi stressanti';
        } else if (conflictSeverity === 0) {
          stressScore = 1.5;
          stressFactor = 'Giorno libero - ideale per eventi stressanti';
        }
      }

      // Travel time consideration (simulated)
      let travelTime = 0;
      if (proposedEvent.category === 'veterinary' || proposedEvent.category === 'grooming') {
        travelTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
      }

      // Calculate overall confidence score
      const baseScore = 0.7;
      const conflictPenalty = Math.min(conflictSeverity * 0.1, 0.4);
      const confidence = Math.min(
        (baseScore - conflictPenalty) * weatherScore * moodScore * stressScore,
        1
      );

      // Generate reasoning
      const reasoning: string[] = [];
      
      if (conflicts.length === 0) {
        reasoning.push('Giornata libera da altri impegni');
      } else {
        reasoning.push(`${conflicts.length} eventi già programmati`);
      }
      
      if (weatherFactor) reasoning.push(weatherFactor);
      if (moodFactor) reasoning.push(moodFactor);
      if (stressFactor) reasoning.push(stressFactor);
      if (travelTime > 0) reasoning.push(`Tempo di viaggio stimato: ${travelTime} minuti`);

      // Suggest optimal time slots based on category
      let suggestedHour = 10; // Default morning
      if (proposedEvent.category === 'veterinary') {
        suggestedHour = 9; // Early morning for vet visits
      } else if (proposedEvent.category === 'grooming') {
        suggestedHour = 11; // Late morning for grooming
      } else if (proposedEvent.category === 'activity') {
        suggestedHour = moodPatterns.afternoonMood > moodPatterns.morningMood ? 14 : 10;
      }

      const suggestedTime = new Date(proposedDate);
      suggestedTime.setHours(suggestedHour, 0, 0, 0);

      suggestions.push({
        date: suggestedTime,
        confidence,
        reasoning,
        conflicts,
        weatherFactor,
        moodFactor,
        stressFactor,
        travelTime
      });
    }

    // Sort by confidence score
    suggestions.sort((a, b) => b.confidence - a.confidence);
    setSuggestions(suggestions.slice(0, 5)); // Top 5 suggestions
    setLoading(false);
  };

  useEffect(() => {
    if (proposedEvent.title) {
      generateSuggestions();
    }
  }, [proposedEvent, events, diaryEntries]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <Clock className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analizzando i pattern comportamentali...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Suggerimenti Intelligenti per "{proposedEvent.title}"
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Basato sui pattern comportamentali di {activePet?.name} e ottimizzazione del benessere
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Compila i dettagli dell'evento per ricevere suggerimenti personalizzati
            </AlertDescription>
          </Alert>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-colors hover:bg-muted/50 cursor-pointer ${
                index === 0 ? 'ring-2 ring-primary ring-opacity-20' : ''
              }`}
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {format(suggestion.date, 'EEEE, dd MMMM yyyy', { locale: it })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      alle {format(suggestion.date, 'HH:mm')}
                    </span>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">
                        CONSIGLIATO
                      </Badge>
                    )}
                  </div>
                  {suggestion.travelTime && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Tempo di viaggio: {suggestion.travelTime} min
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getConfidenceColor(suggestion.confidence)}`}>
                  {getConfidenceIcon(suggestion.confidence)}
                  <span className="text-sm font-medium">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {suggestion.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {suggestion.conflicts.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Altri eventi del giorno:
                    </span>
                    {suggestion.conflicts.map((conflict, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        {conflict}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-end mt-3">
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSuggestionSelect(suggestion);
                  }}
                >
                  Seleziona questo orario
                </Button>
              </div>
            </div>
          ))
        )}

        {suggestions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>
                Suggerimenti basati su {diaryEntries.length} voci del diario e {events.length} eventi storici
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentScheduler;