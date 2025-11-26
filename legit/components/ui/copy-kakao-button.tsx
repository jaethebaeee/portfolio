"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, MessageSquare, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatAppointmentMessage, type MessageTemplate, type AppointmentMessageData } from "@/lib/kakao-message-formatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CopyKakaoButtonProps {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  type?: string;
  hospitalName?: string;
  hospitalPhone?: string;
  notes?: string;
}

const templateLabels: Record<MessageTemplate, string> = {
  appointment_confirmation: '예약 확인',
  appointment_reminder: '예약 리마인더',
  appointment_completed: '방문 감사',
  custom: '커스텀',
};

export function CopyKakaoButton({ 
  patientName, 
  appointmentDate, 
  appointmentTime, 
  type,
  hospitalName,
  hospitalPhone,
  notes 
}: CopyKakaoButtonProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>('appointment_confirmation');

  const handleCopy = (template: MessageTemplate = selectedTemplate) => {
    const messageData: AppointmentMessageData = {
      patientName,
      appointmentDate,
      appointmentTime,
      type,
      hospitalName: hospitalName || process.env.NEXT_PUBLIC_HOSPITAL_NAME,
      hospitalPhone: hospitalPhone || '02-1234-5678',
      notes,
    };

    const message = formatAppointmentMessage(messageData, template);

    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("카카오톡 발송용 문구가 복사되었습니다.", {
      description: `${templateLabels[template]} 형식으로 복사되었습니다.`,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          title="카카오톡 발송용 문구 복사"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">복사됨</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              <span>카카오 복사</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => {
            setSelectedTemplate('appointment_confirmation');
            handleCopy('appointment_confirmation');
          }}
          className="cursor-pointer"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          예약 확인
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setSelectedTemplate('appointment_reminder');
            handleCopy('appointment_reminder');
          }}
          className="cursor-pointer"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          예약 리마인더
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setSelectedTemplate('appointment_completed');
            handleCopy('appointment_completed');
          }}
          className="cursor-pointer"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          방문 감사
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

