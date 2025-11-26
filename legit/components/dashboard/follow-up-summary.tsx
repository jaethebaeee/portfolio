"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, CalendarClock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClientClient } from "@/lib/supabase";
import { Consultation } from "@/lib/database.types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export function FollowUpSummary() {
  const [followUps, setFollowUps] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      const supabase = createClientClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch consultations with 'follow_up_needed' status
      // In a real app, you might want to filter by date range (e.g. overdue + today + next 3 days)
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patient:patients(name, phone)
        `)
        .eq('user_id', user.id)
        .eq('outcome', 'follow_up_needed')
        .order('follow_up_date', { ascending: true })
        .limit(5);

      if (!error && data) {
        setFollowUps(data as Consultation[]);
      }
      setLoading(false);
    };

    fetchFollowUps();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">재연락 예정 (Loading...)</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-primary" />
          재연락 필요 (Follow-up)
        </CardTitle>
        <Link href="/dashboard/consultations">
          <Button variant="ghost" size="sm" className="text-xs">
            전체 보기 <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {followUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              예정된 재연락 일정이 없습니다.
            </div>
          ) : (
            followUps.map((item) => {
              const isOverdue = item.follow_up_date && new Date(item.follow_up_date) < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <div key={item.id} className="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0">
                  <div className="space-y-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {(item as any).patient?.name}
                      <span className="text-xs font-normal text-muted-foreground">
                        {(item as any).patient?.phone}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {item.follow_up_notes || "메모 없음"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      isOverdue 
                        ? "bg-red-100 text-red-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      <CalendarClock className="h-3 w-3" />
                      {item.follow_up_date 
                        ? formatDistanceToNow(new Date(item.follow_up_date), { addSuffix: true, locale: ko })
                        : "날짜 미정"
                      }
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

