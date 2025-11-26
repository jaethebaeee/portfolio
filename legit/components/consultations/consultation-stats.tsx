import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Calculator, TrendingUp } from "lucide-react";

interface ConsultationStatsProps {
  stats: {
    total: number;
    completed: number;
    booked: number;
    conversionRate: number;
    totalRevenue: number;
    totalQuoted: number;
    bySource: Record<string, { count: number; booked: number }>;
  };
}

export function ConsultationStats({ stats }: ConsultationStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 상담 건수</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            완료된 상담: {stats.completed}건
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">수술 예약/확정</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.booked}</div>
          <p className="text-xs text-muted-foreground">
            전환율: {stats.conversionRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 예약금</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalRevenue.toLocaleString()}원
          </div>
          <p className="text-xs text-muted-foreground">
            총 견적: {stats.totalQuoted.toLocaleString()}원
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최고 효율 채널</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {Object.entries(stats.bySource).length > 0 ? (
            (() => {
              const topSource = Object.entries(stats.bySource).reduce((a, b) => 
                (a[1].booked > b[1].booked ? a : b)
              );
              return (
                <>
                  <div className="text-2xl font-bold capitalize">
                    {topSource[0].replace('_', ' ')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {topSource[1].booked}건 예약 ({((topSource[1].booked / topSource[1].count) * 100).toFixed(0)}%)
                  </p>
                </>
              );
            })()
          ) : (
            <div className="text-sm text-muted-foreground">데이터 없음</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

