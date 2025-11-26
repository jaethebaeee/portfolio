"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Phone, CheckCircle2, Loader2, Building2, Megaphone } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecutiveDashboard } from "@/components/executive-dashboard";

interface AnalyticsData {
  overview: {
    total: number;
    success: number;
    failed: number;
    pending: number;
    deliveryRate: number;
  };
  channels: {
    kakao: number;
    sms: number;
  };
  trend: Array<{ date: string; sent: number; failed: number }>;
  topWorkflows: Array<{ name: string; count: number; success: number }>;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/stats?range=${range}`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
        toast.error("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">통합 분석 대시보드</h1>
          <p className="text-muted-foreground mt-1">
            병원의 경영 지표와 마케팅 성과를 한눈에 확인하세요.
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">최근 7일</SelectItem>
            <SelectItem value="30d">최근 30일</SelectItem>
            <SelectItem value="90d">최근 3개월</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="executive" className="gap-2">
            <Building2 className="w-4 h-4" />
            경영/매출 분석
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Megaphone className="w-4 h-4" />
            마케팅/발송 성과
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Executive Dashboard (Business Logic) */}
        <TabsContent value="executive">
          <ExecutiveDashboard />
        </TabsContent>

        {/* Tab 2: Campaign Stats (Original Messaging Logic) */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 발송 메시지</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.total.toLocaleString()}건</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {range === '7d' ? '최근 7일' : range === '30d' ? '최근 30일' : '최근 3개월'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">발송 성공률</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{data.overview.deliveryRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  실패 {data.overview.failed}건
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">카카오톡 비중</CardTitle>
                <MessageSquare className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.total > 0 
                    ? Math.round((data.channels.kakao / data.overview.total) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.channels.kakao.toLocaleString()}건 발송
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS/LMS 비중</CardTitle>
                <Phone className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.total > 0 
                    ? Math.round((data.channels.sms / data.overview.total) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.channels.sms.toLocaleString()}건 발송
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>일별 발송 현황</CardTitle>
                <CardDescription>
                  일별 메시지 발송 성공 및 실패 추이
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => {
                          const d = new Date(str);
                          return `${d.getMonth()+1}/${d.getDate()}`;
                        }}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sent" 
                        name="발송 성공" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorSent)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="failed" 
                        name="발송 실패" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorFailed)" 
                      />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>상위 워크플로우</CardTitle>
                <CardDescription>
                  가장 많이 실행된 워크플로우 TOP 5
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.topWorkflows.map((wf, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                            {wf.name}
                          </p>
                          <div className="text-sm text-muted-foreground font-mono">
                            {wf.count.toLocaleString()}회
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${(wf.count / (data.topWorkflows[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.topWorkflows.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      데이터가 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
