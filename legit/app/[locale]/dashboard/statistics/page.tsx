"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, MessageSquare, Calendar, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface MessageStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  by_channel: {
    kakao: number;
    sms: number;
  };
}

interface DailyStats {
  date: string;
  sent: number;
  failed: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchDailyStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/message-logs/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("통계 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const response = await fetch("/api/message-logs?limit=30");
      if (response.ok) {
        const data = await response.json();
        const logs = data.logs || [];
        
        // 날짜별로 그룹화
        const grouped = logs.reduce((acc: Record<string, DailyStats>, log: any) => {
          const date = new Date(log.created_at).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          });
          
          if (!acc[date]) {
            acc[date] = { date, sent: 0, failed: 0 };
          }
          
          if (log.status === "sent" || log.status === "delivered") {
            acc[date].sent++;
          } else if (log.status === "failed") {
            acc[date].failed++;
          }
          
          return acc;
        }, {});

        setDailyStats(Object.values(grouped).slice(-7)); // 최근 7일
      }
    } catch (error) {
      console.error("일별 통계 조회 오류:", error);
    }
  };

  const successRate = stats
    ? stats.total > 0
      ? ((stats.sent / stats.total) * 100).toFixed(1)
      : "0"
    : "0";

  const channelData = stats
    ? [
        { name: "카카오톡", value: stats.by_channel.kakao },
        { name: "SMS", value: stats.by_channel.sms },
      ]
    : [];

  const COLORS = ["#0088FE", "#00C49F"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          통계
        </h1>
        <p className="text-muted-foreground text-lg">
          마케팅 성과 통계를 확인하고 분석하세요
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">총 발송 메시지</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  전체 발송 건수
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">{successRate}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  발송 성공 건수: {stats?.sent || 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">실패 건수</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold text-destructive">
                  {stats?.failed || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  발송 실패 건수
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">대기 중</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats?.pending || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  발송 대기 중인 메시지
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              일별 발송 통계
            </CardTitle>
            <CardDescription>최근 7일간 메시지 발송 현황</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px]" />
            ) : dailyStats.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                데이터가 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#0088FE" name="성공" />
                  <Bar dataKey="failed" fill="#FF8042" name="실패" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              채널별 발송 현황
            </CardTitle>
            <CardDescription>카카오톡 vs SMS 발송 비율</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px]" />
            ) : channelData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                데이터가 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 상세 통계 */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            상세 통계
          </CardTitle>
          <CardDescription>발송 채널별 상세 정보</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">카카오톡</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.by_channel.kakao || 0}건
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        stats && stats.total > 0
                          ? (stats.by_channel.kakao / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SMS</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.by_channel.sms || 0}건
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${
                        stats && stats.total > 0
                          ? (stats.by_channel.sms / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
