import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  motionSensitivity: boolean;
  keyboardNavigation: boolean;
  voiceCommands: boolean;
}

interface VoiceCommandsState {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
}

export function useAccessibility() {
  const { toast } = useToast();
  
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    fontSize: 'medium',
    motionSensitivity: false,
    keyboardNavigation: true,
    voiceCommands: false
  });

  const [voiceState, setVoiceState] = useState<VoiceCommandsState>({
    isListening: false,
    isSupported: false,
    lastCommand: null
  });

  const [recognition, setRecognition] = useState<any>(null);

  // Carica le impostazioni dal localStorage al mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAccessibility(parsed);
      } catch (error) {
        console.error('Errore nel caricamento delle impostazioni di accessibilità:', error);
      }
    }
  }, []);

  // Salva le impostazioni nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(accessibility));
  }, [accessibility]);

  // Applica le impostazioni al DOM
  useEffect(() => {
    applyAccessibilitySettings();
  }, [accessibility]);

  // Annuncia messaggi agli screen reader
  const announceToScreenReader = useCallback((message: string) => {
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }, []);

  // Gestisce i comandi vocali
  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('vai a') || lowerCommand.includes('apri')) {
      if (lowerCommand.includes('home') || lowerCommand.includes('casa')) {
        window.location.href = '/';
      } else if (lowerCommand.includes('impostazioni') || lowerCommand.includes('settings')) {
        window.location.href = '/settings';
      } else if (lowerCommand.includes('profilo')) {
        window.location.href = '/profile';
      }
    } else if (lowerCommand.includes('scorri') || lowerCommand.includes('scroll')) {
      if (lowerCommand.includes('su') || lowerCommand.includes('alto')) {
        window.scrollBy(0, -200);
      } else if (lowerCommand.includes('giù') || lowerCommand.includes('basso')) {
        window.scrollBy(0, 200);
      }
    } else if (lowerCommand.includes('chiudi') || lowerCommand.includes('esci')) {
      // Chiudi modali aperte
      const closeButtons = document.querySelectorAll('[aria-label*="chiudi"], [aria-label*="close"]');
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLElement).click();
      }
    } else if (lowerCommand.includes('salva')) {
      // Trova e clicca il pulsante salva
      const saveButtons = document.querySelectorAll('button:contains("Salva"), button:contains("Save")');
      if (saveButtons.length > 0) {
        (saveButtons[0] as HTMLElement).click();
      }
    }

    // Annuncia il comando eseguito
    announceToScreenReader(`Comando eseguito: ${command}`);
  }, [announceToScreenReader]);

  // Inizializza il riconoscimento vocale
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'it-IT';
      
      recognitionInstance.onresult = (event: any) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        setVoiceState(prev => ({ ...prev, lastCommand: command }));
        handleVoiceCommand(command);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Errore riconoscimento vocale:', event.error);
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };
      
      recognitionInstance.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };
      
      setRecognition(recognitionInstance);
      setVoiceState(prev => ({ ...prev, isSupported: true }));
    }
  }, [handleVoiceCommand]);

  // Applica le impostazioni di accessibilità al DOM
  const applyAccessibilitySettings = useCallback(() => {
    const root = document.documentElement;
    
    // 1. Alto contrasto
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
      root.style.setProperty('--background', '0 0% 0%');
      root.style.setProperty('--foreground', '0 0% 100%');
      root.style.setProperty('--muted', '0 0% 20%');
      root.style.setProperty('--border', '0 0% 50%');
    } else {
      root.classList.remove('high-contrast');
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--border');
    }

    // 2. Dimensione font
    const fontSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      'extra-large': 'text-xl'
    };
    
    // Rimuovi tutte le classi di dimensione font
    Object.values(fontSizeClasses).forEach(cls => {
      root.classList.remove(cls);
    });
    
    // Applica la nuova dimensione
    root.classList.add(fontSizeClasses[accessibility.fontSize]);
    
    // Applica anche via CSS custom properties
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizes[accessibility.fontSize]);

    // 3. Sensibilità al movimento - riduce animazioni
    if (accessibility.motionSensitivity) {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
      root.classList.remove('reduce-motion');
    }

    // 4. Screen reader - migliora attributi ARIA
    if (accessibility.screenReader) {
      enhanceScreenReaderSupport();
    }

    // 5. Navigazione da tastiera - migliora focus
    if (accessibility.keyboardNavigation) {
      enhanceKeyboardNavigation();
    }

  }, [accessibility]);

  // Migliora il supporto per screen reader
  const enhanceScreenReaderSupport = useCallback(() => {
    // Aggiungi attributi ARIA dove mancanti
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach((button) => {
      const text = button.textContent?.trim();
      if (text) {
        button.setAttribute('aria-label', text);
      }
    });

    // Aggiungi role ai componenti interattivi
    const interactiveElements = document.querySelectorAll('[onclick], [onkeydown]');
    interactiveElements.forEach((element) => {
      if (!element.getAttribute('role')) {
        element.setAttribute('role', 'button');
      }
    });

    // Aggiungi live regions per notifiche
    let liveRegion = document.getElementById('accessibility-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
  }, []);

  // Migliora la navigazione da tastiera
  const enhanceKeyboardNavigation = useCallback(() => {
    // Aggiungi indicatori di focus visibili
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
      }
      .keyboard-navigation button:focus,
      .keyboard-navigation input:focus,
      .keyboard-navigation select:focus,
      .keyboard-navigation textarea:focus {
        box-shadow: 0 0 0 2px hsl(var(--primary)) !important;
      }
    `;
    
    if (!document.getElementById('keyboard-navigation-styles')) {
      style.id = 'keyboard-navigation-styles';
      document.head.appendChild(style);
    }
    
    document.body.classList.add('keyboard-navigation');

    // Gestisci navigazione con Tab
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-focus');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-focus');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);


  // Avvia riconoscimento vocale
  const startVoiceRecognition = useCallback(() => {
    if (recognition && voiceState.isSupported) {
      try {
        recognition.start();
        setVoiceState(prev => ({ ...prev, isListening: true }));
        toast({
          title: "Comandi Vocali Attivati",
          description: "Puoi ora utilizzare comandi vocali per navigare"
        });
      } catch (error) {
        console.error('Errore avvio riconoscimento vocale:', error);
        toast({
          title: "Errore",
          description: "Impossibile attivare i comandi vocali",
          variant: "destructive"
        });
      }
    }
  }, [recognition, voiceState.isSupported, toast]);

  // Ferma riconoscimento vocale
  const stopVoiceRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setVoiceState(prev => ({ ...prev, isListening: false }));
      toast({
        title: "Comandi Vocali Disattivati",
        description: "Il riconoscimento vocale è stato fermato"
      });
    }
  }, [recognition, toast]);

  // Aggiorna una singola impostazione
  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setAccessibility(prev => ({
      ...prev,
      [key]: value
    }));

    // Mostra notifica per alcune impostazioni
    if (key === 'screenReader' && value) {
      toast({
        title: "Screen Reader Abilitato",
        description: "Il supporto per screen reader è ora attivo"
      });
    } else if (key === 'highContrast') {
      toast({
        title: value ? "Alto Contrasto Attivato" : "Alto Contrasto Disattivato",
        description: value ? "I colori sono ora ad alto contrasto" : "I colori sono tornati normali"
      });
    } else if (key === 'voiceCommands' && value) {
      startVoiceRecognition();
    } else if (key === 'voiceCommands' && !value) {
      stopVoiceRecognition();
    }
  }, [toast, startVoiceRecognition, stopVoiceRecognition]);

  // Reset di tutte le impostazioni
  const resetSettings = useCallback(() => {
    setAccessibility({
      screenReader: false,
      highContrast: false,
      fontSize: 'medium',
      motionSensitivity: false,
      keyboardNavigation: true,
      voiceCommands: false
    });
    
    toast({
      title: "Impostazioni Ripristinate",
      description: "Tutte le impostazioni di accessibilità sono state ripristinate"
    });
  }, [toast]);

  return {
    accessibility,
    voiceState,
    updateSetting,
    resetSettings,
    announceToScreenReader,
    startVoiceRecognition,
    stopVoiceRecognition
  };
}