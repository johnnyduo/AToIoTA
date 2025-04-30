// src/components/PerformanceChart.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { WalletIcon } from 'lucide-react';

const timeRanges = [
  { id: '1d', name: '1D' },
  { id: '1w', name: '1W' },
  { id: '1m', name: '1M' },
  { id: '3m', name: '3M' },
  { id: '1y', name: '1Y' },
  { id: 'all', name: 'All' },
];

interface ChartData {
  date: string;
  value: number;
}

// Mock data for different time ranges
const mockChartData: Record<string, ChartData[]> = {
  '1d': Array(24).fill(0).map((_, i) => {
    const hour = i.toString().padStart(2, '0');
    const baseValue = 28000;
    const randomFactor = Math.random() * 1000 - 500;
    const trendFactor = i < 12 ? -i * 50 : (i - 12) * 60;
    return {
      date: `${hour}:00`,
      value: Math.max(baseValue + randomFactor + trendFactor, baseValue * 0.9),
    };
  }),
  '1w': Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const baseValue = 27500;
    const randomFactor = Math.random() * 1500 - 750;
    const trendFactor = i * 200;
    return {
      date: day,
      value: Math.max(baseValue + randomFactor + trendFactor, baseValue * 0.85),
    };
  }),
  '1m': Array(30).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const day = `${date.getMonth() + 1}/${date.getDate()}`;
    const baseValue = 25000;
    const randomFactor = Math.random() * 2000 - 1000;
    const trendFactor = i * 150;
    return {
      date: day,
      value: Math.max(baseValue + randomFactor + trendFactor, baseValue * 0.8),
    };
  }),
  '3m': Array(12).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (90 - i * 7));
    const day = `${date.getMonth() + 1}/${date.getDate()}`;
    const baseValue = 22000;
    const randomFactor = Math.random() * 3000 - 1500;
    const trendFactor = i * 600;
    return {
      date: day,
      value: Math.max(baseValue + randomFactor + trendFactor, baseValue * 0.75),
    };
  }),
  '1y': Array(12).fill(0).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const baseValue = 15000;
    const randomFactor = Math.random() * 4000 - 2000;
    const trendFactor = i * 1200;
    return {
      date: month,
      value: Math.max(baseValue + randomFactor + trendFactor, baseValue * 0.7),
    };
  }),
  'all': Array(5).fill(0).map((_, i) => {
    const year = new Date().getFullYear() - (4 - i);
    const baseValue = 5000;
    const randomFactor = Math.random() * 5000 - 2500;
    const trendFactor = i * 6000;
    return {
      date: year.toString(),
      value: Math.max(baseValue + randomFactor + trendFactor, baseValue * 0.6),
    };
  }),
};

// Neutral data for disconnected wallet state
const neutralChartData: Record<string, ChartData[]> = {
  '1d': Array(24).fill(0).map((_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { date: `${hour}:00`, value: 0 };
  }),
  '1w': Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { date: day, value: 0 };
  }),
  '1m': Array(30).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const day = `${date.getMonth() + 1}/${date.getDate()}`;
    return { date: day, value: 0 };
  }),
  '3m': Array(12).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (90 - i * 7));
    const day = `${date.getMonth() + 1}/${date.getDate()}`;
    return { date: day, value: 0 };
  }),
  '1y': Array(12).fill(0).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { date: month, value: 0 };
  }),
  'all': Array(5).fill(0).map((_, i) => {
    const year = new Date().getFullYear() - (4 - i);
    return { date: year.toString(), value: 0 };
  }),
};

const customTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-background border border-[#ffffff1a] p-3 rounded-md shadow-lg">
        <p className="label font-roboto-mono text-sm">{`${label}`}</p>
        <p className="value font-space font-bold text-nebula-400">{`$${payload[0].value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}</p>
      </div>
    );
  }

  return null;
};

const PerformanceChart = () => {
  const [timeRange, setTimeRange] = useState('1m');
  const { isConnected } = useAccount();
  
  // Use neutral data if wallet is not connected
  const data = isConnected ? mockChartData[timeRange] : neutralChartData[timeRange];
  
  return (
    <Card className="card-glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Portfolio Performance</CardTitle>
        <div className="flex space-x-1">
          {timeRanges.map((range) => (
            <Button
              key={range.id}
              variant="ghost"
              size="sm"
              className={`px-3 rounded-lg ${
                timeRange === range.id 
                ? 'bg-nebula-600 text-white' 
                : 'hover:bg-white/10'
              }`}
              onClick={() => setTimeRange(range.id)}
              disabled={!isConnected}
            >
              {range.name}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!isConnected ? (
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <WalletIcon className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-muted-foreground text-center">Connect your wallet to view your portfolio performance</p>
            <Button variant="outline" className="mt-4 bg-nebula-600/20 hover:bg-nebula-600/30">
              <WalletIcon className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[(dataMin: number) => dataMin * 0.95, (dataMax: number) => dataMax * 1.05 || 100]}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  width={60}
                />
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <Tooltip content={customTooltip} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  fillOpacity={1}
                  fill="url(#colorGradient)" 
                  animationDuration={1000}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;