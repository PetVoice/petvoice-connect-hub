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
  const [isWriting, setIsWriting] = useState(false);

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
    setIsWriting(false); // Reset to initial state
  };

  const handleIconClick = () => {
    if (isWriting && description.trim().length >= 10) {
      // Se siamo in modalità scrittura e il testo è valido, invia l'analisi
      handleSubmit();
    } else {
      // Altrimenti, apri/chiudi la modalità scrittura
      setIsWriting(!isWriting);
      if (error) setError(null);
    }
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
    <Card className="h-full bg-gradient-to-br from-indigo/5 to-indigo/10 border border-indigo/20 shadow-soft hover:shadow-glow transition-all duration-200 flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          Scrivi Testo
        </CardTitle>
        <CardDescription>
          Scrivi direttamente dalla tastiera (max 2K caratteri)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* Text Input Field - Show at top when writing */}
        {isWriting && (
          <div className="relative mx-auto w-full max-w-md bg-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="relative">
                <Textarea
                  placeholder="Descrivi dettagliatamente il comportamento del tuo pet: come si sta comportando, che suoni emette, come si muove, dove si trova..."
                  value={description}
                  onChange={(e) => handleTextChange(e.target.value)}
                  disabled={isProcessing}
                  className={cn(
                    "min-h-[120px] resize-none bg-white",
                    error && "border-destructive focus:border-destructive"
                  )}
                  maxLength={maxLength}
                  autoFocus
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
                  {isValid ? 'Pronto' : 'Troppo corto'}
                </Badge>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Input Area - Icon always at bottom */}
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            {/* Text Button */}
            <Button
              onClick={handleIconClick}
              disabled={isProcessing}
              className={cn(
                "relative z-10 w-32 h-32 rounded-full text-white transition-all duration-200",
                isProcessing
                  ? "bg-blue-500 hover:bg-blue-600 shadow-lg animate-pulse"
                  : "bg-indigo-500 hover:bg-indigo-600 hover:scale-105 shadow-lg"
              )}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MessageSquare className="h-8 w-8" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-mono">
              {characterCount}/2000
            </p>
            <p className="text-sm text-muted-foreground">
              {isProcessing ? 'Analisi in corso...' : 
               isWriting ? 'Clicca per inviare l\'analisi' : 
               'Clicca per iniziare a scrivere'}
            </p>
          </div>
        </div>

        {/* Auto-analyze message */}
        {isProcessing && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                ✨ Descrizione inviata
              </span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {characterCount} caratteri
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              🚀 Avvio analisi automatica in corso...
            </p>
          </div>
        )}

        {/* Analysis Description */}
        <div className="bg-indigo/5 p-4 rounded-lg border border-indigo/20">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-indigo-700 mb-2">🧠 Analisi Avanzata con IA</h4>
              <p className="text-sm text-muted-foreground mb-3">
                La nostra IA analizza i testi per rilevare emozioni e comportamenti attraverso:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span>🔍 Keywords emotive</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📝 Contesto</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊 Probabilità emotive</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💡 Suggerimenti</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                ⏱️ Tempo analisi: Istantaneo • 🎯 Accuratezza: 92-97% • 📊 NLP avanzato con modelli linguistici
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextAnalyzer;