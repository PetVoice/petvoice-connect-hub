import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Brain, Sparkles, TrendingUp, AlertCircle, Volume2, Mic, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useTrainingProtocols } from '@/hooks/useTrainingProtocols';

interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  intensity: 'low' | 'medium' | 'high';
  context: string;
}

interface BehaviorInsight {
  pattern: string;
  frequency: string;
  significance: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface VoiceAnalysis {
  stress_level: number;
  vocal_patterns: string[];
  mood_indicators: string[];
  communication_style: string;
}

export const NaturalLanguageProcessing = () => {
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis[]>([]);
  const [behaviorInsights, setBehaviorInsights] = useState<BehaviorInsight[]>([]);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [sentimentScore, setSentimentScore] = useState<number | null>(null);
  const [recommendedProtocol, setRecommendedProtocol] = useState<any>(null);
  
  const { data: protocols } = useTrainingProtocols();

  // Mappatura emozioni negative -> target_behavior del protocollo
  const emotionToProtocolMapping = {
    'ansia': 'ansioso',
    'aggressività': 'aggressivo', 
    'tristezza': 'depresso',
    'stress': 'stressato',
    'paura': 'pauroso',
    'irritabilità': 'irritabile',
    'confusione': 'confuso',
    'iperattività': 'iperattivo',
    'agitazione': 'agitato'
  };

  // Simulated real-time emotion analysis
  useEffect(() => {
    if (textInput.length > 50) {
      const mockEmotions: EmotionAnalysis[] = [
        {
          emotion: 'contentezza',
          confidence: 0.85,
          intensity: 'high',
          context: 'Gioco e interazione positiva'
        },
        {
          emotion: 'curiosità',
          confidence: 0.72,
          intensity: 'medium',
          context: 'Esplorazione ambiente'
        },
        {
          emotion: 'ansia',
          confidence: 0.31,
          intensity: 'low',
          context: 'Cambiamenti nella routine'
        }
      ];
      setEmotionAnalysis(mockEmotions);
      setSentimentScore(0.67);
      
      // Trova protocollo raccomandato basato su emozioni negative
      findRecommendedProtocol(mockEmotions);
    }
  }, [textInput, protocols]);

  const findRecommendedProtocol = (emotions: EmotionAnalysis[]) => {
    if (!protocols || protocols.length === 0) return;

    // Cerca emozioni negative con confidence > 0.5
    const negativeEmotions = emotions.filter(emotion => {
      const emotionKey = emotion.emotion.toLowerCase();
      return Object.keys(emotionToProtocolMapping).some(key => 
        key.includes(emotionKey) || emotionKey.includes(key)
      ) && emotion.confidence > 0.5;
    });

    if (negativeEmotions.length > 0) {
      const primaryNegativeEmotion = negativeEmotions[0];
      
      // Cerca un protocollo corrispondente
      const targetBehavior = Object.entries(emotionToProtocolMapping).find(([key]) => 
        key.includes(primaryNegativeEmotion.emotion.toLowerCase()) || 
        primaryNegativeEmotion.emotion.toLowerCase().includes(key)
      )?.[1];

      if (targetBehavior) {
        const matchingProtocol = protocols.find(protocol => 
          protocol.target_behavior === targetBehavior
        );
        
        if (matchingProtocol) {
          setRecommendedProtocol(matchingProtocol);
        }
      }
    } else {
      setRecommendedProtocol(null);
    }
  };

  const analyzeText = async () => {
    if (!textInput.trim()) {
      toast.error('Inserisci del testo da analizzare');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights: BehaviorInsight[] = [
        {
          pattern: 'Ricerca di attenzione aumentata',
          frequency: 'Quotidiana',
          significance: 'high',
          recommendation: 'Aumentare le sessioni di gioco strutturato'
        },
        {
          pattern: 'Comportamento esplorativo',
          frequency: 'Mattutina',
          significance: 'medium',
          recommendation: 'Introdurre nuovi stimoli ambientali'
        },
        {
          pattern: 'Vocalizzazioni specifiche',
          frequency: 'Serali',
          significance: 'medium',
          recommendation: 'Monitorare possibili trigger ambientali'
        }
      ];
      
      setBehaviorInsights(insights);
      toast.success('Analisi comportamentale completata');
      
    } catch (error) {
      toast.error('Errore durante l\'analisi');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceAnalysis = async () => {
    setIsListening(true);
    
    try {
      // Simulate voice recording and analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const voiceData: VoiceAnalysis = {
        stress_level: 0.34,
        vocal_patterns: ['Frequenza stabile', 'Tono rilassato', 'Ritmo normale'],
        mood_indicators: ['Contentezza', 'Rilassamento', 'Engagement'],
        communication_style: 'Espressivo e interattivo'
      };
      
      setVoiceAnalysis(voiceData);
      toast.success('Analisi vocale completata');
      
    } catch (error) {
      toast.error('Errore durante l\'analisi vocale');
    } finally {
      setIsListening(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      'contentezza': 'bg-green-100 text-green-800',
      'curiosità': 'bg-blue-100 text-blue-800',
      'ansia': 'bg-yellow-100 text-yellow-800',
      'eccitazione': 'bg-purple-100 text-purple-800',
      'calma': 'bg-gray-100 text-gray-800'
    };
    return colors[emotion as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSignificanceColor = (significance: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[significance as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Elaborazione Linguaggio Naturale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {emotionAnalysis.length}
                </div>
                <div className="text-sm text-gray-600">Emozioni Rilevate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {sentimentScore ? `${Math.round(sentimentScore * 100)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Sentiment Positivo</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {behaviorInsights.length}
                </div>
                <div className="text-sm text-gray-600">Pattern Identificati</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Analisi Testuale Comportamentale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Descrivi il comportamento del tuo pet, le sue abitudini, reazioni e qualsiasi osservazione significativa..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[120px]"
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={analyzeText}
                disabled={isAnalyzing || !textInput.trim()}
                className="flex-1"
              >
                {isAnalyzing ? 'Analizzando...' : 'Analizza Comportamento'}
              </Button>
              <Button 
                onClick={startVoiceAnalysis}
                disabled={isListening}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                {isListening ? 'Ascoltando...' : 'Analisi Vocale'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotion Analysis */}
      {emotionAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analisi Emotiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emotionAnalysis.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getEmotionColor(emotion.emotion)}>
                      {emotion.emotion}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {emotion.context}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {Math.round(emotion.confidence * 100)}%
                    </div>
                    <Badge variant={emotion.intensity === 'high' ? 'destructive' : 'secondary'}>
                      {emotion.intensity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavior Insights */}
      {behaviorInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insight Comportamentali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behaviorInsights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{insight.pattern}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{insight.frequency}</Badge>
                      <Badge className={getSignificanceColor(insight.significance)}>
                        {insight.significance}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.recommendation}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <AlertCircle className="h-3 w-3" />
                    Raccomandazione AI
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Analysis */}
      {voiceAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Analisi Vocale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Livello di Stress</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${voiceAnalysis.stress_level * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round(voiceAnalysis.stress_level * 100)}% - Basso
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Stile Comunicativo</h4>
                  <div className="text-sm text-gray-600">
                    {voiceAnalysis.communication_style}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Pattern Vocali</h4>
                  <div className="flex flex-wrap gap-2">
                    {voiceAnalysis.vocal_patterns.map((pattern, index) => (
                      <Badge key={index} variant="secondary">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Indicatori Umore</h4>
                  <div className="flex flex-wrap gap-2">
                    {voiceAnalysis.mood_indicators.map((indicator, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Training Protocol */}
      {recommendedProtocol && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Protocollo di Training Raccomandato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-lg">{recommendedProtocol.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{recommendedProtocol.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{recommendedProtocol.category}</Badge>
                  <Badge className={
                    recommendedProtocol.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                    recommendedProtocol.difficulty === 'intermedio' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {recommendedProtocol.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Durata:</span>
                  <div className="text-gray-600">{recommendedProtocol.duration_days} giorni</div>
                </div>
                <div>
                  <span className="font-medium">Esercizi:</span>
                  <div className="text-gray-600">{recommendedProtocol.exercise_count || 0}</div>
                </div>
                <div>
                  <span className="font-medium">Successo:</span>
                  <div className="text-gray-600">{recommendedProtocol.success_rate}%</div>
                </div>
                <div>
                  <span className="font-medium">Comportamento:</span>
                  <div className="text-gray-600 capitalize">{recommendedProtocol.target_behavior}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button className="w-full" onClick={() => {
                  toast.success('Protocollo raccomandato! Vai alla sezione Allenamento per iniziare.');
                }}>
                  Inizia Protocollo di Training
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};