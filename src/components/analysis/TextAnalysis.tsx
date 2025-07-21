import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePets } from '@/contexts/PetContext';

interface TextAnalysisProps {
  onAnalysisComplete?: (analysisId: string) => void;
}

const TextAnalysis: React.FC<TextAnalysisProps> = ({ onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { selectedPet } = usePets();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una descrizione del comportamento del tuo pet",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPet) {
      toast({
        title: "Errore", 
        description: "Seleziona un pet prima di procedere",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const { data, error } = await supabase.functions.invoke('analyze-text-emotion', {
        body: {
          text: text.trim(),
          petId: selectedPet.id,
          userId: user.id
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Errore durante l\'analisi');
      }

      toast({
        title: "Analisi completata!",
        description: `Emozione rilevata: ${data.analysis.primary_emotion} (${data.analysis.primary_confidence}% di confidenza)`,
      });

      setText('');
      onAnalysisComplete?.(data.analysisId);

    } catch (error: any) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Errore durante l'analisi",
        description: error.message || "Si è verificato un errore durante l'analisi del testo",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Analisi Emotiva Testuale
        </CardTitle>
        <CardDescription>
          Descrivi cosa sta facendo il tuo pet e in che situazione si trova. L'IA analizzerà il comportamento per rilevare le emozioni.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pet-description">Descrizione del comportamento</Label>
          <Textarea
            id="pet-description"
            placeholder="Esempio: Il mio cane è seduto nell'angolo della stanza, con le orecchie abbassate e non vuole giocare. Ogni volta che mi avvicino si allontana e sembra nervoso. Ha appena sentito dei fuochi d'artificio fuori..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="resize-none"
            disabled={isAnalyzing}
          />
          <div className="text-sm text-muted-foreground">
            {text.length}/1000 caratteri
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="font-medium mb-2">💡 Suggerimenti per una migliore analisi:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Descrivi il comportamento specifico che osservi</li>
            <li>• Includi il contesto (dove, quando, cosa è successo prima)</li>
            <li>• Menziona eventuali cambiamenti rispetto al solito</li>
            <li>• Descrivi la postura e i segnali del corpo</li>
          </ul>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!text.trim() || isAnalyzing || !selectedPet}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analizzando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Analizza Emozione
            </>
          )}
        </Button>

        {!selectedPet && (
          <p className="text-sm text-muted-foreground text-center">
            Seleziona un pet per iniziare l'analisi
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TextAnalysis;