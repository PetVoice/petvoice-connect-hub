import * as React from "react";
import { EnhancedButton } from "./enhanced-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Save, Download, Trash2, Heart } from "lucide-react";

export const ButtonDemo = () => {
  const [buttonStates, setButtonStates] = React.useState<Record<string, any>>({});

  const handleAsyncAction = async (buttonId: string, success: boolean = true) => {
    const button = buttonStates[buttonId];
    
    if (button && button.setLoading) {
      button.setLoading();
      
      // Simula operazione asincrona
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (success) {
        button.setSuccess();
      } else {
        button.setError();
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🖱️ Button Interactions Demo</CardTitle>
        <CardDescription>
          Test delle nuove funzionalità: click feedback, ripple effect, loading states e animazioni
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Ripple Effect Demo */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">✨ Ripple Effect</h3>
          <div className="grid grid-cols-2 gap-4">
            <EnhancedButton 
              variant="default" 
              className="w-full"
              successText="Salvato!"
            >
              <Save className="h-4 w-4 mr-2" />
              Salva (Primary)
            </EnhancedButton>
            
            <EnhancedButton 
              variant="outline" 
              className="w-full"
              successText="Scaricato!"
            >
              <Download className="h-4 w-4 mr-2" />
              Scarica (Outline)
            </EnhancedButton>
          </div>
        </div>

        {/* Loading States Demo */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">⏳ Loading & States</h3>
          <div className="grid grid-cols-2 gap-4">
            <EnhancedButton 
              ref={(ref) => setButtonStates(prev => ({ ...prev, success: ref }))}
              onClick={() => handleAsyncAction('success', true)}
              variant="success" 
              className="w-full"
              loadingText="Caricando..."
              successText="Completato!"
            >
              <Heart className="h-4 w-4 mr-2" />
              Test Success
            </EnhancedButton>
            
            <EnhancedButton 
              ref={(ref) => setButtonStates(prev => ({ ...prev, error: ref }))}
              onClick={() => handleAsyncAction('error', false)}
              variant="destructive" 
              className="w-full"
              loadingText="Eliminando..."
              errorText="Fallito!"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Test Error
            </EnhancedButton>
          </div>
        </div>

        {/* Size Variants */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">📏 Size Variants</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <EnhancedButton size="sm" successText="Done!">Small</EnhancedButton>
            <EnhancedButton size="default" successText="Done!">Default</EnhancedButton>
            <EnhancedButton size="lg" successText="Done!">Large</EnhancedButton>
            <EnhancedButton size="xl" successText="Done!">XL Button</EnhancedButton>
          </div>
        </div>

        {/* Style Variants */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🎨 Style Variants</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EnhancedButton variant="default" size="sm">Default</EnhancedButton>
            <EnhancedButton variant="secondary" size="sm">Secondary</EnhancedButton>
            <EnhancedButton variant="ghost" size="sm">Ghost</EnhancedButton>
            <EnhancedButton variant="link" size="sm">Link</EnhancedButton>
          </div>
        </div>

        <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
          <p><strong>🎯 Funzionalità implementate:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Click Feedback:</strong> Scale(0.98) + Rotazione(-1deg)</li>
            <li><strong>Ripple Effect:</strong> Animazione dal punto di click</li>
            <li><strong>Loading States:</strong> Spinner + testo personalizzabile</li>
            <li><strong>Success/Error:</strong> Animazioni colorate + icone</li>
            <li><strong>Auto Reset:</strong> Ritorno automatico allo stato idle</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};