import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, MoveVertical, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious,
  PaginationLink
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { fetchTokenPrices, cacheTokenData, getCachedTokenData, TokenPrice, fetchTokenInsights } from '@/lib/tokenService';
import { isGeminiAvailable } from '@/lib/geminiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  allocation: number;
  category: string;
}

const categoryColors: { [key: string]: string } = {
  meme: '#EC4899',     // Pink
  rwa: '#0EA5E9',      // Blue
  bigcap: '#10B981',   // Green
  defi: '#F97316',     // Orange
  l1: '#8B5CF6',       // Purple
  stablecoin: '#14B8A6', // Teal
  ai: '#D946EF'        // Magenta
};

// Updated token data based on the provided list
const mockTokens: Token[] = [
  { id: '1', name: 'PUNKS', symbol: 'PUNK', price: 0.052, change24h: 12.7, marketCap: 32000000, volume: 8700000, allocation: 6, category: 'meme' },
  { id: '2', name: 'Ambitious Ape Perfume', symbol: 'AAP', price: 0.0084, change24h: 8.3, marketCap: 5600000, volume: 1200000, allocation: 3, category: 'meme' },
  { id: '3', name: 'Assembly Meme Coin', symbol: 'ASMB', price: 0.0215, change24h: -3.5, marketCap: 12000000, volume: 4300000, allocation: 4, category: 'meme' },
  { id: '4', name: 'Aureus', symbol: 'AUR', price: 1.26, change24h: 2.4, marketCap: 43000000, volume: 8900000, allocation: 5, category: 'rwa' },
  { id: '5', name: 'AVAX (LayerZero)', symbol: 'AVAX', price: 28.74, change24h: -1.2, marketCap: 10200000000, volume: 456000000, allocation: 7, category: 'bigcap' },
  { id: '6', name: 'TelegramBeast Token', symbol: 'BEAST', price: 0.00073, change24h: 32.5, marketCap: 3400000, volume: 890000, allocation: 2, category: 'meme' },
  { id: '7', name: 'DEEP', symbol: 'DEEP', price: 0.87, change24h: 14.2, marketCap: 28000000, volume: 7600000, allocation: 8, category: 'ai' },
  { id: '8', name: 'Ether (LayerZero)', symbol: 'ETH', price: 3245.78, change24h: 0.8, marketCap: 389000000000, volume: 15700000000, allocation: 10, category: 'bigcap' },
  { id: '9', name: 'BigFish', symbol: 'FISH', price: 0.0042, change24h: 42.6, marketCap: 4500000, volume: 2300000, allocation: 3, category: 'meme' },
  { id: '10', name: 'Fantom (LayerZero)', symbol: 'FTM', price: 0.65, change24h: 5.6, marketCap: 1800000000, volume: 234000000, allocation: 4, category: 'bigcap' },
  { id: '11', name: 'Fusing Failsafe Token', symbol: 'FUSE', price: 0.31, change24h: 8.4, marketCap: 18000000, volume: 3200000, allocation: 4, category: 'defi' },
  { id: '12', name: 'HODLHamster', symbol: 'HODLHamster', price: 0.00026, change24h: 78.3, marketCap: 2100000, volume: 750000, allocation: 2, category: 'meme' },
  { id: '13', name: 'iGold', symbol: 'IPG', price: 1867.45, change24h: 0.4, marketCap: 52000000, volume: 8400000, allocation: 6, category: 'rwa' },
  { id: '14', name: 'Pothuu (NHU) Token', symbol: 'NHU', price: 0.0064, change24h: 16.8, marketCap: 3900000, volume: 1100000, allocation: 2, category: 'meme' },
  { id: '15', name: 'LOVE', symbol: 'LOVE', price: 0.0127, change24h: 9.4, marketCap: 7800000, volume: 2100000, allocation: 3, category: 'meme' },
  { id: '16', name: 'ShimmerSea Lum', symbol: 'LUM', price: 0.42, change24h: 6.7, marketCap: 23000000, volume: 5300000, allocation: 5, category: 'defi' },
  { id: '17', name: 'Matic (LayerZero)', symbol: 'MATIC', price: 0.56, change24h: -2.3, marketCap: 5600000000, volume: 276000000, allocation: 5, category: 'bigcap' },
  { id: '18', name: 'ShimmerSea MagicLum', symbol: 'MLUM', price: 0.86, change24h: 11.2, marketCap: 36000000, volume: 9400000, allocation: 5, category: 'defi' },
  { id: '19', name: 'Wrapped IOTA', symbol: 'sIOTA', price: 0.18, change24h: 3.6, marketCap: 498000000, volume: 43000000, allocation: 5, category: 'bigcap' },
  { id: '20', name: 'Shimmer', symbol: 'SMR', price: 0.042, change24h: 7.5, marketCap: 153000000, volume: 28000000, allocation: 6, category: 'l1' },
  { id: '21', name: 'USD Coin (LayerZero)', symbol: 'USDC', price: 1.00, change24h: 0.01, marketCap: 28500000000, volume: 3700000000, allocation: 3, category: 'stablecoin' },
  { id: '22', name: 'Tether USD (LayerZero)', symbol: 'USDT', price: 1.00, change24h: 0.02, marketCap: 89700000000, volume: 52300000000, allocation: 3, category: 'stablecoin' },
  { id: '23', name: 'Wrapped BNB (LayerZero)', symbol: 'wBNB', price: 574.23, change24h: -0.8, marketCap: 88600000000, volume: 1860000000, allocation: 4, category: 'bigcap' },
  { id: '24', name: 'Wrapped Bitcoin (LayerZero)', symbol: 'wBTC', price: 64382.15, change24h: 1.2, marketCap: 125800000000, volume: 4230000000, allocation: 10, category: 'bigcap' },
  { id: '25', name: 'WEN', symbol: 'WEN', price: 0.00057, change24h: 24.8, marketCap: 4800000, volume: 1320000, allocation: 3, category: 'meme' },
];

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVALS = {
  AUTO: 300000, // 5 minutes auto-refresh
  MANUAL: null  // Manual refresh only
};

