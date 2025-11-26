"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Video } from "lucide-react";

export function TelemedicineSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telemedicine/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {
          default_provider: 'zoom',
          default_duration_minutes: 30,
          auto_record: false,
          require_password: true,
          waiting_room_enabled: true,
          require_recording_consent: true,
          consent_text: '이 상담은 품질 향상을 위해 녹화될 수 있습니다. 녹화에 동의하시나요?',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('설정을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/telemedicine/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('설정이 저장되었습니다');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '설정 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            화상 상담 설정
          </CardTitle>
          <CardDescription>
            화상 상담 플랫폼 연동 및 기본 설정을 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">일반 설정</TabsTrigger>
              {/* <TabsTrigger value="zoom">Zoom 연동</TabsTrigger>
              <TabsTrigger value="google">Google Meet 연동</TabsTrigger> */}
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>기본 플랫폼</Label>
                <Select
                  value={settings?.default_provider || 'zoom'}
                  onValueChange={(value) => setSettings({ ...settings, default_provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>기본 상담 시간 (분)</Label>
                <Input
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={settings?.default_duration_minutes || 30}
                  onChange={(e) => setSettings({ ...settings, default_duration_minutes: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-record"
                    checked={settings?.auto_record || false}
                    onCheckedChange={(checked) => setSettings({ ...settings, auto_record: checked })}
                  />
                  <Label htmlFor="auto-record" className="cursor-pointer">
                    자동 녹화 활성화
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="require-password"
                    checked={settings?.require_password !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, require_password: checked })}
                  />
                  <Label htmlFor="require-password" className="cursor-pointer">
                    비밀번호 필수
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="waiting-room"
                    checked={settings?.waiting_room_enabled !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, waiting_room_enabled: checked })}
                  />
                  <Label htmlFor="waiting-room" className="cursor-pointer">
                    대기실 활성화
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="require-consent"
                    checked={settings?.require_recording_consent !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, require_recording_consent: checked })}
                  />
                  <Label htmlFor="require-consent" className="cursor-pointer">
                    녹화 동의 필수
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>녹화 동의 문구</Label>
                <Textarea
                  value={settings?.consent_text || ''}
                  onChange={(e) => setSettings({ ...settings, consent_text: e.target.value })}
                  rows={3}
                  placeholder="이 상담은 품질 향상을 위해 녹화될 수 있습니다. 녹화에 동의하시나요?"
                />
              </div>
            </TabsContent>

            {/* <TabsContent value="zoom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Zoom API Key</Label>
                <Input
                  type="password"
                  value={settings?.zoom_api_key || ''}
                  onChange={(e) => setSettings({ ...settings, zoom_api_key: e.target.value })}
                  placeholder="Zoom API Key"
                />
              </div>

              <div className="space-y-2">
                <Label>Zoom API Secret</Label>
                <Input
                  type="password"
                  value={settings?.zoom_api_secret || ''}
                  onChange={(e) => setSettings({ ...settings, zoom_api_secret: e.target.value })}
                  placeholder="Zoom API Secret"
                />
              </div>

              <div className="space-y-2">
                <Label>Zoom Account ID (Server-to-Server OAuth용)</Label>
                <Input
                  value={settings?.zoom_account_id || ''}
                  onChange={(e) => setSettings({ ...settings, zoom_account_id: e.target.value })}
                  placeholder="Zoom Account ID"
                />
                <p className="text-sm text-muted-foreground">
                  Server-to-Server OAuth를 사용하려면 Account ID가 필요합니다
                </p>
              </div>
            </TabsContent>

            <TabsContent value="google" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Google Client ID</Label>
                <Input
                  value={settings?.google_client_id || ''}
                  onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
                  placeholder="Google OAuth Client ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Google Client Secret</Label>
                <Input
                  type="password"
                  value={settings?.google_client_secret || ''}
                  onChange={(e) => setSettings({ ...settings, google_client_secret: e.target.value })}
                  placeholder="Google OAuth Client Secret"
                />
              </div>

              <div className="space-y-2">
                <Label>Google Refresh Token</Label>
                <Input
                  type="password"
                  value={settings?.google_refresh_token || ''}
                  onChange={(e) => setSettings({ ...settings, google_refresh_token: e.target.value })}
                  placeholder="Google OAuth Refresh Token"
                />
                <p className="text-sm text-muted-foreground">
                  Google Calendar API 접근을 위한 Refresh Token이 필요합니다
                </p>
              </div>
            </TabsContent> */}
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

