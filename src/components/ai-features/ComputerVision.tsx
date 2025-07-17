import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Play, Pause, Eye, Activity, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface VisualAnalysis {
  emotion: string;
  confidence: number;
  body_language: string;
  activity_level: number;
  stress_indicators: string[];
  health_markers: string[];
}

interface BehaviorPattern {
  behavior: string;
  frequency: number;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  context: string;
}

interface ObjectDetection {
  object: string;
  confidence: number;
  location: { x: number; y: number; width: number; height: number };
  interaction: boolean;
}

export const ComputerVision = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [visualAnalysis, setVisualAnalysis] = useState<VisualAnalysis | null>(null);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [objectDetection, setObjectDetection] = useState<ObjectDetection[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      if (file.type.startsWith('video/')) {
        toast.success('Video caricato, pronto per l\'analisi');
      } else {
        toast.success('Immagine caricata, pronta per l\'analisi');
      }
    }
  };

  const analyzeMedia = async () => {
    if (!selectedFile) {
      toast.error('Seleziona un file da analizzare');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate progressive analysis
      const progressSteps = [
        { step: 20, message: 'Preprocessamento immagine...' },
        { step: 40, message: 'Rilevamento oggetti...' },
        { step: 60, message: 'Analisi espressioni...' },
        { step: 80, message: 'Riconoscimento comportamenti...' },
        { step: 100, message: 'Completamento analisi...' }
      ];

      for (const { step, message } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(step);
        toast.info(message);
      }

      // Mock analysis results
      const mockVisualAnalysis: VisualAnalysis = {
        emotion: 'contentezza',
        confidence: 0.87,
        body_language: 'Rilassato e attento',
        activity_level: 0.65,
        stress_indicators: ['Nessun indicatore significativo'],
        health_markers: ['Postura normale', 'Respirazione regolare', 'Occhi vigili']
      };

      const mockBehaviorPatterns: BehaviorPattern[] = [
        {
          behavior: 'Gioco interattivo',
          frequency: 0.78,
          duration: '15-20 minuti',
          intensity: 'high',
          context: 'Presenza del proprietario'
        },
        {
          behavior: 'Esplorazione ambientale',
          frequency: 0.45,
          duration: '5-10 minuti',
          intensity: 'medium',
          context: 'Nuovi stimoli'
        },
        {
          behavior: 'Riposo attivo',
          frequency: 0.89,
          duration: '30+ minuti',
          intensity: 'low',
          context: 'Ambiente familiare'
        }
      ];

      const mockObjectDetection: ObjectDetection[] = [
        {
          object: 'Pet',
          confidence: 0.96,
          location: { x: 150, y: 100, width: 200, height: 180 },
          interaction: true
        },
        {
          object: 'Giocattolo',
          confidence: 0.73,
          location: { x: 320, y: 220, width: 50, height: 30 },
          interaction: true
        },
        {
          object: 'Ciotola',
          confidence: 0.81,
          location: { x: 50, y: 250, width: 60, height: 40 },
          interaction: false
        }
      ];

      setVisualAnalysis(mockVisualAnalysis);
      setBehaviorPatterns(mockBehaviorPatterns);
      setObjectDetection(mockObjectDetection);
      toast.success('Analisi completata con successo!');

    } catch (error) {
      toast.error('Errore durante l\'analisi');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const startRealTimeAnalysis = async () => {
    setIsRecording(true);
    toast.info('Avvio analisi in tempo reale...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Simulate real-time analysis
      setTimeout(() => {
        setIsRecording(false);
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
        toast.success('Analisi completata');
      }, 5000);
      
    } catch (error) {
      toast.error('Errore accesso alla camera');
      setIsRecording(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      'contentezza': 'bg-green-100 text-green-800',
      'curiosità': 'bg-blue-100 text-blue-800',
      'ansia': 'bg-yellow-100 text-yellow-800',
      'eccitazione': 'bg-purple-100 text-purple-800',
      'allerta': 'bg-orange-100 text-orange-800'
    };
    return colors[emotion as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getIntensityColor = (intensity: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[intensity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Computer Vision AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Camera className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {objectDetection.length}
              </div>
              <div className="text-sm text-gray-600">Oggetti Rilevati</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {visualAnalysis ? `${Math.round(visualAnalysis.activity_level * 100)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Livello Attività</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {behaviorPatterns.length}
              </div>
              <div className="text-sm text-gray-600">Pattern Comportamentali</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {visualAnalysis ? visualAnalysis.confidence.toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Confidenza AI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Carica Media per Analisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Carica Foto/Video
              </Button>
              <Button 
                onClick={startRealTimeAnalysis}
                disabled={isRecording}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isRecording ? 'Analisi in corso...' : 'Analisi Live'}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {previewUrl && (
              <div className="relative">
                {selectedFile?.type.startsWith('video/') ? (
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full max-h-64 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                )}
                
                {/* Object Detection Overlays */}
                {objectDetection.map((obj, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                    style={{
                      left: `${(obj.location.x / 400) * 100}%`,
                      top: `${(obj.location.y / 300) * 100}%`,
                      width: `${(obj.location.width / 400) * 100}%`,
                      height: `${(obj.location.height / 300) * 100}%`
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {obj.object} ({Math.round(obj.confidence * 100)}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedFile && (
              <Button 
                onClick={analyzeMedia}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analizzando...' : 'Avvia Analisi AI'}
              </Button>
            )}
            
            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={analysisProgress} />
                <div className="text-sm text-gray-600 text-center">
                  {analysisProgress}% completato
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Analysis Results */}
      {visualAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analisi Visiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Emozione Rilevata</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getEmotionColor(visualAnalysis.emotion)}>
                      {visualAnalysis.emotion}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {Math.round(visualAnalysis.confidence * 100)}% confidenza
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Linguaggio del Corpo</h4>
                  <div className="text-sm text-gray-600">
                    {visualAnalysis.body_language}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Livello di Attività</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${visualAnalysis.activity_level * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Indicatori di Stress</h4>
                  <div className="flex flex-wrap gap-2">
                    {visualAnalysis.stress_indicators.map((indicator, index) => (
                      <Badge key={index} variant="outline">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Marcatori Salute</h4>
                  <div className="flex flex-wrap gap-2">
                    {visualAnalysis.health_markers.map((marker, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {marker}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavior Patterns */}
      {behaviorPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Comportamentali Rilevati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behaviorPatterns.map((pattern, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{pattern.behavior}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{pattern.duration}</Badge>
                      <Badge className={getIntensityColor(pattern.intensity)}>
                        {pattern.intensity}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Contesto: {pattern.context}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Frequenza:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${pattern.frequency * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(pattern.frequency * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Object Detection */}
      {objectDetection.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rilevamento Oggetti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {objectDetection.map((obj, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{obj.object}</div>
                    <Badge variant={obj.interaction ? "default" : "secondary"}>
                      {obj.interaction ? 'Interazione' : 'Presente'}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round(obj.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Camera Feed */}
      {isRecording && (
        <Card>
          <CardHeader>
            <CardTitle>Analisi Live</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              ref={videoRef}
              className="w-full max-h-64 object-cover rounded-lg"
              autoPlay
              muted
            />
            <div className="mt-4 text-center">
              <Badge className="bg-red-100 text-red-800">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                Analisi in tempo reale attiva
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};