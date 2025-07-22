import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Heart, Users, BookOpen, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  route?: string;
  checkFunction?: () => Promise<boolean>;
  color: string;
}

const STEPS: Step[] = [
  {
    id: 'add-pet',
    title: 'Aggiungi il tuo primo pet',
    description: 'Inizia creando il profilo del tuo amico a quattro zampe',
    icon: <Heart className="h-5 w-5" />,
    action: 'Aggiungi Pet',
    route: '/dashboard',
    checkFunction: async () => {
      const { data: pets } = await supabase.from('pets').select('id').limit(1);
      return (pets?.length || 0) > 0;
    },
    color: 'text-pink-600'
  },
  {
    id: 'diary-entry',
    title: 'Crea la prima entry del diario',
    description: 'Documenta i momenti speciali con il tuo pet',
    icon: <BookOpen className="h-5 w-5" />,
    action: 'Scrivi nel Diario',
    route: '/dashboard',
    checkFunction: async () => {
      const { data: entries } = await supabase.from('diary_entries').select('id').limit(1);
      return (entries?.length || 0) > 0;
    },
    color: 'text-blue-600'
  },
  {
    id: 'explore-community',
    title: 'Esplora la Community',
    description: 'Incontra altri proprietari di pet e condividi esperienze',
    icon: <Users className="h-5 w-5" />,
    action: 'Vai alla Community',
    route: '/community',
    checkFunction: async () => {
      const { data: messages } = await supabase.from('community_messages').select('id').limit(1);
      return (messages?.length || 0) > 0;
    },
    color: 'text-green-600'
  },
  {
    id: 'try-ai-features',
    title: 'Prova le funzionalità AI',
    description: 'Scopri i protocolli di training e il pet matching',
    icon: <Sparkles className="h-5 w-5" />,
    action: 'Esplora AI',
    route: '/pet-matching',
    checkFunction: async () => {
      const { data: protocols } = await supabase.from('ai_training_protocols').select('id').limit(1);
      return (protocols?.length || 0) > 0;
    },
    color: 'text-purple-600'
  }
];

export const FirstStepsGuide: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user) {
      checkCompletedSteps();
    }
  }, [user]);

  const checkCompletedSteps = async () => {
    setIsChecking(true);
    const completed: string[] = [];

    for (const step of STEPS) {
      if (step.checkFunction) {
        try {
          const isCompleted = await step.checkFunction();
          if (isCompleted) {
            completed.push(step.id);
          }
        } catch (error) {
          console.error(`Error checking step ${step.id}:`, error);
        }
      }
    }

    setCompletedSteps(completed);
    setIsChecking(false);
  };

  const handleStepAction = (step: Step) => {
    if (step.route) {
      navigate(step.route);
    }
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  const progressPercentage = (completedSteps.length / STEPS.length) * 100;
  const allCompleted = completedSteps.length === STEPS.length;

  if (allCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              🎉 Complimenti!
            </h3>
            <p className="text-green-700">
              Hai completato tutti i primi passi! Ora sei pronto per sfruttare al massimo tutte le funzionalità dell'app.
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Guida completata
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold gradient-text">
            🚀 Primi Passi
          </CardTitle>
          <Badge variant="outline">
            {completedSteps.length}/{STEPS.length}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isChecking ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <Circle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Controllo progressi...</p>
            </div>
          </div>
        ) : (
          STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.id);
            
            return (
              <div
                key={step.id}
                className={`relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-green-50/50 border-green-200' 
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                {/* Step number and icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${step.color} border-current`}>
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={step.color}>
                        {step.icon}
                      </span>
                      <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </h4>
                    </div>
                    
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStepAction(step)}
                        className="flex-shrink-0"
                      >
                        {step.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                  
                  <p className={`text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                  
                  {isCompleted && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      ✅ Completato
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Motivation message */}
        {!isChecking && completedSteps.length > 0 && !allCompleted && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm text-center">
              💪 Ottimo lavoro! Hai completato {completedSteps.length} passi su {STEPS.length}. 
              Continua così!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};