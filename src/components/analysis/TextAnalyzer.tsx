import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextAnalyzerProps {
  onTextSubmitted: (description: string) => void;
  isProcessing?: boolean;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({
  onTextSubmitted,
  isProcessing = false
}) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const text = description.trim();
    
    if (text.length < 10) {
      setError('La descrizione deve essere di almeno 10 caratteri');
      return;
    }
    
    if (text.length > 2000) {
      setError('La descrizione non può superare i 2000 caratteri');
      return;
    }

    setError(null);
    onTextSubmitted(text);
    setDescription(''); // Clear after submission
  };

  const handleTextChange = (value: string) => {
    setDescription(value);
    if (error) setError(null); // Clear error when typing
  };

  const characterCount = description.length;
  const minLength = 10;
  const maxLength = 2000;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  const exampleTexts = [
    "Il mio cane sta abbaiando continuamente e sembra agitato",
    "Il gatto si nasconde sotto il letto e non vuole uscire",
    "Il cane salta felice e scodinzola quando arrivo a casa",
    "Il gatto fa le fusa e si strofina contro le mie gambe",
    "Il cane trema e si nasconde durante il temporale"
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Analisi Testuale Comportamento
        </CardTitle>
        <CardDescription>
          Descrivi cosa sta facendo il tuo pet per analizzare il suo stato emotivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input Area */}
        <div className="space-y-2">
          <div className="relative">
            <Textarea
              placeholder="Descrivi dettagliatamente il comportamento del tuo pet: come si sta comportando, che suoni emette, come si muove, dove si trova..."
              value={description}
              onChange={(e) => handleTextChange(e.target.value)}
              disabled={isProcessing}
              className={cn(
                "min-h-[120px] resize-none",
                error && "border-destructive focus:border-destructive"
              )}
              maxLength={maxLength}
            />
            <Type className="absolute top-3 right-3 h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Character Counter */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : characterCount > 0 ? (
                <AlertCircle className="h-3 w-3 text-orange-500" />
              ) : null}
              <span className={cn(
                "text-muted-foreground",
                characterCount < minLength && "text-orange-600",
                characterCount > maxLength && "text-destructive"
              )}>
                {characterCount}/{maxLength} caratteri
                {characterCount < minLength && ` (minimo ${minLength})`}
              </span>
            </div>
            <Badge 
              variant={isValid ? "default" : "secondary"} 
              className="text-xs"
            >
              {isValid ? "Pronto" : "Troppo corto"}
            </Badge>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!isValid || isProcessing}
          className="w-full gradient-coral text-white"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analisi in corso...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Analizza Comportamento
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
          <p className="font-medium">💡 Consigli per una migliore analisi:</p>
          <p>• Descrivi comportamenti specifici e osservabili</p>
          <p>• Includi contesto (es. situazione, orario, ambiente)</p>
          <p>• Menziona suoni, movimenti e posture del corpo</p>
          <p>• Evita interpretazioni, concentrati sui fatti</p>
        </div>

        {/* Analysis Description */}
        <div className="bg-gradient-to-r from-purple/5 to-blue/5 p-4 rounded-lg border border-purple/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">🧠 Analisi Comportamentale Intelligente</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Il nostro sistema di analisi testuale utilizza algoritmi avanzati per interpretare le descrizioni comportamentali:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>🔍 Riconoscimento parole chiave emotive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>📝 Analisi del contesto comportamentale</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>⚖️ Valutazione probabilità emotiva</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>🎯 Suggerimenti personalizzati</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                ⚡ <strong>Tempo medio:</strong> Istantaneo • 
                🎯 <strong>Accuratezza:</strong> 75-90% • 
                📋 <strong>Vantaggi:</strong> Analisi immediata, dettagli contestuali, zero costi di processing
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextAnalyzer;