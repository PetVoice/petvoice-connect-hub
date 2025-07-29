// Sistema di notifiche sonore
export class NotificationSound {
  private static instance: NotificationSound;
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  private constructor() {
    // Inizializza AudioContext solo quando necessario
    this.initializeAudioContext();
  }

  static getInstance(): NotificationSound {
    if (!NotificationSound.instance) {
      NotificationSound.instance = new NotificationSound();
    }
    return NotificationSound.instance;
  }

  private initializeAudioContext() {
    try {
      // Usa AudioContext o webkitAudioContext per compatibilità
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('AudioContext non supportato:', error);
    }
  }

  // Suoni diversi per diversi tipi di notifica
  private generateTone(frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      // Resume AudioContext se è in stato suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Envelope per rendere il suono più gradevole
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Errore nella generazione del suono:', error);
    }
  }

  // Suoni specifici per tipo di notifica
  playNotificationSound(type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'calendar' | 'medication') {
    if (!this.isEnabled) return;

    switch (type) {
      case 'message':
        // Suono messaggio: due toni rapidi
        this.generateTone(800, 0.1);
        setTimeout(() => this.generateTone(1000, 0.1), 150);
        break;
        
      case 'calendar':
        // Suono calendario: tono ascendente
        this.generateTone(600, 0.15);
        setTimeout(() => this.generateTone(800, 0.15), 100);
        setTimeout(() => this.generateTone(1000, 0.2), 200);
        break;
        
      case 'medication':
        // Suono medicina: tono alto persistente
        this.generateTone(1200, 0.3);
        setTimeout(() => this.generateTone(1200, 0.2), 400);
        break;
        
      case 'success':
        // Suono successo: accordo maggiore
        this.generateTone(523, 0.2); // Do
        setTimeout(() => this.generateTone(659, 0.2), 50); // Mi
        setTimeout(() => this.generateTone(784, 0.3), 100); // Sol
        break;
        
      case 'warning':
        // Suono avvertimento: tono discendente
        this.generateTone(1000, 0.2);
        setTimeout(() => this.generateTone(800, 0.2), 150);
        break;
        
      case 'error':
        // Suono errore: due toni bassi
        this.generateTone(300, 0.2);
        setTimeout(() => this.generateTone(250, 0.3), 200);
        break;
        
      case 'info':
      default:
        // Suono info: tono semplice
        this.generateTone(800, 0.2);
        break;
    }
  }

  // Suono di test
  playTestSound() {
    this.generateTone(440, 0.5); // La
  }

  // Abilita/disabilita suoni
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('notifications-sound-enabled', enabled.toString());
  }

  isAudioEnabled(): boolean {
    const stored = localStorage.getItem('notifications-sound-enabled');
    return stored !== null ? stored === 'true' : true; // Default abilitato
  }

  // Richiedi permesso per notifiche audio (necessario in alcuni browser)
  async requestPermission(): Promise<boolean> {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    } catch (error) {
      console.error('Permesso audio negato:', error);
      return false;
    }
  }
}

// Singleton instance
export const notificationSound = NotificationSound.getInstance();