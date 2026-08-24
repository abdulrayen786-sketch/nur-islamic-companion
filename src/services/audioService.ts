let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let speechRequestId = 0;
let remoteSpeechRequestId = 0;

export type SpeechLanguage = 'ur' | 'en';

const LANGUAGE_CODES: Record<SpeechLanguage, string[]> = {
  ur: ['ur-PK', 'ur-IN', 'ur'],
  en: ['en-US', 'en-GB', 'en-IN', 'en'],
};

const LANGUAGE_NAMES: Record<SpeechLanguage, string> = {
  ur: 'Urdu',
  en: 'English',
};

function languageFamily(language: string): SpeechLanguage {
  const family = language.toLowerCase().split('-')[0];
  return family === 'ur' ? 'ur' : 'en';
}

export function extractUrduText(item: {
  urdu?: string;
  urduTranslation?: string;
  urduMeaning?: string;
  translationUrdu?: string;
  meaningUrdu?: string;
  translation?: string;
  translationLanguage?: string;
  language?: string;
}): string | null {
  const candidates = [item.urdu, item.urduTranslation, item.urduMeaning, item.translationUrdu, item.meaningUrdu];
  const explicitUrdu = candidates.find(text => typeof text === 'string' && text.trim());
  if (explicitUrdu) return explicitUrdu.trim();
  const declaredLanguage = `${item.translationLanguage || ''} ${item.language || ''}`.toLowerCase();
  return declaredLanguage.includes('urdu') || declaredLanguage.includes('ur') ? item.translation?.trim() || null : null;
}

export class AudioService {
  static playTextAudio(
    text: string,
    language: 'ar' | 'ur',
    onEnded?: () => void,
    rate: number = 0.9,
    onError?: (message: string) => void,
  ): HTMLAudioElement | null {
    const chunks = text.trim().match(/.{1,180}(?:\s|$)/g)?.map(chunk => chunk.trim()).filter(Boolean) || [];
    if (!chunks.length) {
      onError?.('No audio text is available.');
      return null;
    }

    const requestId = ++remoteSpeechRequestId;
    this.stop();
    let chunkIndex = 0;
    const playChunk = (): HTMLAudioElement => {
      const url = `/api/tts?lang=${language}&text=${encodeURIComponent(chunks[chunkIndex])}`;
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 1;
      audio.playbackRate = Math.min(2, Math.max(0.5, rate));
      currentAudio = audio;
      audio.onended = () => {
        if (requestId !== remoteSpeechRequestId) return;
        chunkIndex += 1;
        if (chunkIndex < chunks.length) playChunk();
        else {
          currentAudio = null;
          onEnded?.();
        }
      };
      audio.onerror = () => {
        if (requestId === remoteSpeechRequestId) {
          currentAudio = null;
          onError?.('Text audio could not be loaded.');
        }
      };
      void audio.play().catch(() => {
        if (requestId === remoteSpeechRequestId) {
          currentAudio = null;
          onError?.('Text audio playback could not be started.');
        }
      });
      return audio;
    };
    return playChunk();
  }
  /**
   * Plays audio from URL with promise and event handling
   */
  static playUrl(
    url: string,
    onEnded?: () => void,
    onError?: (err: any) => void
  ): HTMLAudioElement {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audio = new Audio(url);
    currentAudio = audio;

    if (onEnded) {
      audio.onended = () => {
        onEnded();
      };
    }

    if (onError) {
      audio.onerror = (e) => {
        console.warn('Audio playback error for:', url, e);
        onError(e);
      };
    }

    audio.play().catch((err) => {
      console.warn('Playback interrupted or blocked by browser policy:', err);
      if (onError) onError(err);
    });

    return audio;
  }

