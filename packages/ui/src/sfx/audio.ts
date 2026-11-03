/**
 * MoonWitness Procedural Web Audio SFX Engine
 * Zero audio assets; 100% synthesized in-memory waveforms.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private preferenceLoaded = false;

  isEnabled(): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.preferenceLoaded) {
      this.preferenceLoaded = true;
      try {
        this.enabled = window.localStorage.getItem('mw-sfx-enabled') === 'true';
      } catch (error) {
        console.warn('Unable to read the sound-effects preference.', error);
      }
    }

    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.preferenceLoaded = true;

    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem('mw-sfx-enabled', String(enabled));
    } catch (error) {
      console.warn('Unable to save the sound-effects preference.', error);
    }
  }

  private getContext(): AudioContext | null {
    if (!this.isEnabled()) return null;
    if (!this.ctx) {
      const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((error: unknown) => {
        console.warn('Unable to resume the sound-effects context.', error);
      });
    }
    return this.ctx;
  }

  private getProfile() {
    const skin = document.querySelector('.mw-skin-root')?.getAttribute('data-moonframe-skin');
    const profiles: Record<string, {
      click: [number, number];
      success: [number, number];
      revoke: [number, number];
    }> = {
      'imperium-lumen': { click: [660, 180], success: [523.25, 783.99], revoke: [246.94, 110] },
      'nexus-paradox': { click: [740, 220], success: [659.25, 987.77], revoke: [220, 130] },
      'lunar-chronicles': { click: [587.33, 146.83], success: [440, 659.25], revoke: [196, 98] },
      mycelium: { click: [493.88, 164.81], success: [392, 587.33], revoke: [185, 110] },
    };

    return profiles[skin ?? ''] ?? profiles['lunar-chronicles'];
  }

  /**
   * Subtle tactile click (20ms sine drop)
   */
  click(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const [startFrequency, endFrequency] = this.getProfile().click;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFrequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFrequency, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch (error) {
      console.warn('Unable to play the sound-effects click.', error);
    }
  }

  /**
   * Skin-specific success chime
   */
  success(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const [firstFrequency, secondFrequency] = this.getProfile().success;

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(firstFrequency, now);
      osc2.frequency.setValueAtTime(secondFrequency, now + 0.06);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.1);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.25);
    } catch (error) {
      console.warn('Unable to play the sound-effects success cue.', error);
    }
  }

  /**
   * Tactile alert / revoke resonance
   */
  revoke(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const [startFrequency, endFrequency] = this.getProfile().revoke;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFrequency, now);
      osc.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (error) {
      console.warn('Unable to play the sound-effects alert.', error);
    }
  }
}

export const sfx = new SoundEffectsEngine();
