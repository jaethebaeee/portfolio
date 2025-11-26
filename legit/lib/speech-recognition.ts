/**
 * Speech Recognition Utilities
 * Enhanced speech recognition with better Korean support
 */

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  autoStart?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class EnhancedSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private options: SpeechRecognitionOptions;
  private isListening = false;

  constructor(options: SpeechRecognitionOptions = {}) {
    this.options = {
      language: 'ko-KR',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      autoStart: false,
      ...options,
    };

    this.initialize();
  }

  private initialize() {
    if (!this.isSupported()) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = this.options.continuous!;
    this.recognition.interimResults = this.options.interimResults!;
    this.recognition.lang = this.options.language!;
    this.recognition.maxAlternatives = this.options.maxAlternatives!;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.options.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      this.options.onResult?.(transcript, result.isFinal);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.options.onEnd?.();
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      let errorMessage = '음성 인식 오류';

      switch (event.error) {
        case 'no-speech':
          errorMessage = '음성이 감지되지 않았습니다';
          break;
        case 'audio-capture':
          errorMessage = '마이크에 접근할 수 없습니다';
          break;
        case 'not-allowed':
          errorMessage = '마이크 권한이 거부되었습니다';
          break;
        case 'network':
          errorMessage = '네트워크 오류';
          break;
        case 'language-not-supported':
          errorMessage = '지원하지 않는 언어입니다';
          break;
        case 'service-not-allowed':
          errorMessage = '음성 인식 서비스가 허용되지 않았습니다';
          break;
        default:
          errorMessage = `음성 인식 오류: ${event.error}`;
      }

      this.options.onError?.(errorMessage);
    };
  }

  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not initialized'));
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      try {
        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  destroy(): void {
    this.stop();
    this.recognition = null;
  }

  // Utility method for Korean text post-processing
  static postProcessKoreanText(text: string): string {
    // Basic Korean text cleanup
    return text
      .trim()
      // Fix common spacing issues
      .replace(/([가-힣])\s*([.,!?])/g, '$1$2') // Remove space before punctuation
      .replace(/([.,!?])\s*([가-힣])/g, '$1 $2') // Add space after punctuation
      // Fix common misrecognitions
      .replace(/\b백\b/g, '백') // Keep as is
      .replace(/\b만\b/g, '만'); // Keep as is
  }
}

// Browser compatibility check
export function getBrowserSupport(): {
  supported: boolean;
  browser: string;
  recommendation?: string;
} {
  const userAgent = navigator.userAgent;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    if (userAgent.includes('Chrome')) {
      return { supported: true, browser: 'Chrome' };
    } else if (userAgent.includes('Firefox')) {
      return {
        supported: false,
        browser: 'Firefox',
        recommendation: 'Chrome 브라우저를 사용해주세요'
      };
    } else if (userAgent.includes('Safari')) {
      return {
        supported: false,
        browser: 'Safari',
        recommendation: 'Chrome 브라우저를 사용해주세요'
      };
    } else if (userAgent.includes('Edge')) {
      return { supported: true, browser: 'Edge' };
    } else {
      return { supported: true, browser: 'Unknown' };
    }
  }

  return {
    supported: false,
    browser: 'Unknown',
    recommendation: 'Chrome, Edge 등의 최신 브라우저를 사용해주세요'
  };
}

// Korean language detection and optimization
export function optimizeForKorean(): SpeechRecognitionOptions {
  return {
    language: 'ko-KR',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
  };
}

// Export types
export type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent };

// Global type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

