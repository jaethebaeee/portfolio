"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, UserMinus, ThumbsDown, Activity, DollarSign, Wallet } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  AreaChart,
  Area
} from 'recharts';

export function ExecutiveDashboard() {
  // Mock Data for KPI Cards
  const kpis = [
    {
      title: "이번 달 예상 매출",
      value: "₩128,500,000",
      trend: "+15% vs 지난달",
      color: "text-emerald-600",
      icon: DollarSign,
      bg: "bg-emerald-100"
    },
    {
      title: "통신비 절감액",
      value: "₩850,000",
      trend: "알림톡 전환 효과",
      color: "text-blue-600",
      icon: Wallet,
      bg: "bg-blue-100"
    },
    {
      title: "상담 동의율",
      value: "68%",
      trend: "+5% 상승",
      color: "text-purple-600",
      icon: TrendingUp,
      bg: "bg-purple-100"
    },
    {
      title: "노쇼 (No-Show)",
      value: "2.1%",
      trend: "전월 대비 감소",
      color: "text-orange-600",
      icon: UserMinus,
      bg: "bg-orange-100"
    }
  ];

  // Funnel Data: Inquiry -> Consult -> Surgery
  const funnelData = [
    { name: '신규 문의', value: 150, fill: '#94a3b8' },
    { name: '방문 상담', value: 85, fill: '#60a5fa' },
    { name: '수술 예약', value: 42, fill: '#3b82f6' },
    { name: '수술 완료', value: 38, fill: '#2563eb' },
  ];

  // Procedure Breakdown
  const procedureData = [
    { name: '눈 성형', value: 45, color: '#3b82f6' },
    { name: '코 성형', value: 30, color: '#60a5fa' },
    { name: '리프팅', value: 15, color: '#93c5fd' },
    { name: '기타', value: 10, color: '#cbd5e1' },
  ];

  // Cost Savings Data (Linear Chart)
  const savingsData = [
    { name: '1주', sms: 50000, kakao: 25000 },
    { name: '2주', sms: 55000, kakao: 27000 },
    { name: '3주', sms: 48000, kakao: 24000 },
    { name: '4주', sms: 60000, kakao: 30000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${kpi.bg}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-2xl font-bold tracking-tight mt-1">{kpi.value}</h3>
                  <p className={`text-xs font-medium mt-1 inline-flex items-center gap-1 ${kpi.color}`}>
                    {kpi.trend}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Main Funnel Chart */}
        <Card className="col-span-4 shadow-sm border-none">
          <CardHeader>
            <CardTitle>환자 유입 퍼널 (Funnel)</CardTitle>
            <CardDescription>문의에서 수술까지의 전환율을 분석합니다.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Procedure Mix (Donut) */}
        <Card className="col-span-3 shadow-sm border-none">
          <CardHeader>
            <CardTitle>시술 카테고리 비중</CardTitle>
            <CardDescription>가장 인기 있는 시술 항목입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="200%">
                <PieChart>
                  <Pie
                    data={procedureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {procedureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-600">
                {procedureData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name} ({entry.value}%)
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Cost Savings Chart */}
      <Card className="shadow-sm border-none bg-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            비용 절감 효과
          </CardTitle>
          <CardDescription>기존 문자(SMS) 대비 알림톡 사용으로 인한 절감액입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKakao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip />
                <Area type="monotone" dataKey="sms" name="기존 문자 비용" stroke="#94a3b8" fillOpacity={1} fill="url(#colorSms)" />
                <Area type="monotone" dataKey="kakao" name="알림톡 비용 (현재)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorKakao)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
