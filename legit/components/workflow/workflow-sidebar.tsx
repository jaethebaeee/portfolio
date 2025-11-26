"use client";

import { Card } from "@/components/ui/card";
import { Clock, MessageSquare, AlertCircle, PlayCircle, GitBranch, Calendar } from "lucide-react";

export function WorkflowSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, type: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r bg-muted/10 p-4 flex flex-col gap-4 overflow-y-auto h-full">
      <div className="font-semibold text-sm text-muted-foreground mb-2">노드 라이브러리</div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase">트리거</h3>
          <div className="grid gap-2">
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'trigger', 'surgery_completed')}
            >
              <Clock className="h-4 w-4 text-blue-500" />
              수술 완료
            </div>
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'trigger', 'appointment_created')}
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              예약 생성
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase">액션</h3>
          <div className="grid gap-2">
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'action', 'send_kakao')}
            >
              <MessageSquare className="h-4 w-4 text-green-500" />
              카카오톡 발송
            </div>
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'action', 'send_sms')}
            >
              <MessageSquare className="h-4 w-4 text-green-500" />
              SMS 발송
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase">흐름 제어</h3>
          <div className="grid gap-2">
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'condition', 'condition')}
            >
              <GitBranch className="h-4 w-4 text-orange-500" />
              조건 분기 (IF)
            </div>
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'delay', 'delay')}
            >
              <Clock className="h-4 w-4 text-purple-500" />
              지연 (Delay)
            </div>
            <div 
              className="bg-background border rounded-md p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-2 text-sm shadow-sm"
              draggable
              onDragStart={(e) => onDragStart(e, 'time_window', 'time_window')}
            >
              <Calendar className="h-4 w-4 text-orange-500" />
              발송 가능 시간 (Time Window)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

