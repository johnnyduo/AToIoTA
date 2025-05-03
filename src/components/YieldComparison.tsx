// src/components/YieldComparison.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, WalletIcon } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';

// Mock data for connected wallet
const mockData = [
  { month: 'Jan', actualYield: 4.2, aiYield: 5.8, predictedYield: 6.2 },
  { month: 'Feb', actualYield: 4.5, aiYield: 6.2, predictedYield: 6.8 },
  { month: 'Mar', actualYield: 4.8, aiYield: 6.5, predictedYield: 7.1 },
  { month: 'Apr', actualYield: 5.1, aiYield: 7.0, predictedYield: 7.5 },
  { month: 'May', actualYield: 5.4, aiYield: 7.2, predictedYield: 7.8 },
  { month: 'Jun', actualYield: 5.6, aiYield: 7.5, predictedYield: 8.2 },
];

// Prediction-only data for disconnected wallet
const predictionOnlyData = [
  { month: 'Jan', predictedYield: 6.2 },
  { month: 'Feb', predictedYield: 6.8 },
  { month: 'Mar', predictedYield: 7.1 },
  { month: 'Apr', predictedYield: 7.5 },
  { month: 'May', predictedYield: 7.8 },
  { month: 'Jun', predictedYield: 8.2 },
];

const YieldComparison = () => {
  const { isConnected } = useAccount();
  
  // Use full data if connected, prediction-only if disconnected
  const data = isConnected ? mockData : predictionOnlyData;
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-nebula-400" />
          <div>
            <CardTitle className="text-2xl">Yield Performance</CardTitle>
            <CardDescription>
              {isConnected 
                ? "Actual vs AI-Optimized vs Predicted Yield" 
                : "AI Predicted Yield (Connect wallet for full comparison)"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 17, 17, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="predictedYield" 
                  stroke="#EC4899" 
                  name="Predicted"
                  strokeWidth={2}
                  dot={{ fill: '#EC4899' }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center mt-4">
              {/* Removed content */}
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 17, 17, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actualYield" 
                  stroke="#10B981" 
                  name="Actual Yield"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="aiYield" 
                  stroke="#8B5CF6" 
                  name="AI-Optimized"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedYield" 
                  stroke="#EC4899" 
                  name="Predicted"
                  strokeWidth={2}
                  dot={{ fill: '#EC4899' }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YieldComparison;