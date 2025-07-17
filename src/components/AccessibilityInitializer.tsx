import { useEffect } from 'react';
import type { AccessibilitySettings } from '@/hooks/useAccessibility';

export function AccessibilityInitializer() {
  useEffect(() => {
    // Carica e applica le impostazioni di accessibilità dal localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const settings: AccessibilitySettings = JSON.parse(savedSettings);
        const root = document.documentElement;
        
        // Applica alto contrasto
        if (settings.highContrast) {
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
        }
        
        // Applica dimensione font
        const fontSizeClasses = {
          small: 'text-sm',
          medium: 'text-base',
          large: 'text-lg',
          'extra-large': 'text-xl'
        };
        
        Object.values(fontSizeClasses).forEach(cls => {
          root.classList.remove(cls);
        });
        
        root.classList.add(fontSizeClasses[settings.fontSize]);
        
        const fontSizes = {
          small: '14px',
          medium: '16px',
          large: '18px',
          'extra-large': '20px'
        };
        root.style.setProperty('--base-font-size', fontSizes[settings.fontSize]);
        
        // Aggiungi live region per screen reader se abilitato
        if (settings.screenReader) {
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
        }
        
      } catch (error) {
        console.error('Errore nel caricamento delle impostazioni di accessibilità:', error);
      }
    }
  }, []);

  return null; // Questo componente non renderizza nulla
}