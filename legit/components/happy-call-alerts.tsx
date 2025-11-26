"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle, ImageIcon, Phone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Alert {
  id: string;
  patient_id: string;
  response_type: 'pain_level' | 'photo';
  response_value: string;
  severity_level: 'high' | 'normal';
  created_at: string;
  patient: {
    name: string;
    phone: string;
  };
}

export function HappyCallAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/happy-call/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // 1분마다 폴링 (실시간성 확보)
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/happy-call/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_id: id })
      });

      if (res.ok) {
        toast.success("확인 완료 처리되었습니다.");
        // 목록에서 제거 (낙관적 업데이트)
        setAlerts(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error("처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error("네트워크 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            해피콜 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            해피콜 알림
          </CardTitle>
          <CardDescription>현재 확인이 필요한 알림이 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            긴급 확인 필요 ({alerts.length})
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse">Live</Badge>
        </div>
        <CardDescription>
          통증 호소 또는 수술 부위 사진이 업로드되었습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg bg-white hover:bg-slate-50 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{alert.patient?.name || '알 수 없음'}</span>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {alert.patient?.phone}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {alert.response_type === 'pain_level' ? (
                  <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                    통증 {alert.response_value}점
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    사진 업로드
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ko })}
                </span>
              </div>

              {alert.response_type === 'photo' && (
                 <a 
                   href={alert.response_value} 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-xs text-blue-500 hover:underline block mt-1"
                 >
                   사진 보기 &rarr;
                 </a>
              )}
            </div>

            <Button 
              size="sm" 
              variant="ghost" 
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleResolve(alert.id)}
            >
              <CheckCircle className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

