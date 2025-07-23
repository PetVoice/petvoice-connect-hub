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
      setError(t('analysis.upload.textAnalyzer.errors.tooShort', 'La descrizione deve essere di almeno 10 caratteri'));
      return;
    }
    
    if (text.length > 2000) {
      setError(t('analysis.upload.textAnalyzer.errors.tooLong', 'La descrizione non può superare i 2000 caratteri'));
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
          {t('analysis.upload.textAnalyzer.title', 'Analisi Testuale Comportamento')}
        </CardTitle>
        <CardDescription>
          {t('analysis.upload.textAnalyzer.description', 'Descrivi il comportamento del tuo pet per un\'analisi comportamentale')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Input Area */}
        <div className="space-y-2">
          <div className="relative">
            <Textarea
              placeholder={t('analysis.upload.textAnalyzer.placeholder', 'Descrivi dettagliatamente il comportamento del tuo pet: come si sta comportando, che suoni emette, come si muove, dove si trova...')}
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
                {t('analysis.upload.textAnalyzer.characterCount', `${characterCount}/${maxLength} caratteri`).replace('{{count}}', characterCount.toString()).replace('{{max}}', maxLength.toString())}
                {characterCount < minLength && ` ${t('analysis.upload.textAnalyzer.minCharacters', `(minimo ${minLength})`).replace('{{min}}', minLength.toString())}`}
              </span>
            </div>
            <Badge 
              variant={isValid ? "default" : "secondary"} 
              className="text-xs"
            >
              {isValid ? t('analysis.upload.textAnalyzer.ready', 'Pronto') : t('analysis.upload.textAnalyzer.tooShort', 'Troppo corto')}
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
              {t('analysis.upload.textAnalyzer.analysisInProgress', 'Analisi in corso...')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t('analysis.upload.textAnalyzer.analyzeButton', 'Analizza Comportamento')}
            </>
          )}
        </Button>


        {/* Analysis Description */}
        <div className="bg-gradient-to-r from-purple/5 to-purple/10 p-4 rounded-lg border border-purple/20">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">{t('analysis.upload.textAnalyzer.intelligentAnalysis.title')}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t('analysis.upload.textAnalyzer.intelligentAnalysis.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{t('analysis.upload.textAnalyzer.intelligentAnalysis.features.emotionalKeywords')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{t('analysis.upload.textAnalyzer.intelligentAnalysis.features.contextAnalysis')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{t('analysis.upload.textAnalyzer.intelligentAnalysis.features.emotionalProbability')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{t('analysis.upload.textAnalyzer.intelligentAnalysis.features.personalizedSuggestions')}</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                ⚡ <strong>{t('analysis.upload.textAnalyzer.intelligentAnalysis.stats.averageTime')}</strong> {t('analysis.upload.textAnalyzer.intelligentAnalysis.stats.instant')} • 
                🎯 <strong>{t('analysis.upload.textAnalyzer.intelligentAnalysis.stats.accuracy')}</strong> {t('analysis.upload.textAnalyzer.intelligentAnalysis.stats.accuracyRange')} • 
                📋 <strong>{t('analysis.upload.textAnalyzer.intelligentAnalysis.stats.advantages')}</strong> {t('analysis.upload.textAnalyzer.intelligentAnalysis.stats.advantagesText')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextAnalyzer;