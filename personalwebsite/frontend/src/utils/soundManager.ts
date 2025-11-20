// Simple sound manager for 3D portfolio
export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Generate procedural sounds using Web Audio API
  playFootstep(volume: number = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Brown noise for footstep sound
    oscillator.frequency.setValueAtTime(80 + Math.random() * 40, this.audioContext.currentTime);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playInteraction(volume: number = 0.4) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Pleasant chime sound
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playZoneEnter(volume: number = 0.5) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Ascending arpeggio for zone transitions
    const frequencies = [440, 554, 659, 880]; // A4, C#5, E5, A5

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext!.destination);

        osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
        osc.type = 'triangle';

        gain.gain.setValueAtTime(volume * 0.5, this.audioContext!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);

        osc.start();
        osc.stop(this.audioContext!.currentTime + 0.2);
      }, index * 80);
    });
  }

  playDogBark(volume: number = 0.6) {
    if (!this.enabled || !this.audioContext) return;

    // Create a playful bark sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Vary frequency for cute bark
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.1);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Ambient background hum
  playAmbient(volume: number = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime); // Low hum
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    oscillator.start();

    // Store reference to stop later
    (this as any).ambientOscillator = oscillator;
    (this as any).ambientGain = gainNode;
  }

  stopAmbient() {
    if ((this as any).ambientOscillator) {
      (this as any).ambientOscillator.stop();
    }
  }
}

// Global sound instance
export const soundManager = SoundManager.getInstance();
