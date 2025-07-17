import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

export function useAccessibility() {
  const { toast } = useToast();
  
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    fontSize: 'medium'
  });

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

  // Applica le impostazioni di accessibilità al DOM
  const applyAccessibilitySettings = useCallback(() => {
    const root = document.documentElement;
    
    // 1. Alto contrasto
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
      root.style.setProperty('--background', '0 0% 8%');
      root.style.setProperty('--foreground', '0 0% 95%');
      root.style.setProperty('--muted', '0 0% 25%');
      root.style.setProperty('--muted-foreground', '0 0% 75%');
      root.style.setProperty('--border', '0 0% 40%');
      root.style.setProperty('--input', '0 0% 12%');
      root.style.setProperty('--ring', '0 0% 80%');
      root.style.setProperty('--card', '0 0% 10%');
      root.style.setProperty('--popover', '0 0% 10%');
      root.style.setProperty('--accent', '0 0% 15%');
      root.style.setProperty('--accent-foreground', '0 0% 90%');
      root.style.setProperty('--secondary', '0 0% 20%');
      root.style.setProperty('--secondary-foreground', '0 0% 90%');
    } else {
      root.classList.remove('high-contrast');
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--border');
      root.style.removeProperty('--input');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--card');
      root.style.removeProperty('--popover');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
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

    // 3. Screen reader - migliora attributi ARIA
    if (accessibility.screenReader) {
      enhanceScreenReaderSupport();
    }
  }, [accessibility, enhanceScreenReaderSupport]);

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

  // Applica le impostazioni al DOM quando cambiano
  useEffect(() => {
    applyAccessibilitySettings();
  }, [applyAccessibilitySettings]);

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
    }
  }, [toast]);

  // Reset di tutte le impostazioni
  const resetSettings = useCallback(() => {
    setAccessibility({
      screenReader: false,
      highContrast: false,
      fontSize: 'medium'
    });
    
    toast({
      title: "Impostazioni Ripristinate",
      description: "Tutte le impostazioni di accessibilità sono state ripristinate"
    });
  }, [toast]);

  return {
    accessibility,
    updateSetting,
    resetSettings,
    announceToScreenReader
  };
}