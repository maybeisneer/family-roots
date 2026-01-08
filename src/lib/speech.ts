// Web Speech API for free browser-based transcription
// Works in Chrome, Edge, Safari (with varying support)

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Check if Web Speech API is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// SpeechRecognition type for browsers
type SpeechRecognitionAPI = typeof window extends { SpeechRecognition: infer T } ? T : never;

// Get the SpeechRecognition constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SpeechRecognitionConstructor || null;
}

// Language code mapping for Web Speech API
export const SPEECH_LANGUAGE_CODES: Record<string, string> = {
  'en': 'en-US',
  'es': 'es-ES',
  'zh': 'zh-CN',
  'hi': 'hi-IN',
  'ar': 'ar-SA',
  'pt': 'pt-BR',
  'bn': 'bn-IN',
  'ru': 'ru-RU',
  'ja': 'ja-JP',
  'pa': 'pa-IN',
  'de': 'de-DE',
  'ko': 'ko-KR',
  'fr': 'fr-FR',
  'it': 'it-IT',
  'vi': 'vi-VN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'gu': 'gu-IN',
  'ur': 'ur-PK',
  'pl': 'pl-PL',
  'uk': 'uk-UA',
  'th': 'th-TH',
  'tl': 'fil-PH',
};

export class SpeechTranscriber {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isListening: boolean = false;
  private fullTranscript: string = '';
  private options: SpeechRecognitionOptions;

  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      ...options,
    };

    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = this.options.continuous ?? true;
    this.recognition.interimResults = this.options.interimResults ?? true;
    this.recognition.lang = SPEECH_LANGUAGE_CODES[this.options.language || 'en'] || this.options.language || 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
          this.fullTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }

        this.options.onResult?.({
          transcript: result.isFinal ? this.fullTranscript.trim() : this.fullTranscript + interimTranscript,
          confidence,
          isFinal: result.isFinal,
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.options.onError?.(event.error);
      
      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        if (this.isListening) {
          this.restart();
        }
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        this.restart();
      } else {
        this.options.onEnd?.();
      }
    };
  }

  start() {
    if (!this.recognition) {
      this.options.onError?.('Speech recognition not supported');
      return;
    }

    this.isListening = true;
    this.fullTranscript = '';
    
    try {
      this.recognition.start();
    } catch (error) {
      // Recognition might already be started
      console.warn('Recognition start error:', error);
    }
  }

  stop(): string {
    this.isListening = false;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn('Recognition stop error:', error);
      }
    }
    
    return this.fullTranscript.trim();
  }

  private restart() {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      // Might fail if already started, that's ok
      console.warn('Recognition restart error:', error);
    }
  }

  setLanguage(languageCode: string) {
    if (this.recognition) {
      this.recognition.lang = SPEECH_LANGUAGE_CODES[languageCode] || languageCode;
    }
  }

  getTranscript(): string {
    return this.fullTranscript.trim();
  }

  clearTranscript() {
    this.fullTranscript = '';
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }
}

// React hook for speech transcription
export function useSpeechTranscription(options: SpeechRecognitionOptions = {}) {
  // This will be implemented as a React hook in the component
  // For now, export the class-based API
  return {
    SpeechTranscriber,
    isSpeechRecognitionSupported,
    SPEECH_LANGUAGE_CODES,
  };
}

