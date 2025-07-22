import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePets } from '@/contexts/PetContext';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  currentFile?: string;
}

interface TextAnalysisProps {
  onAnalysisComplete?: (analysisId: string) => void;
  setProcessing?: React.Dispatch<React.SetStateAction<ProcessingState>>;
}

const TextAnalysis: React.FC<TextAnalysisProps> = ({ onAnalysisComplete, setProcessing }) => {
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
    
    // Attiva processing animation se disponibile
    setProcessing?.({
      isProcessing: true,
      progress: 10,
      stage: 'Analisi in corso...'
    });

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

      // Aggiorna progresso
      setProcessing?.({
        isProcessing: true,
        progress: 90,
        stage: 'Salvataggio risultati...'
      });

      toast({
        title: "Analisi completata!",
        description: `Emozione rilevata: ${data.analysis.primary_emotion} (${data.analysis.confidence}% di confidenza)`,
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
      // Il processing viene gestito dal parent in caso di successo
      // Qui gestiamo solo il caso di errore
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Analisi Comportamentale Testuale
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

        <Button 
          onClick={handleAnalyze} 
          disabled={!text.trim() || isAnalyzing || !selectedPet}
          className="w-full bg-primary hover:bg-primary/90 text-white"
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

        {/* Help Section */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h4 className="font-medium mb-3 text-foreground">🎯 Cosa Analizza</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Comportamenti:</strong> Azioni specifiche e pattern comportamentali</p>
            <p>• <strong>Contesto emotivo:</strong> Situazioni e trigger che influenzano l'umore</p>
            <p>• <strong>Linguaggio corporeo:</strong> Postura, movimenti e segnali fisici</p>
          </div>
          
          <h4 className="font-medium mb-2 mt-4 text-foreground">💡 Consigli per il Miglior Risultato</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Descrivi comportamenti specifici, non interpretazioni</p>
            <p>• Includi il contesto: dove, quando, cosa è successo prima</p>
            <p>• Menziona cambiamenti rispetto al comportamento normale</p>
            <p>• Usa dettagli concreti: "orecchie abbassate" vs "triste"</p>
            <p>• Descrivi la durata e l'intensità del comportamento</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextAnalysis;