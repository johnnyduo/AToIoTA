
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

const PortfolioOverview = () => {
  const portfolioValue = 28654.32;
  const portfolioChange = 12.4;
  const isPositive = portfolioChange > 0;
  
  const portfolioData = [
    { name: 'AI', value: 35, color: '#8B5CF6' },
    { name: 'Meme', value: 20, color: '#EC4899' },
    { name: 'RWA', value: 25, color: '#0EA5E9' },
    { name: 'Big Cap', value: 20, color: '#10B981' },
  ];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 card-glass">
        <CardHeader>
          <CardTitle className="text-2xl">Portfolio Overview</CardTitle>
          <CardDescription>Total value across all categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end">
            <h2 className="text-4xl font-bold font-space">${portfolioValue.toLocaleString()}</h2>
            <div className={`ml-4 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              <span className="font-roboto-mono font-medium">{isPositive ? '+' : ''}{portfolioChange}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {portfolioData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-roboto-mono">{item.value}%</span>
                </div>
                <Progress 
                  value={item.value} 
                  className="h-2" 
                  // Fixed the error by removing the indicatorClassName prop
                  // and using style.backgroundColor instead
                  style={{ 
                    '--progress-background': 'linear-gradient(to right, #8B5CF6, #3B82F6)'
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground font-roboto-mono">
            Last updated: 19 Apr 2025, 14:32 UTC
          </div>
        </CardFooter>
      </Card>
      
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-2xl">Portfolio Distribution</CardTitle>
          <CardDescription>Allocation across categories</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-48 h-48 relative">
            <PieChart width={200} height={200}>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <TrendingUp className="h-6 w-6 text-nebula-400" />
              <span className="mt-1 font-roboto-mono text-sm">Total</span>
              <span className="font-space font-bold">100%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <ul className="w-full flex flex-wrap gap-2">
            {portfolioData.map((item) => (
              <li key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs">{item.name}</span>
              </li>
            ))}
          </ul>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
