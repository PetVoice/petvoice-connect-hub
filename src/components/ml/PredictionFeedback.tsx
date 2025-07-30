import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PredictionFeedbackProps {
  analysisId: string;
  petId: string;
  predictionType: 'emotion' | 'behavior' | 'intervention';
  predictedValue: string;
  confidence: number;
  onFeedbackSubmitted?: () => void;
}

export const PredictionFeedback: React.FC<PredictionFeedbackProps> = ({
  analysisId,
  petId,
  predictionType,
  predictedValue,
  confidence,
  onFeedbackSubmitted
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [actualValue, setActualValue] = useState('');
  const [feedbackType, setFeedbackType] = useState<'accurate' | 'partially_accurate' | 'inaccurate'>('accurate');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const emotionOptions = [
    'felice', 'triste', 'ansioso', 'calmo', 'aggressivo', 
    'giocoso', 'spaventato', 'affettuoso', 'curioso', 'agitato'
  ];

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('continuous-learning', {
        body: {
          action: 'submit_feedback',
          userId: user.id,
          petId,
          analysisId,
          predictionType,
          predictedValue,
          actualValue: actualValue || predictedValue,
          feedbackType: feedbackType === 'accurate' ? 'observation_confirmed' : 'user_correction',
          contextData: {
            original_confidence: confidence,
            user_notes: notes,
            feedback_accuracy: feedbackType
          }
        }
      });

      if (response.error) throw response.error;

      setIsSubmitted(true);
      toast({
        title: "Feedback inviato",
        description: "Grazie! Il tuo feedback aiuterà a migliorare le predizioni future.",
      });

      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('Errore invio feedback:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il feedback. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Feedback ricevuto - Grazie per il contributo!
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          Valuta questa predizione
        </CardTitle>
        <CardDescription>
          Il tuo feedback aiuta l'IA a migliorare nel tempo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Predizione:</span>
          <Badge variant="outline">{predictedValue}</Badge>
          <Badge variant="secondary">{Math.round(confidence * 100)}% sicurezza</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Quanto è accurata questa predizione?
            </label>
            <div className="flex gap-2">
              <Button
                variant={feedbackType === 'accurate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('accurate')}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                Accurata
              </Button>
              <Button
                variant={feedbackType === 'partially_accurate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('partially_accurate')}
              >
                Parzialmente
              </Button>
              <Button
                variant={feedbackType === 'inaccurate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('inaccurate')}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-3 w-3" />
                Sbagliata
              </Button>
            </div>
          </div>

          {feedbackType !== 'accurate' && predictionType === 'emotion' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Qual era l'emozione reale?
              </label>
              <Select value={actualValue} onValueChange={setActualValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona l'emozione corretta" />
                </SelectTrigger>
                <SelectContent>
                  {emotionOptions.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Note aggiuntive (opzionale)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descrivi cosa hai osservato o cosa potrebbe aver influenzato il comportamento..."
              className="min-h-[60px]"
            />
          </div>
        </div>

        <Button 
          onClick={submitFeedback}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Invio in corso...' : 'Invia Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};