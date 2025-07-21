import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  FileAudio, 
  FileVideo, 
  Download, 
  Eye, 
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  Brain,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AnalysisData {
  id: string;
  pet_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  primary_emotion: string;
  primary_confidence: number;
  secondary_emotions: Record<string, number>;
  behavioral_insights: string;
  recommendations: string[];
  triggers: string[];
  analysis_duration: unknown;
  created_at: string;
  updated_at: string;
}

interface AnalysisHistoryProps {
  analyses: AnalysisData[];
  loading: boolean;
  selectedAnalyses: string[];
  onSelectionChange: (selected: string[]) => void;
  onBatchExport?: () => void;
  onBatchCompare?: () => void;
  onBatchDelete?: () => void;
  onAnalysisDetails?: (analysis: AnalysisData) => void;
  onAnalysisDownload?: (analysis: AnalysisData) => void;
  onAnalysisSchedule?: (analysis: AnalysisData) => void;
  onAnalysisDelete?: (analysisId: string) => void;
  petName: string;
}

const EMOTION_COLORS: Record<string, string> = {
  felice: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  calmo: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  ansioso: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  eccitato: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  triste: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
  aggressivo: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  giocoso: 'text-green-600 bg-green-100 dark:bg-green-900/30'
};

const EMOTION_ICONS: Record<string, string> = {
  felice: '😊',
  calmo: '😌',
  ansioso: '😰',
  eccitato: '🤩',
  triste: '😢',
  aggressivo: '😠',
  giocoso: '😄'
};

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  analyses,
  loading,
  selectedAnalyses,
  onSelectionChange,
  onBatchExport,
  onBatchCompare,
  onBatchDelete,
  onAnalysisDetails,
  onAnalysisDownload,
  onAnalysisSchedule,
  onAnalysisDelete,
  petName
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'emotion' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleCardExpansion = (analysisId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(analysisId)) {
      newExpanded.delete(analysisId);
    } else {
      newExpanded.add(analysisId);
    }
    setExpandedCards(newExpanded);
  };

  const toggleSelection = (analysisId: string) => {
    const newSelected = selectedAnalyses.includes(analysisId)
      ? selectedAnalyses.filter(id => id !== analysisId)
      : [...selectedAnalyses, analysisId];
    onSelectionChange(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedAnalyses.length === analyses.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(analyses.map(a => a.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    if (confidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const generateAnalysisTitle = (analysis: AnalysisData) => {
    const emotion = analysis.primary_emotion.charAt(0).toUpperCase() + analysis.primary_emotion.slice(1);
    const date = format(new Date(analysis.created_at), 'dd/MM', { locale: it });
    const time = format(new Date(analysis.created_at), 'HH:mm', { locale: it });
    const fileType = analysis.file_type.startsWith('audio/') ? 'Audio' : 'Video';
    const emotionIcon = EMOTION_ICONS[analysis.primary_emotion];
    
    return {
      main: `${emotionIcon} ${emotion} • ${petName}`,
      subtitle: `${fileType} del ${date} alle ${time}`,
      confidence: analysis.primary_confidence
    };
  };

  const sortedAnalyses = [...analyses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'emotion':
        comparison = a.primary_emotion.localeCompare(b.primary_emotion);
        break;
      case 'confidence':
        comparison = a.primary_confidence - b.primary_confidence;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
            <span className="ml-2">Caricamento cronologia...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nessuna Analisi Trovata</h3>
          <p className="text-muted-foreground">
            Non ci sono analisi che corrispondono ai filtri selezionati
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedAnalyses.length === analyses.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm">
                  Seleziona tutti ({selectedAnalyses.length}/{analyses.length})
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordina per:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('date')}
                  className={sortBy === 'date' ? 'bg-secondary' : ''}
                >
                  Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('emotion')}
                  className={sortBy === 'emotion' ? 'bg-secondary' : ''}
                >
                  Emozione
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('confidence')}
                  className={sortBy === 'confidence' ? 'bg-secondary' : ''}
                >
                  Confidenza
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {selectedAnalyses.length > 0 && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={onBatchExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta ({selectedAnalyses.length})
                </Button>
                <Button size="sm" variant="outline" onClick={onBatchCompare}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Confronta
                </Button>
                <Button size="sm" variant="destructive" onClick={onBatchDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis List */}
      <div className="space-y-4">
        {sortedAnalyses.map((analysis) => (
          <div 
            key={analysis.id} 
            className={cn(
              "bg-card rounded-lg border p-4 transition-all duration-200",
              selectedAnalyses.includes(analysis.id) && "ring-2 ring-coral bg-coral/5"
            )}
          >
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <Checkbox
                  checked={selectedAnalyses.includes(analysis.id)}
                  onCheckedChange={() => toggleSelection(analysis.id)}
                  className="mt-1"
                />

                {/* File Icon */}
                <div className="flex-shrink-0">
                  {analysis.file_type.startsWith('audio/') ? (
                    <FileAudio className="h-8 w-8 text-coral" />
                  ) : (
                    <FileVideo className="h-8 w-8 text-teal" />
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {(() => {
                        const title = generateAnalysisTitle(analysis);
                        return (
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {title.main}
                              <Badge variant="secondary" className="text-xs font-medium">
                                {title.confidence}%
                              </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {title.subtitle}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatFileSize(analysis.file_size)}</span>
                              <span>•</span>
                              <span>{String(analysis.analysis_duration)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(analysis.id)}
                    >
                      {expandedCards.has(analysis.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Emotion and Confidence */}
                  <div className="flex items-center gap-4 mt-3">
                    <Badge className={cn("flex items-center gap-1", EMOTION_COLORS[analysis.primary_emotion])}>
                      <span>{EMOTION_ICONS[analysis.primary_emotion]}</span>
                      {analysis.primary_emotion.charAt(0).toUpperCase() + analysis.primary_emotion.slice(1)}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Progress value={analysis.primary_confidence} className="w-20 h-2" />
                      <span className={cn("text-sm font-medium", getConfidenceColor(analysis.primary_confidence))}>
                        {analysis.primary_confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCards.has(analysis.id) && (
                    <div className="mt-4 space-y-4 pt-4 border-t">
                      {/* Behavioral Insights */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Insights Comportamentali
                        </h4>
                        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                          {analysis.behavioral_insights}
                        </p>
                      </div>

                      {/* Secondary Emotions */}
                      {Object.keys(analysis.secondary_emotions).length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Emozioni Secondarie</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(analysis.secondary_emotions).map(([emotion, confidence]) => (
                              <Badge key={emotion} variant="outline" className="text-xs">
                                {EMOTION_ICONS[emotion]} {emotion} ({confidence}%)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Raccomandazioni</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {analysis.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-coral mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                            {analysis.recommendations.length > 2 && (
                              <li className="text-xs text-muted-foreground">
                                +{analysis.recommendations.length - 2} altre raccomandazioni
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Triggers */}
                      {analysis.triggers.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Trigger Identificati</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.triggers.map((trigger, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => onAnalysisDetails?.(analysis)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Dettagli
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onAnalysisDownload?.(analysis)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onAnalysisSchedule?.(analysis)}>
                          <Calendar className="h-3 w-3 mr-1" />
                          Pianifica
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => onAnalysisDelete?.(analysis.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Elimina
                        </Button>
                      </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>
         ))}
       </div>

      {/* Load More / Pagination */}
      {analyses.length >= 10 && (
        <Card>
          <CardContent className="p-4 text-center">
            <Button variant="outline" className="w-full">
              Carica Altri Risultati
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Mostra 10 di {analyses.length} analisi totali
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisHistory;