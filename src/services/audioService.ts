// Discord audio synthesizer using Web Audio API for zero-external dependency reliability

class DiscordAudioService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Classic Discord message ping sound
  public playMessageSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Discord chime: two rapid tones (B5 then D#6)
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1244.51, now + 0.08); // D#6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio playback fails silently if browser blocks autoplay
    }
  }

  // Voice channel connect chime
  public playJoinSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, now); // G4
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.12); // C5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Ignore
    }
  }

  // Soft send sound
  public playSendSound() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  // Text-To-Speech for individual bot voice readout
  public speakText(text: string, botId: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_`~]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Give each bot subtle variation in pitch and rate for distinct personality
    switch (botId) {
      case 'claude':
        utterance.pitch = 1.0;
        utterance.rate = 1.02;
        break;
      case 'gemini':
        utterance.pitch = 1.1;
        utterance.rate = 1.1;
        break;
      case 'gpt':
        utterance.pitch = 1.05;
        utterance.rate = 1.05;
        break;
      case 'llama':
        utterance.pitch = 0.95;
        utterance.rate = 0.98;
        break;
      case 'grok':
        utterance.pitch = 0.9;
        utterance.rate = 1.15;
        break;
      case 'deepseek':
        utterance.pitch = 1.0;
        utterance.rate = 1.08;
        break;
      case 'qwen':
        utterance.pitch = 1.02;
        utterance.rate = 1.0;
        break;
      case 'kimi':
        utterance.pitch = 0.92;
        utterance.rate = 0.95;
        break;
      case 'mistral':
        utterance.pitch = 1.15;
        utterance.rate = 1.08;
        break;
      case 'deepcognito':
        utterance.pitch = 0.85;
        utterance.rate = 0.92;
        break;
      case 'zai':
        utterance.pitch = 1.08;
        utterance.rate = 1.05;
        break;
      default:
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const discordAudio = new DiscordAudioService();
