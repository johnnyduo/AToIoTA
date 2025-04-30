// src/components/PortfolioOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const PortfolioOverview = () => {
  const { allocations, refreshAllocations } = useBlockchain();
  const { address, isConnected } = useAccount();
  
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  const isPositive = portfolioChange > 0;
  
  // Refresh allocations on mount
  useEffect(() => {
    refreshAllocations();
  }, [refreshAllocations]);
  
  // Fetch wallet balance for portfolio value
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address) {
        // Use default value if not connected
        setPortfolioValue(28654.32);
        setPortfolioChange(12.4);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get provider from window.ethereum (MetaMask)
        const provider = new ethers.providers.Web3Provider((window as any).ethereum);
        
        // Get balance in wei
        const balanceWei = await provider.getBalance(address);
        
        // Convert to ether
        const balanceEth = ethers.utils.formatEther(balanceWei);
        
        // Fetch IOTA price from CoinGecko (or use a mock price for development)
        let iotaPrice = 0.18; // Default mock price
        
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=iota&vs_currencies=usd');
          const data = await response.json();
          iotaPrice = data.iota.usd;
        } catch (error) {
          console.error('Error fetching IOTA price:', error);
          // Continue with mock price
        }
        
        // Calculate portfolio value
        const calculatedValue = parseFloat(balanceEth) * iotaPrice;
        
        // Set portfolio value with a minimum of $100 for better UI display
        setPortfolioValue(Math.max(calculatedValue, 100));
        
        // Generate a realistic portfolio change (mock data)
        const randomChange = (Math.random() * 20) - 10; // -10% to +10%
        setPortfolioChange(parseFloat(randomChange.toFixed(2)));
        
        // Update last updated time
        setLastUpdated(new Date());
        
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        // Fallback to default values
        setPortfolioValue(28654.32);
        setPortfolioChange(12.4);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    
    // Set up a refresh interval (every 60 seconds)
    const intervalId = setInterval(() => {
      fetchBalance();
      refreshAllocations(); // Also refresh allocations periodically
    }, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [address, isConnected, refreshAllocations]);
  
  // Format the portfolio data from allocations
  const portfolioData = allocations.map(item => ({
    name: item.name,
    value: item.allocation,
    color: item.color
  }));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 card-glass">
        <CardHeader>
          <CardTitle className="text-2xl">Portfolio Overview</CardTitle>
          <CardDescription>Total value across all categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-40 bg-cosmic-800" />
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-nebula-400" />
                  <span className="text-xs text-muted-foreground">Fetching balance...</span>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-bold font-space">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
                <div className={`ml-4 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  <span className="font-roboto-mono font-medium">{isPositive ? '+' : ''}{portfolioChange}%</span>
                </div>
              </>
            )}
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
                  style={{ 
                    '--progress-background': `linear-gradient(to right, ${item.color}, ${item.color}cc)`
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground font-roboto-mono">
            Last updated: {format(lastUpdated, 'dd MMM yyyy, HH:mm')} UTC
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
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-nebula-400" />
              ) : (
                <>
                  <TrendingUp className="h-6 w-6 text-nebula-400" />
                  <span className="mt-1 font-roboto-mono text-sm">Total</span>
                  <span className="font-space font-bold">100%</span>
                </>
              )}
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