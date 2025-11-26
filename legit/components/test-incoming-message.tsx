"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export function TestIncomingMessage() {
  const [senderPhone, setSenderPhone] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!senderPhone || !messageContent) {
      toast.error("전화번호와 메시지 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/webhooks/incoming-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: senderPhone,
          content: messageContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.triggered > 0) {
            toast.success(`${data.triggered}개의 워크플로우가 실행되었습니다!`);
        } else {
            toast.info("수신되었으나 매칭되는 키워드/환자가 없습니다.");
        }
      } else {
        toast.error(data.error || "전송 실패");
      }
    } catch (error) {
      console.error(error);
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          키워드 응답 테스트
        </CardTitle>
        <CardDescription>
          고객이 보낸 메시지를 시뮬레이션하여 키워드 트리거를 테스트합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>발신자 전화번호 (등록된 환자 번호)</Label>
          <Input 
            placeholder="010-1234-5678" 
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>메시지 내용 (키워드 포함)</Label>
          <Textarea 
            placeholder="예: 병원 위치가 어디인가요?" 
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
        </div>
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700" 
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? <span className="animate-pulse">전송 중...</span> : <><Send className="w-4 h-4 mr-2" /> 메시지 수신 시뮬레이션</>}
        </Button>
      </CardContent>
    </Card>
  );
}

