"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export function EmailSettingsForm() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [settings, setSettings] = useState({
    sender_name: "",
    sender_email: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_password: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/email');
      const data = await res.json();
      if (data.settings) {
        setSettings({
          sender_name: data.settings.sender_name || "",
          sender_email: data.settings.sender_email || "",
          smtp_host: data.settings.smtp_host || "",
          smtp_port: String(data.settings.smtp_port || "587"),
          smtp_user: data.settings.smtp_user || "",
          smtp_password: data.settings.smtp_password || ""
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("설정을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      toast.success("이메일 설정이 저장되었습니다.");
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.sender_email || !settings.smtp_host) {
      toast.error("필수 정보를 입력해주세요.");
      return;
    }

    setTesting(true);
    try {
      // Prompt for recipient email
      const testEmail = prompt("테스트 이메일을 받을 주소를 입력하세요:", settings.sender_email);
      if (!testEmail) {
        setTesting(false);
        return;
      }

      const res = await fetch('/api/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: settings.smtp_host,
          port: settings.smtp_port,
          user: settings.smtp_user,
          password: settings.smtp_password,
          fromEmail: settings.sender_email,
          toEmail: testEmail
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`테스트 이메일이 ${testEmail}로 전송되었습니다.`);
    } catch (error: any) {
      toast.error(`테스트 실패: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP 설정</CardTitle>
        <CardDescription>
          회사 이메일 계정(SMTP)을 연동하여 시스템 이메일을 발송합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>발신자 이름</Label>
            <Input 
              placeholder="예: 닥터스플로우" 
              value={settings.sender_name}
              onChange={(e) => setSettings({...settings, sender_name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>발신자 이메일</Label>
            <Input 
              placeholder="noreply@company.com" 
              value={settings.sender_email}
              onChange={(e) => setSettings({...settings, sender_email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>SMTP 호스트</Label>
          <Input 
            placeholder="예: smtp.gmail.com" 
            value={settings.smtp_host}
            onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
                <Label>포트</Label>
                <Input 
                  placeholder="587" 
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
                />
            </div>
            <div className="space-y-2 col-span-2">
                <Label>사용자명 (ID)</Label>
                <Input 
                  placeholder="user@company.com" 
                  value={settings.smtp_user}
                  onChange={(e) => setSettings({...settings, smtp_user: e.target.value})}
                />
            </div>
        </div>

        <div className="space-y-2">
          <Label>비밀번호</Label>
          <Input 
            type="password"
            placeholder="SMTP 비밀번호 또는 앱 비밀번호" 
            value={settings.smtp_password}
            onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            * Gmail 사용 시 2단계 인증 설정 후 '앱 비밀번호'를 사용해야 합니다.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleTest} disabled={testing || saving}>
          {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          연동 테스트
        </Button>
        <Button onClick={handleSave} disabled={saving || testing}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          설정 저장
        </Button>
      </CardFooter>
    </Card>
  );
}

