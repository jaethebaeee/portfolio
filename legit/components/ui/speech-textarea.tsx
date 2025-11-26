"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Volume2, Square, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EnhancedSpeechRecognition, optimizeForKorean, getBrowserSupport } from "@/lib/speech-recognition";

interface SpeechTextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onValueChange?: (value: string) => void; // Legacy support
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function SpeechTextarea({
  id,
  value,
  onChange,
  onValueChange,
  placeholder = "음성 입력을 위해 마이크 버튼을 클릭하세요...",
  className,
  disabled = false,
  rows = 4,
  language = 'ko-KR',
  continuous = true,
  interimResults = true,
}: SpeechTextareaProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const recognitionRef = useRef<EnhancedSpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Browser support check
  const browserSupport = getBrowserSupport();
  const isSupported = browserSupport.supported;

  useEffect(() => {
    if (!isSupported) return;

    // Initialize enhanced speech recognition
    const recognition = new EnhancedSpeechRecognition({
      language,
      continuous,
      interimResults,
      onStart: () => {
        setIsListening(true);
        setIsProcessing(false);
        setTranscript("");
        setInterimTranscript("");
        toast.info("음성 인식을 시작합니다. 말씀하세요...");
      },
      onResult: (text, isFinal) => {
        if (isFinal) {
          const newValue = value ? `${value} ${text}` : text;
          onChange(newValue.trim());
          if (onValueChange) onValueChange(newValue.trim());

          setTranscript(prev => prev + text);
          setLastTranscript(text);
        } else {
          setInterimTranscript(text);
        }
      },
      onEnd: () => {
        setIsListening(false);
        setIsProcessing(false);
        setInterimTranscript("");

        if (lastTranscript) {
          toast.success(`음성 입력 완료: "${lastTranscript.slice(0, 50)}${lastTranscript.length > 50 ? '...' : ''}"`);
          setLastTranscript("");
        }
      },
      onError: (error) => {
        setIsListening(false);
        setIsProcessing(false);
        setInterimTranscript("");
        toast.error(error);
      },
    });

    recognitionRef.current = recognition;

    return () => {
      recognition.destroy();
    };
  }, [language, continuous, interimResults, onChange, onValueChange, value, isSupported]);

  const startListening = async () => {
    if (!isSupported) {
      toast.error(browserSupport.recommendation || '이 브라우저에서는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      await recognitionRef.current?.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast.error('음성 인식을 시작할 수 없습니다.');
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setLastTranscript("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Combined text for display
  const displayText = value + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          id={id}
          ref={textareaRef}
          value={displayText}
          onChange={(e) => {
            onChange(e.target.value);
            if (onValueChange) onValueChange(e.target.value);
          }}
          placeholder={placeholder}
          className={cn(
            className,
            isListening && "ring-2 ring-red-500 ring-opacity-50 border-red-300",
            interimTranscript && "bg-blue-50/30 dark:bg-blue-950/30",
            isProcessing && "bg-yellow-50/30 dark:bg-yellow-950/30"
          )}
          disabled={disabled}
          rows={rows}
        />

        {/* Recording indicator */}
        {isListening && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              녹음 중
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              처리 중
            </div>
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={startListening}
            disabled={disabled || !isSupported}
            className="flex items-center gap-2"
            title={isListening ? "음성 입력 중지" : "음성 입력 시작"}
          >
            {isListening ? (
              <>
                <Square className="h-4 w-4" />
                중지
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                음성 입력
              </>
            )}
          </Button>

          {(transcript || lastTranscript) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearTranscript}
              className="text-muted-foreground hover:text-foreground"
              title="인식된 텍스트 지우기"
            >
              <Check className="h-3 w-3 mr-1" />
              완료
            </Button>
          )}
        </div>

        {/* Status and browser info */}
        <div className="text-xs text-muted-foreground">
          {!isSupported ? (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {browserSupport.browser} 미지원
            </span>
          ) : isListening ? (
            <span className="text-red-500">🎤 듣는 중...</span>
          ) : lastTranscript ? (
            <span className="text-green-500">✅ 입력 완료</span>
          ) : (
            <span className="text-blue-600">🇰🇷 한국어 지원</span>
          )}
        </div>
      </div>

      {/* Browser compatibility note */}
      {!isSupported && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-md border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>음성 인식 호환성:</strong> {browserSupport.recommendation || `${browserSupport.browser} 브라우저에서는 음성 인식을 지원하지 않습니다.`}
              <br />
              <strong>권장:</strong> Chrome 또는 Edge 브라우저를 사용해주세요.
            </div>
          </div>
        </div>
      )}

      {/* Korean optimization note */}
      {isSupported && language === 'ko-KR' && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          💡 한국어 최적화됨 - 명확한 발음으로 더 정확한 인식
        </div>
      )}
    </div>
  );
}