const TokenTable = ({ category = "all" }: { category?: string }) => {
  const [sortField, setSortField] = useState<keyof Token>('allocation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTokenData, setLiveTokenData] = useState<TokenPrice[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(REFRESH_INTERVALS.AUTO);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenInsight, setTokenInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const { toast } = useToast();
  
  // Auto-refresh effect
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      refreshTokenData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    setRefreshInterval(newState ? REFRESH_INTERVALS.AUTO : REFRESH_INTERVALS.MANUAL);
    
    toast({
      title: newState ? 'Auto-refresh enabled' : 'Auto-refresh disabled',
      description: newState 
        ? 'Prices will update every 5 minutes' 
        : 'Prices will only update when you click refresh',
    });
  };
  
  // Fetch token prices on component mount
  useEffect(() => {
    const loadTokenData = async () => {
      // Check if we have cached data that's less than 5 minutes old
      const { data: cachedData, timestamp } = getCachedTokenData();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      if (cachedData.length > 0) {
        setLiveTokenData(cachedData);
        setLastUpdated(new Date(timestamp));
        
        // Only fetch new data if cached data is older than 5 minutes
        if (timestamp < fiveMinutesAgo) {
          await refreshTokenData(false); // Silent refresh
        }
        return;
      }
      
      // Otherwise fetch fresh data
      await refreshTokenData(false); // Silent refresh
    };
    
    loadTokenData();
  }, []);
  
  // Check if Gemini API is available
  useEffect(() => {
    setIsGeminiEnabled(typeof isGeminiAvailable === 'function' ? isGeminiAvailable() : false);
  }, []);

  // Function to fetch token insights
  const getTokenInsights = async (token: Token) => {
    if (!isGeminiEnabled) {
      toast({
        title: "AI Insights Unavailable",
        description: "Gemini API key is not configured. Please add it to your environment variables.",
        variant: "destructive"
      });
      return;
    }
    setSelectedToken(token);
    setTokenInsight(null);
    setIsInsightLoading(true);
    try {
      const insights = await fetchTokenInsights(token.symbol);
      setTokenInsight(insights);
    } catch (error) {
      console.error('Error fetching token insights:', error);
      toast({
        title: "Failed to Load Insights",
        description: error instanceof Error ? error.message : "Could not fetch AI insights for this token. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsInsightLoading(false);
    }
  };

  // Function to refresh token data manually
  const refreshTokenData = async (showToast = true) => {
    setIsLoading(true);
    try {
      const data = await fetchTokenPrices();
      if (data.length > 0) {
        setLiveTokenData(data);
        cacheTokenData(data);
        setLastUpdated(new Date());
        
        if (showToast) {
          toast({
            title: 'Token prices updated',
            description: 'Latest market data has been loaded successfully.',
          });
        }
      }
    } catch (error: any) {
      console.error('Error refreshing token data:', error);
      
      // Handle rate limiting specifically
      if (error.response && error.response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment before refreshing again.',
          variant: 'destructive',
        });
      } else if (showToast) {
        toast({
          title: 'Update failed',
          description: 'Could not refresh token prices. Please try again later.',
          variant: 'destructive',
        });
      }
      
      // If fetch fails but we have cached data, keep using it
      const { data: cachedData, timestamp } = getCachedTokenData();
      if (cachedData.length > 0 && !liveTokenData.length) {
        setLiveTokenData(cachedData);
        setLastUpdated(new Date(timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Merge live token data with mock data
  const mergedTokenData = () => {
    if (liveTokenData.length === 0) return mockTokens;
    
    // Create a map of symbols to live data
    const liveDataMap = new Map(liveTokenData.map(token => [
      token.symbol.toUpperCase(),
      token
    ]));
    
    // Update mock tokens with live data where available
    return mockTokens.map(token => {
      const liveToken = liveDataMap.get(token.symbol.toUpperCase());
      if (liveToken) {
        return {
          ...token,
          price: liveToken.current_price,
          change24h: liveToken.price_change_percentage_24h,
          marketCap: liveToken.market_cap,
          volume: liveToken.total_volume
        };
      }
      return token;
    });
  };
  
  // Filter tokens based on category
  const filteredTokens = useMemo(() => {
    return category === 'all' 
      ? mergedTokenData() 
      : mergedTokenData().filter(token => {
          const tokenCategories = token.category.split('/');
          return tokenCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
        });
  }, [category, liveTokenData]);
  
  // Sort tokens based on current sort field and direction
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }, [filteredTokens, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTokens.length / ITEMS_PER_PAGE);
  const paginatedTokens = sortedTokens.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: keyof Token) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  const getCategoryTitle = () => {
    switch(category) {
      case 'ai': return 'AI & DeFi Tokens';
      case 'meme': return 'Meme & NFT Tokens';
      case 'rwa': return 'Real World Assets';
      case 'bigcap': return 'Big Cap Tokens';
      case 'defi': return 'DeFi Protocols';
      case 'l1': return 'Layer 1 Protocols';
      case 'stablecoin': return 'Stablecoins';
      default: return 'All Tokens';
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  };
  
    // Format the last updated time
    const getLastUpdatedText = () => {
      if (!lastUpdated) return 'Never updated';
      
      // If updated less than a minute ago, show "Just now"
      const secondsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (secondsAgo < 60) return 'Just now';
      
      // If updated less than an hour ago, show minutes
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
      
      // Otherwise show the time
      return lastUpdated.toLocaleTimeString();
    };
    
    return (
      <>
        <Card className="card-glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{getCategoryTitle()}</CardTitle>
              {isGeminiEnabled && (
                <p className="text-xs text-muted-foreground mt-1">
                  Click on any token to view AI-powered insights
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{getLastUpdatedText()}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last updated: {lastUpdated?.toLocaleString() || 'Never'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs">Auto</span>
                <Switch 
                  checked={autoRefreshEnabled} 
                  onCheckedChange={toggleAutoRefresh} 
                  aria-label="Toggle auto-refresh"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refreshTokenData(true)} 
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-medium p-0" 
                        onClick={() => handleSort('change24h')}
                        aria-sort={sortField === 'change24h' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        24h Change 
                        <MoveVertical className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Market Cap</TableHead>
                    <TableHead className="text-right">Volume (24h)</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-medium p-0" 
                        onClick={() => handleSort('allocation')}
                        aria-sort={sortField === 'allocation' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        Allocation
                        <MoveVertical className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
  
                <TableBody>
                  {paginatedTokens.map((token) => (
                    <TableRow 
                      key={token.id} 
                      className="cursor-pointer hover:bg-white/5"
                      onClick={() => getTokenInsights(token)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center">
                            <span className="font-medium text-xs">{token.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground font-roboto-mono">{token.symbol}</span>
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ 
                                  backgroundColor: `${categoryColors[token.category]}20`,
                                  color: categoryColors[token.category]
                                }}
                              >
                                {token.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`inline-flex items-center ${token.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change24h > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          <span className="font-roboto-mono">{token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        {formatNumber(token.marketCap)}
                      </TableCell>
                      <TableCell className="text-right font-roboto-mono">
                        {formatNumber(token.volume)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-gradient-button">{token.allocation}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {paginatedTokens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tokens found for this category
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
  
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        {currentPage === 1 ? (
                          <PaginationLink
                            aria-disabled="true"
                            className="opacity-50 pointer-events-none"
                          >
                            Previous
                          </PaginationLink>
                        ) : (
                          <PaginationPrevious onClick={goToPreviousPage} />
                        )}
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 py-2">
                          Page {currentPage} of {totalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        {currentPage === totalPages ? (
                          <PaginationLink
                            aria-disabled="true"
                            className="opacity-50 pointer-events-none"
                          >
                            Next
                          </PaginationLink>
                        ) : (
                          <PaginationNext onClick={goToNextPage} />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Token Insights Dialog */}
        <Dialog open={!!selectedToken} onOpenChange={(open) => !open && setSelectedToken(null)}>
          <DialogContent className="sm:max-w-[600px] bg-cosmic-900 border-cosmic-700">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedToken && (
                  <>
                    <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center mr-2">
                      <span className="font-medium text-xs">{selectedToken.symbol.substring(0, 2)}</span>
                    </div>
                    {selectedToken.name} ({selectedToken.symbol}) Insights
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 px-2">
              {isInsightLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mb-4 text-nebula-400" />
                  <p className="text-muted-foreground">Generating AI insights...</p>
                </div>
              ) : tokenInsight ? (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{tokenInsight}</div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No insights available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };
  
  export default TokenTable;