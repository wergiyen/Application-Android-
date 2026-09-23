import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

class TalkBackService {
  private enabled: boolean = true;
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private pitch: number = 1.0;
  private rate: number = 1.0;
  private currentAudioElement: HTMLAudioElement | null = null;

  private listeners: ((enabled: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }

      // Unlock Web Audio & Speech Context on user tap
      const initAudio = () => {
        if (!this.audioCtx) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioCtx = new AudioContextClass();
          }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (this.synth && this.synth.paused) {
          this.synth.resume();
        }
      };

      window.addEventListener('click', initAudio);
      window.addEventListener('touchstart', initAudio);
    }
  }

  public subscribe(cb: (enabled: boolean) => void) {
    this.listeners.push(cb);
    cb(this.enabled);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.stopAudio();
    if (enabled) {
      this.speak('TalkBack voice enabled', true);
    }
    this.listeners.forEach(l => l(enabled));
  }

  public stop() {
    this.enabled = false;
    this.stopAudio();
    this.listeners.forEach(l => l(false));
  }

  private async stopAudio() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement = null;
      } catch (e) {}
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.stop();
      }
    } catch (e) {}

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Play crisp Web Audio chime tone for instant auditory feedback
  public playAudioChime(freq: number = 880, duration: number = 0.15) {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio chime error:', e);
    }
  }

  public async speak(text: string, priority: boolean = false) {
    if (!this.enabled) return;

    const now = Date.now();
    // Throttle repetitive non-priority messages (1.5 seconds)
    if (!priority && text === this.lastSpokenText && now - this.lastSpokenTime < 1500) {
      return;
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    // Always play immediate audio feedback chime
    this.playAudioChime(priority ? 1046.5 : 880, priority ? 0.25 : 0.12);

    let spokenNative = false;

    // 1. Native Android / iOS Text-To-Speech engine
    if (Capacitor.isNativePlatform()) {
      try {
        if (priority) {
          await TextToSpeech.stop();
        }
        await TextToSpeech.speak({
          text: text,
          lang: 'en-US',
          rate: this.rate,
          pitch: this.pitch,
          volume: 1.0
        });
        spokenNative = true;
        return;
      } catch (nativeErr) {
        console.warn('Native TextToSpeech plugin fallback to WebSpeech:', nativeErr);
      }
    }

    // 2. Web Speech API (window.speechSynthesis)
    if (this.synth && !spokenNative) {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }

        if (priority) {
          this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        this.synth.speak(utterance);
        return;
      } catch (speechErr) {
        console.warn('Web Speech API error:', speechErr);
      }
    }

    // 3. HTML5 Cloud Audio TTS Fallback (Google Translate TTS MP3 Audio)
    try {
      if (priority && this.currentAudioElement) {
        this.currentAudioElement.pause();
      }
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
      const audio = new Audio(ttsUrl);
      this.currentAudioElement = audio;
      audio.play().catch(e => console.warn('HTML5 Audio playback prevented:', e));
    } catch (audioErr) {
      console.warn('Cloud Audio TTS error:', audioErr);
    }
  }

  public testVoice() {
    this.speak('Nevisense TalkBack active. Perception system online.', true);
  }

  public setRate(rate: number) {
    this.rate = rate;
  }

  public setPitch(pitch: number) {
    this.pitch = pitch;
  }
}

export const talkbackService = new TalkBackService();