  /**
   * Stops currently playing audio
   */
  static stop() {
    remoteSpeechRequestId += 1;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  /**
   * Pauses currently playing audio
   */
  static pause() {
    if (currentAudio) {
      currentAudio.pause();
    }
  }

  /**
   * Resumes currently paused audio
   */
  static resume() {
    if (currentAudio) {
      currentAudio.play().catch(console.warn);
    }
  }

  /**
   * Synthesizes gentle crystal bead click for digital Tasbih using Web Audio API
   */
  static playTasbihClick() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 0.06);
    } catch (e) {
      // Audio context might fail in silent iframe
    }
  }

  /**
   * Synthesizes completion chime for Tasbih cycle or prayer reminder
   */
  static playCompletionChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContext) {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        if (!audioContext) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch (e) {
      // Audio context fallback
    }
  }

  /**
  * Browser Speech Synthesis for language-aware non-sacred UI text.
   */
  static speakText(
    text: string,
    lang: string = 'en-US',
    onEnded?: () => void,
    rate: number = 0.9,
    onError?: (message: string) => void,
    _onWarning?: (message: string) => void,
  ) {
    console.info('[TTS] Text received', { language: lang, length: text.length });
    if (!this.isSpeechSupported()) {
      onError?.('Speech synthesis is not supported in this browser.');
      return false;
    }

    const requestId = ++speechRequestId;
    window.speechSynthesis.cancel();
    void this.speakWhenVoicesReady(text, lang, rate, requestId, onEnded, onError, _onWarning);
    return true;
  }

  static speakUrdu(
    text: string,
    onEnded?: () => void,
    rate: number = 0.9,
    onError?: (message: string) => void,
  ) {
    return this.speakText(text, 'ur-PK', onEnded, rate, onError);
  }

  static speakArabic(
    text: string,
    onEnded?: () => void,
    rate: number = 0.9,
    onError?: (message: string) => void,
  ) {
    if (!this.isSpeechSupported()) {
      onError?.('Arabic speech fallback is not supported in this browser.');
      return false;
    }

    const requestId = ++speechRequestId;
    window.speechSynthesis.cancel();
    void this.speakArabicWhenVoicesReady(text, rate, requestId, onEnded, onError);
    return true;
  }

  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.isSpeechSupported() ? window.speechSynthesis.getVoices() : [];
  }

  static selectVoice(language: string, voices = this.getAvailableVoices()): SpeechSynthesisVoice | null {
    const family = languageFamily(language);
    const preferredCodes = LANGUAGE_CODES[family].map(code => code.toLowerCase());
    const voice = voices.find(voice => preferredCodes.includes(voice.lang.toLowerCase())) ||
      voices.find(voice => voice.lang.toLowerCase().startsWith(`${family}-`)) ||
      voices.find(voice => voice.lang.toLowerCase() === family) ||
      (family === 'ur' ? voices.find(voice => voice.name.toLowerCase().includes('urdu')) : null);
    if (voice?.lang.toLowerCase().startsWith('ar')) return null;
    return voice ?? null;
  }

  static getVoiceStatus(language: string): 'ready' | 'unavailable' | 'loading' {
    if (!this.isSpeechSupported()) return 'unavailable';
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return 'loading';
    return this.selectVoice(language, voices) ? 'ready' : 'unavailable';
  }

  static subscribeToVoices(onChange: () => void) {
    if (!this.isSpeechSupported()) return () => undefined;
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onChange);
  }

  private static async speakWhenVoicesReady(
    text: string,
    language: string,
    rate: number,
    requestId: number,
    onEnded?: () => void,
    onError?: (message: string) => void,
    onWarning?: (message: string) => void,
  ) {
    const voices = await this.waitForVoices();
    if (requestId !== speechRequestId) return;

    const family = languageFamily(language);
    const voice = this.selectVoice(language, voices);
    if (!voice) {
      onError?.(`${LANGUAGE_NAMES[family]} voice is unavailable on this device/browser.`);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = Math.min(2, Math.max(0.5, rate));
    utterance.onend = () => {
      if (requestId === speechRequestId) onEnded?.();
    };
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        onError?.(`${LANGUAGE_NAMES[family]} speech could not start (${event.error}).`);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  private static async speakArabicWhenVoicesReady(
    text: string,
    rate: number,
    requestId: number,
    onEnded?: () => void,
    onError?: (message: string) => void,
  ) {
    const voices = await this.waitForVoices();
    if (requestId !== speechRequestId) return;
    const voice = voices.find(item => item.lang.toLowerCase().startsWith('ar'));
    if (!voice) {
      onError?.('Arabic speech fallback is unavailable on this device/browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.voice = voice;
    utterance.rate = Math.min(2, Math.max(0.5, rate));
    utterance.onend = () => {
      if (requestId === speechRequestId) onEnded?.();
    };
    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        onError?.(`Arabic speech fallback failed (${event.error}).`);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  private static waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    const currentVoices = this.getAvailableVoices();
    if (currentVoices.length > 0) return Promise.resolve(currentVoices);
    return new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.speechSynthesis.removeEventListener('voiceschanged', finish);
        resolve(this.getAvailableVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', finish);
      window.setTimeout(finish, 1500);
    });
  }

  static stopSpeech() {
    speechRequestId += 1;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  static pauseSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.pause();
  }

  static resumeSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.resume();
  }

  static isSpeechSupported() {
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }
}
