import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Video, 
  Play, 
  Pause, 
  Square, 
  Camera,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Star,
  Clock,
  Target,
  Brain,
  TrendingUp,
  Save,
  Upload,
  Eye,
  Zap,
  Award
} from 'lucide-react';
import { TrainingSession, VideoAnalysisResult, TrainingProtocol } from '@/types/training';

interface TrainingSessionComponentProps {
  protocol: TrainingProtocol;
  onSessionComplete?: (session: TrainingSession) => void;
  onVideoAnalysis?: (analysis: VideoAnalysisResult) => void;
}

export function TrainingSessionComponent({ 
  protocol, 
  onSessionComplete, 
  onVideoAnalysis 
}: TrainingSessionComponentProps) {
  // Session state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  
  // Video recording
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Session data
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(5);
  const [difficultyRating, setDifficultyRating] = useState(5);
  const [engagementLevel, setEngagementLevel] = useState(5);
  const [behavioralObservations, setBehavioralObservations] = useState<string[]>([]);
  const [challengesFaced, setChallengesFaced] = useState<string[]>([]);
  const [improvementsNoted, setImprovementsNoted] = useState<string[]>([]);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused && sessionStartTime) {
      interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, sessionStartTime]);

  const startSession = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(chunks => [...chunks, event.data]);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setSessionStartTime(new Date());
      
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Errore nell\'accesso alla camera. Assicurati di aver concesso i permessi.');
    }
  };

  const pauseSession = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopSession = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop video stream
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
    }
  };

  const analyzeVideo = async () => {
    if (recordedChunks.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      // Create video blob
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      
      // Simulate AI video analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: VideoAnalysisResult = {
        analyzed_at: new Date().toISOString(),
        confidence_score: 87,
        behaviors_detected: [
          {
            behavior_type: 'attention',
            confidence: 0.92,
            timestamp_start: 15,
            timestamp_end: 45,
            context: 'Pet maintaining eye contact during command',
            significance: 'positive'
          },
          {
            behavior_type: 'play_bow',
            confidence: 0.78,
            timestamp_start: 120,
            timestamp_end: 125,
            context: 'Natural play invitation behavior',
            significance: 'positive'
          },
          {
            behavior_type: 'stress_panting',
            confidence: 0.65,
            timestamp_start: 180,
            timestamp_end: 200,
            context: 'Mild stress indicators during difficult exercise',
            significance: 'negative'
          }
        ],
        engagement_score: 8,
        stress_indicators: [
          {
            indicator: 'mild_panting',
            severity: 3,
            timestamp: 180,
            context: 'During challenging exercise'
          }
        ],
        positive_indicators: [
          {
            indicator: 'tail_wagging',
            intensity: 8,
            timestamp: 30,
            context: 'Throughout training session'
          },
          {
            indicator: 'focused_attention',
            intensity: 9,
            timestamp: 15,
            context: 'During command training'
          }
        ],
        task_completion_analysis: {
          task_understood: true,
          execution_quality: 8,
          consistency: 7,
          time_to_completion: 25,
          error_patterns: ['Occasional delayed response'],
          success_patterns: ['Strong food motivation', 'Quick learning']
        },
        improvement_areas: [
          {
            area: 'Response Speed',
            current_score: 7,
            target_score: 9,
            specific_recommendations: [
              'Practice shorter attention bursts',
              'Use higher value rewards for faster responses'
            ],
            priority: 'medium'
          },
          {
            area: 'Stress Management',
            current_score: 6,
            target_score: 8,
            specific_recommendations: [
              'Shorten session duration',
              'Increase break frequency',
              'Monitor for early stress signals'
            ],
            priority: 'high'
          }
        ],
        technique_suggestions: [
          'Consider breaking complex commands into smaller steps',
          'Implement more frequent reward markers',
          'Add environmental enrichment to reduce stress'
        ],
        timing_recommendations: [
          'Sessions work best in the morning for this pet',
          'Keep individual exercises under 3 minutes',
          'Allow 30-second breaks between repetitions'
        ],
        environment_suggestions: [
          'Current indoor environment is optimal',
          'Consider gradual introduction of mild distractions',
          'Ensure consistent lighting for future sessions'
        ]
      };
      
      setAnalysisResult(mockAnalysis);
      onVideoAnalysis?.(mockAnalysis);
      
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completeSession = () => {
    const session: TrainingSession = {
      id: `session-${Date.now()}`,
      protocol_id: protocol.id,
      phase_id: protocol.phases[0]?.id || 'phase-1',
      activity_id: protocol.phases[0]?.daily_activities[currentActivity]?.id || 'activity-1',
      pet_id: 'current-pet-id',
      user_id: 'current-user-id',
      session_date: new Date().toISOString().split('T')[0],
      start_time: sessionStartTime?.toISOString() || new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_minutes: Math.floor(sessionDuration / 60),
      activities_completed: [
        {
          activity_id: protocol.phases[0]?.daily_activities[currentActivity]?.id || 'activity-1',
          completed: true,
          completion_percentage: 85,
          time_spent_minutes: Math.floor(sessionDuration / 60),
          attempts_made: 5,
          success_rate: 0.8,
          notes: sessionNotes
        }
      ],
      performance_metrics: [
        {
          metric_name: 'Response Time',
          value: 2.5,
          unit: 'seconds',
          target_value: 3.0,
          achievement_percentage: 120,
          improvement_from_last: 0.5
        }
      ],
      video_recordings: recordedChunks.length > 0 ? [{
        id: `video-${Date.now()}`,
        filename: `session-${Date.now()}.webm`,
        url: URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' })),
        duration_seconds: sessionDuration,
        file_size: recordedChunks.reduce((size, chunk) => size + chunk.size, 0),
        ai_analysis: analysisResult || {} as VideoAnalysisResult,
        manual_annotations: []
      }] : [],
      photos: [],
      session_rating: sessionRating,
      difficulty_rating: difficultyRating,
      engagement_level: engagementLevel,
      stress_indicators: analysisResult?.stress_indicators.map(s => s.indicator) || [],
      positive_indicators: analysisResult?.positive_indicators.map(p => p.indicator) || [],
      trainer_notes: sessionNotes,
      behavioral_observations: behavioralObservations,
      improvements_noted: improvementsNoted,
      challenges_faced: challengesFaced,
      ai_feedback: {
        overall_assessment: 'Sessione completata con successo. Il pet ha mostrato buoni progressi.',
        performance_score: 82,
        technique_feedback: analysisResult?.technique_suggestions || [],
        timing_feedback: analysisResult?.timing_recommendations || [],
        reinforcement_feedback: ['Ottimo uso del rinforzo positivo'],
        progress_indicators: [
          {
            area: 'Attention',
            current_level: 8,
            target_level: 9,
            progress_rate: 'on_track',
            trend: 'improving',
            confidence: 0.85
          }
        ],
        difficulty_adjustments: [
          {
            adjustment_type: 'maintain',
            justification: 'Current difficulty level is appropriate',
            specific_modifications: [],
            expected_impact: 'Continued steady progress'
          }
        ],
        approach_modifications: [],
        preparation_tips: [
          'Prepare high-value treats for next session',
          'Ensure calm environment'
        ],
        focus_areas: ['Response speed', 'Stress management']
      },
      next_session_adjustments: [
        {
          adjustment_type: 'duration',
          modification: 'Reduce session length by 2 minutes',
          reasoning: 'Prevent stress buildup',
          priority: 'medium'
        }
      ]
    };

    onSessionComplete?.(session);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhase = protocol.phases[0];
  const currentActivityData = currentPhase?.daily_activities[currentActivity];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Sessione Training: {protocol.name}
              </CardTitle>
              <CardDescription>
                {currentActivityData?.name || 'Attività di training'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{formatTime(sessionDuration)}</div>
                <div className="text-sm text-muted-foreground">Durata sessione</div>
              </div>
              <Badge variant={isRecording ? 'destructive' : 'secondary'}>
                {isRecording ? (isPaused ? 'In Pausa' : 'Registrando') : 'Pronto'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Recording Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Registrazione Video
            </CardTitle>
            <CardDescription>
              Registra la sessione per analisi AI automatica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {!videoStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Camera non attiva</p>
                  </div>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">REC {formatTime(sessionDuration)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center gap-2">
              {!isRecording ? (
                <Button onClick={startSession} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Inizia Sessione
                </Button>
              ) : (
                <>
                  <Button onClick={pauseSession} variant="outline">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button onClick={stopSession} variant="destructive">
                    <Square className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Video Analysis */}
            {recordedChunks.length > 0 && !isRecording && (
              <div className="space-y-3">
                <Button 
                  onClick={analyzeVideo} 
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Analizzando Video...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Analizza con AI
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Analisi completata! Confidenza: {analysisResult.confidence_score}%
                      <br />
                      Engagement score: {analysisResult.engagement_score}/10
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Data Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Dati Sessione
            </CardTitle>
            <CardDescription>
              Registra osservazioni e valutazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Activity Info */}
            {currentActivityData && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">{currentActivityData.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {currentActivityData.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentActivityData.duration_minutes}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Livello {currentActivityData.difficulty_level}
                  </span>
                </div>
              </div>
            )}

            {/* Ratings */}
            <div className="space-y-3">
              <div>
                <Label>Valutazione Sessione (1-10)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sessionRating}
                    onChange={(e) => setSessionRating(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline">{sessionRating}/10</Badge>
                </div>
              </div>

              <div>
                <Label>Livello Difficoltà (1-10)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={difficultyRating}
                    onChange={(e) => setDifficultyRating(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline">{difficultyRating}/10</Badge>
                </div>
              </div>

              <div>
                <Label>Livello Engagement (1-10)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={engagementLevel}
                    onChange={(e) => setEngagementLevel(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline">{engagementLevel}/10</Badge>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Note della Sessione</Label>
              <Textarea
                id="notes"
                placeholder="Scrivi le tue osservazioni sulla sessione..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Complete Session */}
            <Button 
              onClick={completeSession} 
              className="w-full"
              disabled={isRecording}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completa Sessione
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Analisi AI della Sessione
            </CardTitle>
            <CardDescription>
              Feedback automatico basato sull'analisi video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="behaviors" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="behaviors">Comportamenti</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="recommendations">Raccomandazioni</TabsTrigger>
                <TabsTrigger value="improvements">Miglioramenti</TabsTrigger>
              </TabsList>

              <TabsContent value="behaviors" className="space-y-4">
                <div className="grid gap-4">
                  {analysisResult.behaviors_detected.map((behavior, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{behavior.behavior_type.replace('_', ' ')}</span>
                        <Badge variant={behavior.significance === 'positive' ? 'default' : 
                                      behavior.significance === 'negative' ? 'destructive' : 'secondary'}>
                          {(behavior.confidence * 100).toFixed(0)}% confidenza
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{behavior.context}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Tempo: {Math.floor(behavior.timestamp_start / 60)}:{(behavior.timestamp_start % 60).toString().padStart(2, '0')} - {Math.floor(behavior.timestamp_end / 60)}:{(behavior.timestamp_end % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Indicatori Positivi</h4>
                    <div className="space-y-2">
                      {analysisResult.positive_indicators.map((indicator, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{indicator.indicator.replace('_', ' ')}</span>
                          <Badge variant="outline" className="text-green-700">
                            {indicator.intensity}/10
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Indicatori di Stress</h4>
                    <div className="space-y-2">
                      {analysisResult.stress_indicators.map((indicator, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{indicator.indicator.replace('_', ' ')}</span>
                          <Badge variant="outline" className="text-orange-700">
                            {indicator.severity}/10
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Analisi Completamento Task</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysisResult.task_completion_analysis.execution_quality}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Qualità Esecuzione</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.task_completion_analysis.consistency}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Consistenza</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.task_completion_analysis.time_to_completion}s
                      </div>
                      <div className="text-sm text-muted-foreground">Tempo Completamento</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tecniche Suggerite</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {analysisResult.technique_suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Raccomandazioni sui Tempi</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {analysisResult.timing_recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Suggerimenti Ambientali</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {analysisResult.environment_suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="improvements" className="space-y-4">
                <div className="grid gap-4">
                  {analysisResult.improvement_areas.map((area, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{area.area}</h4>
                        <Badge variant={area.priority === 'high' ? 'destructive' : 
                                      area.priority === 'medium' ? 'default' : 'secondary'}>
                          {area.priority}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progresso verso target</span>
                          <span>{area.current_score}/{area.target_score}</span>
                        </div>
                        <Progress value={(area.current_score / area.target_score) * 100} className="h-2" />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Raccomandazioni Specifiche:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {area.specific_recommendations.map((rec, recIndex) => (
                            <li key={recIndex}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}