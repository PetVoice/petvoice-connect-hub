import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Upload, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingAnimationProps {
  progress: number;
  stage: string;
  currentFile?: string;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  progress,
  stage,
  currentFile
}) => {
  const getStageIcon = () => {
    if (stage.includes('Caricamento')) {
      return <Upload className="h-8 w-8 text-blue-500 animate-bounce" />;
    } else if (stage.includes('Analisi')) {
      return <Brain className="h-8 w-8 text-purple-500 animate-pulse" />;
    } else if (stage.includes('Salvataggio')) {
      return <Zap className="h-8 w-8 text-yellow-500 animate-spin" />;
    } else if (stage.includes('Completato')) {
      return <CheckCircle2 className="h-8 w-8 text-green-500" />;
    } else {
      return <Loader2 className="h-8 w-8 text-coral animate-spin" />;
    }
  };

  const getStageColor = () => {
    if (stage.includes('Caricamento')) return 'text-blue-600';
    if (stage.includes('Analisi')) return 'text-purple-600';
    if (stage.includes('Salvataggio')) return 'text-yellow-600';
    if (stage.includes('Completato')) return 'text-green-600';
    return 'text-coral';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Pet Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl animate-bounce">🐾</span>
            </div>
          </div>

          {/* Stage Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              {getStageIcon()}
              <h2 className={cn("text-xl font-semibold", getStageColor())}>
                Analisi in Corso
              </h2>
            </div>
            
            <p className="text-muted-foreground">
              {stage}
            </p>
            
            {currentFile && (
              <p className="text-sm text-muted-foreground truncate">
                File: {currentFile}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Processing Steps Indicator */}
          <div className="flex justify-center gap-2">
            {[
              { label: 'Upload', icon: Upload },
              { label: 'AI Analysis', icon: Brain },
              { label: 'Save', icon: Zap },
              { label: 'Complete', icon: CheckCircle2 }
            ].map((step, index) => {
              const isActive = 
                (index === 0 && stage.includes('Caricamento')) ||
                (index === 1 && stage.includes('Analisi')) ||
                (index === 2 && stage.includes('Salvataggio')) ||
                (index === 3 && stage.includes('Completato'));
              
              const isCompleted = 
                (index === 0 && !stage.includes('Caricamento') && progress > 20) ||
                (index === 1 && !stage.includes('Analisi') && progress > 50) ||
                (index === 2 && !stage.includes('Salvataggio') && progress > 80) ||
                (index === 3 && stage.includes('Completato'));
              
              return (
                <div
                  key={step.label}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                    isActive && "bg-coral/10 text-coral",
                    isCompleted && "text-green-600"
                  )}
                >
                  <step.icon className={cn(
                    "h-4 w-4",
                    isActive && "animate-pulse",
                    isCompleted && "text-green-600"
                  )} />
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* AI Processing Visualization */}
          {stage.includes('Analisi') && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Analizzando Patterns Emotivi...</p>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="h-2 w-8 bg-purple-500 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Estrazione features audio</p>
                <p>• Classificazione emotiva</p>
                <p>• Generazione insights</p>
                <p>• Creazione raccomandazioni</p>
              </div>
            </div>
          )}

          {/* Fun Facts During Processing */}
          <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Lo sapevi?</p>
            <p>
              {stage.includes('Caricamento') && "I gatti hanno oltre 100 vocalizzi diversi, mentre i cani ne hanno solo 10!"}
              {stage.includes('Analisi') && "L'AI analizza oltre 50 parametri acustici per identificare le emozioni del tuo pet"}
              {stage.includes('Salvataggio') && "Le analisi vengono salvate in modo sicuro e sono sempre accessibili dalla cronologia"}
              {stage.includes('Completato') && "Analisi completata! Ora puoi scoprire cosa pensa il tuo pet 🎉"}
            </p>
          </div>

          {/* Cancel Button (disabled for now as it would complicate the implementation) */}
          {/* <Button variant="outline" size="sm" disabled>
            Annulla
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingAnimation;