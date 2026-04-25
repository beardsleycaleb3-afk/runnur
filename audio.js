/**
 * SovereignAudio: Web Audio API integration for real-time sound effects
 * Provides dynamic music, SFX, and audio visualization
 */

class SovereignAudio {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.oscillators = [];
    this.noiseBuffer = null;
    this.soundEnabled = true;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
  }

  /**
   * Initialize Web Audio API
   */
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.7;
      
      // Generate noise buffer for ambient sound
      this.createNoiseBuffer();
      
      console.log('[Audio] Web Audio API initialized');
      return true;
    } catch (error) {
      console.warn('[Audio] Failed to initialize Web Audio API:', error);
      this.soundEnabled = false;
      return false;
    }
  }

  /**
   * Create white noise buffer for ambient effects
   */
  createNoiseBuffer() {
    const bufferSize = this.audioContext.sampleRate * 2;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // -1 to 1
    }
    
    this.noiseBuffer = noiseBuffer;
  }

  /**
   * Play collision sound effect
   * Low frequency pulse with quick decay
   */
  playCollisionSFX() {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const gainNode = this.audioContext.createGain();
      const oscillator = this.audioContext.createOscillator();
      
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      
      gainNode.gain.setValueAtTime(this.sfxVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.warn('[Audio] Collision SFX error:', error);
    }
  }

  /**
   * Play projectile fire sound
   * Sharp high-frequency click
   */
  playFireSFX(isCharged = false) {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const gainNode = this.audioContext.createGain();
      const oscillator = this.audioContext.createOscillator();
      
      if (isCharged) {
        // Charged shot: rising tone
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gainNode.gain.setValueAtTime(this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      } else {
        // Normal shot: quick click
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(now);
      oscillator.stop(now + (isCharged ? 0.15 : 0.05));
    } catch (error) {
      console.warn('[Audio] Fire SFX error:', error);
    }
  }

  /**
   * Play milestone/achievement unlock sound
   * Celebratory ascending tones
   */
  playMilestoneSFX() {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
      
      frequencies.forEach((freq, index) => {
        const delay = index * 0.08;
        const gainNode = this.audioContext.createGain();
        const oscillator = this.audioContext.createOscillator();
        
        oscillator.frequency.setValueAtTime(freq, now + delay);
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.6, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(now + delay);
        oscillator.stop(now + delay + 0.3);
      });
    } catch (error) {
      console.warn('[Audio] Milestone SFX error:', error);
    }
  }

  /**
   * Play game over sound
   * Descending sad tones
   */
  playGameOverSFX() {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const frequencies = [440, 392, 349.23]; // A4, G4, F4 (descending)
      
      frequencies.forEach((freq, index) => {
        const delay = index * 0.15;
        const gainNode = this.audioContext.createGain();
        const oscillator = this.audioContext.createOscillator();
        
        oscillator.frequency.setValueAtTime(freq, now + delay);
        gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(now + delay);
        oscillator.stop(now + delay + 0.4);
      });
    } catch (error) {
      console.warn('[Audio] Game Over SFX error:', error);
    }
  }

  /**
   * Play ambient drone music (background loop)
   */
  playAmbientMusic() {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const gainNode = this.audioContext.createGain();
      const oscillator = this.audioContext.createOscillator();
      
      // Low drone note (G2 = 98Hz)
      oscillator.frequency.setValueAtTime(98, now);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, now + 2);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(now);
      // Don't stop - let it loop (will need to be managed by game loop)
      
      return { oscillator, gainNode };
    } catch (error) {
      console.warn('[Audio] Ambient music error:', error);
      return null;
    }
  }

  /**
   * Toggle sound on/off
   */
  toggleSound(enabled) {
    this.soundEnabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? 0.7 : 0;
    }
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Clean up audio resources
   */
  dispose() {
    if (this.audioContext) {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
      this.oscillators = [];
    }
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SovereignAudio;
}