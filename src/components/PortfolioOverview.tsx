// src/components/PortfolioOverview.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, Droplets, WalletIcon } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'ethers'; // Import formatEther directly for ethers v6
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { modal } from '@/lib/appkit';
import { useIsMobile } from '@/hooks/use-mobile';

const PortfolioOverview = () => {
  const { allocations, refreshAllocations } = useBlockchain();
  const { address, isConnected } = useAccount();
  const isMobile = useIsMobile();
  
  // Use wagmi's useBalance hook
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address,
    enabled: isConnected && !!address,
  });
  
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [iotaPrice, setIotaPrice] = useState(0.18); // Default mock price
  
  const isPositive = portfolioChange > 0;
  
  // Refresh allocations on mount
  useEffect(() => {
    refreshAllocations();
  }, [refreshAllocations]);
  
  // Fetch IOTA price from CoinGecko
  useEffect(() => {
    const fetchIotaPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=iota&vs_currencies=usd');
        const data = await response.json();
        if (data && data.iota && data.iota.usd) {
          setIotaPrice(data.iota.usd);
        }
      } catch (error) {
        console.error('Error fetching IOTA price:', error);
        // Continue with mock price
      }
    };
    
    fetchIotaPrice();
    
    // Refresh price every 5 minutes
    const intervalId = setInterval(fetchIotaPrice, 300000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate portfolio value when balance or price changes
  useEffect(() => {
    if (!isConnected || !address) {
      setPortfolioValue(0);
      setPortfolioChange(0);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(isBalanceLoading);
    
    if (balanceData) {
      try {
        // Convert balance to number using ethers v6 syntax
        const balanceInEth = parseFloat(formatEther(balanceData.value));
        
        // Calculate portfolio value
        const calculatedValue = balanceInEth * iotaPrice;
        
        // Set portfolio value
        setPortfolioValue(calculatedValue);
        
        // Generate a realistic portfolio change (mock data)
        const randomChange = (Math.random() * 20) - 10; // -10% to +10%
        setPortfolioChange(parseFloat(randomChange.toFixed(2)));
        
        // Update last updated time
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error calculating portfolio value:', error);
        setPortfolioValue(0);
        setPortfolioChange(0);
      }
    }
  }, [balanceData, isBalanceLoading, isConnected, address, iotaPrice]);
  
  // Format the portfolio data from allocations
  const portfolioData = allocations.map(item => ({
    name: item.name,
    value: item.allocation,
    color: item.color
  }));
  
  // Default data for disconnected state
  const defaultPortfolioData = [
    { name: 'Connect Wallet', value: 100, color: '#6B7280' }
  ];
  
  const handleConnectWallet = () => {
    if (modal) {
      modal.open();
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="lg:col-span-2 card-glass">
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Portfolio Overview</CardTitle>
          <CardDescription className="text-xs md:text-sm">Total value across all categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="flex items-end">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 md:h-10 w-32 md:w-40 bg-cosmic-800" />
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin mr-2 text-nebula-400" />
                  <span className="text-xs text-muted-foreground">Fetching balance...</span>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="space-y-2">
                <h2 className="text-2xl md:text-4xl font-bold font-space">$0.00</h2>
                <div className="flex items-center text-muted-foreground">
                  <WalletIcon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  <span className="text-xs">Connect wallet to view your portfolio</span>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-4xl font-bold font-space">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
                <div className={`ml-2 md:ml-4 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" /> : <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5" />}
                  <span className="font-roboto-mono text-sm md:font-medium">{isPositive ? '+' : ''}{portfolioChange}%</span>
                </div>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
            {(isConnected ? portfolioData : []).map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs md:text-sm">{item.name}</span>
                  <span className="font-roboto-mono text-xs md:text-sm">{item.value}%</span>
                </div>
                <Progress 
                  value={item.value} 
                  className="h-1.5 md:h-2" 
                  style={{ 
                    '--progress-background': `linear-gradient(to right, ${item.color}, ${item.color}cc)`
                  } as React.CSSProperties}
                />
              </div>
            ))}
            
            {!isConnected && (
              <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-4 md:py-8">
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 text-center">Connect your wallet to view your portfolio allocations</p>
                <Button 
                  variant="outline" 
                  className="bg-nebula-600/20 hover:bg-nebula-600/30 text-xs md:text-sm"
                  onClick={handleConnectWallet}
                >
                  <WalletIcon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-xs md:text-sm text-muted-foreground font-roboto-mono">
            Last updated: {format(lastUpdated, 'dd MMM yyyy, HH:mm')} UTC
          </div>
        </CardFooter>
      </Card>
      
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">Portfolio Distribution</CardTitle>
          <CardDescription className="text-xs md:text-sm">Allocation across categories</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-32 h-32 md:w-48 md:h-48 relative">
            <PieChart width={isMobile ? 150 : 200} height={isMobile ? 150 : 200}>
              <Pie
                data={isConnected ? portfolioData : defaultPortfolioData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 60 : 80}
                paddingAngle={5}
                dataKey="value"
              >
                {(isConnected ? portfolioData : defaultPortfolioData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-4 w-4 md:h-6 md:w-6 animate-spin text-nebula-400" />
              ) : !isConnected ? (
                <>
                  <WalletIcon className="h-4 w-4 md:h-6 md:w-6 text-gray-400" />
                  <span className="mt-1 font-roboto-mono text-xs md:text-sm text-gray-400">Not Connected</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-nebula-400" />
                  <span className="mt-1 font-roboto-mono text-xs md:text-sm">Total</span>
                  <span className="font-space font-bold text-sm md:text-base">100%</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isConnected ? (
            <ul className="w-full flex flex-wrap gap-1 md:gap-2 justify-center md:justify-start">
              {portfolioData.map((item) => (
                <li key={item.name} className="flex items-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-1 md:mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] md:text-xs">{item.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="w-full text-center text-muted-foreground text-[10px] md:text-xs">
              Connect your wallet to view your portfolio distribution
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
