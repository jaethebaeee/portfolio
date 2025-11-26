"use client";

import { EmailSettingsForm } from "@/components/settings/email-settings-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EmailSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">이메일 설정</h1>
          <p className="text-muted-foreground">
            SMTP 연동을 통해 회사 이메일로 발송을 설정합니다.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <EmailSettingsForm />
      </div>
    </div>
  );
}

