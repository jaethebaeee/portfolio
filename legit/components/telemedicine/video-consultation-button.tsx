"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Loader2, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Appointment } from "@/lib/database.types";

interface VideoConsultationButtonProps {
  appointment: Appointment;
  onSuccess?: () => void;
}

export function VideoConsultationButton({ appointment, onSuccess }: VideoConsultationButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualLink, setManualLink] = useState("");

  // If already has a meeting URL, show join button
  if (appointment.meeting_url) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(appointment.meeting_url!, '_blank')}
          className="gap-2"
        >
          <Video className="h-4 w-4" />
          화상 상담 참여
        </Button>
        {appointment.meeting_password && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(appointment.meeting_password!);
              toast.success('비밀번호가 복사되었습니다');
            }}
          >
            비밀번호 복사
          </Button>
        )}
      </div>
    );
  }

  const handleSaveLink = async () => {
    if (!manualLink) {
      toast.error('링크를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // Use the simple update endpoint instead of the complex create endpoint
      const response = await fetch('/api/telemedicine/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointment.id,
          updates: {
            meetingUrl: manualLink,
            recordingConsent: false
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save meeting link');
      }

      toast.success('상담 링크가 저장되었습니다');
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      toast.error('링크 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LinkIcon className="h-4 w-4" />
          상담 링크 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>화상 상담 링크 등록</DialogTitle>
          <DialogDescription>
            Zoom, Google Meet 등의 화상 회의 링크를 직접 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>회의 링크 (URL)</Label>
            <Input
              placeholder="https://zoom.us/j/123456789"
              value={manualLink}
              onChange={(e) => setManualLink(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSaveLink} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장하기'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

