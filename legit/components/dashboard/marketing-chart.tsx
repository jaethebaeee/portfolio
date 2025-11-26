"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";

const data = [
  { name: "1월", leads: 45, bookings: 32 },
  { name: "2월", leads: 52, bookings: 38 },
  { name: "3월", leads: 48, bookings: 42 },
  { name: "4월", leads: 61, bookings: 45 },
  { name: "5월", leads: 55, bookings: 48 },
  { name: "6월", leads: 67, bookings: 54 },
];

export function MarketingChart() {
  const { theme } = useTheme();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis 
            dataKey="name" 
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
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Area
            type="monotone"
            dataKey="leads"
            name="신규 문의"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLeads)"
          />
          <Area
            type="monotone"
            dataKey="bookings"
            name="수술 예약"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBookings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

