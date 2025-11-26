"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

export function MarketingGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (count: number = 1) => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/groq/generate-marketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          count: count,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.texts) {
          setGeneratedTexts(data.texts);
          toast.success(`${data.texts.length}개의 마케팅 문구가 생성되었습니다.`);
        } else if (data.text) {
          setGeneratedTexts([data.text]);
          toast.success("마케팅 문구가 생성되었습니다.");
        }
      } else {
        toast.error(data.error || "문구 생성에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error(error.message || "문구 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("클립보드에 복사되었습니다.");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error("복사에 실패했습니다.");
    }
  };

  const examplePrompts = [
    "생일 할인 이벤트 안내",
    "예약 확인 및 리마인더",
    "신규 고객 환영 쿠폰",
    "재방문 유도 프로모션",
    "리뷰 작성 감사 이벤트",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI 마케팅 문구 생성기
          </CardTitle>
          <CardDescription>
            Groq Llama3를 사용하여 의료 용어 없이 마케팅 문구만 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">프롬프트</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 생일 할인 이벤트 안내, 예약 확인 리마인더 등"
              rows={3}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 예시: {examplePrompts.join(", ")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleGenerate(1)}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  문구 생성
                </>
              )}
            </Button>
            <Button
              onClick={() => handleGenerate(3)}
              disabled={isGenerating}
              variant="outline"
            >
              3개 생성
            </Button>
          </div>

          {/* 생성된 문구 표시 */}
          {generatedTexts.length > 0 && (
            <div className="space-y-3 mt-6">
              <Label>생성된 마케팅 문구</Label>
              {generatedTexts.map((text, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm whitespace-pre-wrap flex-1">{text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(text, index)}
                        className="shrink-0"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 안내 사항 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-semibold mb-2">⚠️ 필터링 규칙</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 차단: 증상, 진단, 질병, 치료, 수술 등 의료 용어</li>
              <li>• 허용: 할인, 이벤트, 예약, 안내, 쿠폰, 프로모션 등 마케팅 키워드</li>
              <li>• 자동 검증: 생성된 문구는 자동으로 필터링됩니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

