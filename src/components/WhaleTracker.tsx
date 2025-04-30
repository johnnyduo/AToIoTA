// src/components/WhaleTracker.tsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoveHorizontal, 
  Bot, 
  Search, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  getWhaleTransactions, 
  WhaleTransaction, 
  getTopTokens, 
  Token, 
  formatValue,
  getTokenInfo,
  timeAgo
} from '@/lib/explorerService';
import { generateWhaleAnalysis } from '@/lib/geminiService';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// Define whale transaction size categories
type WhaleSize = 'small' | 'medium' | 'large' | 'mega';

const WhaleTracker = () => {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<WhaleTransaction | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState<'24h' | '3d' | '7d'>('24h');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  // Add this state to track data source
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Fetch top tokens
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const topTokens = await getTopTokens(10);
        setTokens(topTokens || []);
      } catch (error) {
        console.error('Error fetching top tokens:', error);
        setError('Failed to fetch token data. Please try again later.');
      }
    };
    
    fetchTokens();
  }, []);

  // Fetch token info when token filter changes
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (tokenFilter !== 'all') {
        const token = tokens.find(t => t.symbol === tokenFilter);
        if (token) {
          setSelectedToken(token);
          try {
            const info = await getTokenInfo(token.address);
            setTokenInfo(info);
          } catch (error) {
            console.error('Error fetching token info:', error);
          }
        }
      } else {
        setSelectedToken(null);
        setTokenInfo(null);
      }
    };
    
    fetchTokenDetails();
  }, [tokenFilter, tokens]);

  // Fetch whale transactions based on filters
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let whaleTransactions = await getWhaleTransactions(timeframe, tokenFilter);
        // Filter out duplicates based on hash
        const seen = new Set();
        whaleTransactions = whaleTransactions.filter(tx => {
          if (!tx.hash || seen.has(tx.hash)) return false;
          seen.add(tx.hash);
          return true;
        });
        // Check if we're using mock data (you'd need to modify getWhaleTransactions to return this info)
        setIsUsingMockData(whaleTransactions.length > 0 && whaleTransactions[0].isMock === true);
        // Apply size filter if selected
        let filteredBySize = whaleTransactions || [];
        if (sizeFilter !== 'all') {
          filteredBySize = filteredBySize.filter(tx => {
            const usdValue = parseFloat((tx.usdValue || '$0').replace(/[^0-9.-]+/g, '') || '0');
            switch (sizeFilter) {
              case 'small':
                return usdValue >= 5000 && usdValue < 50000;
              case 'medium':
                return usdValue >= 50000 && usdValue < 250000;
              case 'large':
                return usdValue >= 250000 && usdValue < 1000000;
              case 'mega':
                return usdValue >= 1000000;
              default:
                return true;
            }
          });
        }
        // Apply search filter if present
        const filteredTransactions = searchQuery 
          ? filteredBySize.filter(tx => 
              (tx.hash || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (tx.from || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (tx.to || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (tx.tokenSymbol || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
          : filteredBySize;
        setTransactions(filteredTransactions);
      } catch (error) {
        console.error('Error fetching whale transactions:', error);
        setError('Failed to fetch transaction data. Please try again later.');
        setTransactions([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    fetchData();
  }, [timeframe, tokenFilter, sizeFilter, searchQuery]);

  // Determine whale size category
  const getWhaleSize = (usdValue: string): WhaleSize => {
    const value = parseFloat((usdValue || '$0').replace(/[^0-9.-]+/g, '') || '0');
    
    if (value >= 1000000) return 'mega';
    if (value >= 250000) return 'large';
    if (value >= 50000) return 'medium';
    return 'small';
  };

  // Get whale size badge color
  const getWhaleSizeColor = (size: WhaleSize): string => {
    switch (size) {
      case 'mega':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'large':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'medium':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'small':
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleAnalyzeTransaction = async (transaction: WhaleTransaction) => {
    // Create a copy with valid age if missing
    const txWithValidTimestamp = {
      ...transaction,
      age: transaction.age || timeAgo(transaction.timestamp) || 'Recently'
    };
    setSelectedTransaction(txWithValidTimestamp);
    setIsAnalyzing(true);
    setAiAnalysis('');
    try {
      // In production, use the actual Gemini API
      const analysis = await generateWhaleAnalysis(txWithValidTimestamp);
      setAiAnalysis(analysis || 'No analysis available');
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setAiAnalysis('Failed to generate analysis. The AI service may be temporarily unavailable. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // This will trigger the useEffect to fetch data again
    const timestamp = Date.now();
    setTimeframe(prev => prev === '24h' ? '24h' : prev === '3d' ? '3d' : '7d');
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowUpRight className="h-3 w-3 mr-1" />;
      case 'sell':
        return <ArrowDownRight className="h-3 w-3 mr-1" />;
      default:
        return <MoveHorizontal className="h-3 w-3 mr-1" />;
    }
  };

  const getExplorerUrl = (hash: string) => {
    return `https://explorer.evm.iota.org/tx/${hash || ''}`;
  };

  const getAddressExplorerUrl = (address: string) => {
    return `https://explorer.evm.iota.org/address/${address || ''}`;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!transactions.length) return null;
    
    const totalVolume = transactions.reduce((sum, tx) => {
      const value = parseFloat((tx.usdValue || '$0').replace(/[^0-9.-]+/g, '') || '0');
      return sum + value;
    }, 0);
    
    const buyVolume = transactions
      .filter(tx => tx.type === 'buy')
      .reduce((sum, tx) => {
        const value = parseFloat((tx.usdValue || '$0').replace(/[^0-9.-]+/g, '') || '0');
        return sum + value;
      }, 0);
    
    const sellVolume = transactions
      .filter(tx => tx.type === 'sell')
      .reduce((sum, tx) => {
        const value = parseFloat((tx.usdValue || '$0').replace(/[^0-9.-]+/g, '') || '0');
        return sum + value;
      }, 0);
    
    const transferVolume = totalVolume - buyVolume - sellVolume;
    
    const largestTx = transactions.reduce((largest, tx) => {
      const value = parseFloat((tx.usdValue || '$0').replace(/[^0-9.-]+/g, '') || '0');
      return value > largest ? value : largest;
    }, 0);
    
    return {
      totalVolume: totalVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      buyVolume: buyVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      sellVolume: sellVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      transferVolume: transferVolume.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      largestTx: largestTx.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      count: transactions.length,
      buyPercentage: totalVolume ? (buyVolume / totalVolume) * 100 : 0,
      sellPercentage: totalVolume ? (sellVolume / totalVolume) * 100 : 0,
      transferPercentage: totalVolume ? (transferVolume / totalVolume) * 100 : 0
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Whale Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolume}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.count} transactions</p>
            </CardContent>
          </Card>
          
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buy vs Sell Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-500">Buy: {stats.buyPercentage.toFixed(1)}%</span>
                    <span className="text-red-500">Sell: {stats.sellPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-cosmic-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-red-500" 
                      style={{ width: `${stats.buyPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Largest Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.largestTx}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeframe === '24h' ? 'Last 24 hours' : 
                 timeframe === '3d' ? 'Last 3 days' : 'Last 7 days'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume by Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-500">Buy</span>
                <span className="text-xs font-mono">{stats.buyVolume}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-red-500">Sell</span>
                <span className="text-xs font-mono">{stats.sellVolume}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-500">Transfer</span>
                <span className="text-xs font-mono">{stats.transferVolume}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Token Info Card - Show when a specific token is selected */}
      {selectedToken && tokenInfo && (
        <Card className="card-glass">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{selectedToken.name || 'Unknown'} ({selectedToken.symbol || 'Unknown'})</CardTitle>
              <a 
                href={`https://explorer.evm.iota.org/token/${selectedToken.address || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-nebula-400 hover:text-nebula-300 flex items-center"
              >
                View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <CardDescription>Token Analysis</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Token Info</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{tokenInfo.type || selectedToken.type || 'ERC-20'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decimals:</span>
                  <span>{tokenInfo.decimals || selectedToken.decimals || 18}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holders:</span>
                  <span>{(tokenInfo.holders_count || selectedToken.holders || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Whale Activity</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Transactions:</span>
                  <span>{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Whale Concentration:</span>
                  <span className="text-amber-500">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Largest Transfer:</span>
                  <span>{stats?.largestTx || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Market Impact</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy Pressure:</span>
                  <span className={stats && stats.buyPercentage > 60 ? 'text-green-500' : 'text-muted-foreground'}>
                    {stats?.buyPercentage.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sell Pressure:</span>
                  <span className={stats && stats.sellPercentage > 60 ? 'text-red-500' : 'text-muted-foreground'}>
                    {stats?.sellPercentage.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className={
                    stats && stats.buyPercentage > 60 ? 'text-green-500' :
                    stats && stats.sellPercentage > 60 ? 'text-red-500' :
                    'text-blue-500'
                  }>
                    {stats && stats.buyPercentage > 60 ? 'Bullish' :
                     stats && stats.sellPercentage > 60 ? 'Bearish' :
                     'Neutral'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 card-glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Whale Transaction Tracker</CardTitle>
                <CardDescription>Monitor large token movements on the IOTA network</CardDescription>
                {/* Visual indicator for mock data */}
                {isUsingMockData && (
                  <div className="text-xs text-amber-400 flex items-center mt-2">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Using simulated data for demonstration purposes</span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <Select value={timeframe} onValueChange={(value: '24h' | '3d' | '7d') => setTimeframe(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="3d">Last 3 days</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={tokenFilter} onValueChange={setTokenFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tokens</SelectItem>
                    {tokens.map(token => (
                      <SelectItem key={token.address} value={token.symbol}>
                        {token.symbol} ({token.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Whale Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small ($5k-$50k)</SelectItem>
                    <SelectItem value="medium">Medium ($50k-$250k)</SelectItem>
                    <SelectItem value="large">Large ($250k-$1M)</SelectItem>
                    <SelectItem value="mega">Mega ({'>'}$1M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 flex">
                <form onSubmit={handleSearch} className="flex w-full">
                  <Input 
                    placeholder="Search by address or hash" 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="ghost" size="icon" className="ml-1">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-red-400 mb-2">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-medium">Error Loading Data</h3>
                </div>
                <p className="text-muted-foreground max-w-md">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setIsLoading(true);
                    getWhaleTransactions(timeframe, tokenFilter)
                      .then(data => {
                        setTransactions(data || []);
                        setError(null);
                      })
                      .catch(err => {
                        console.error('Error retrying fetch:', err);
                        setError('Failed to fetch transaction data. Please try again later.');
                      })
                      .finally(() => setIsLoading(false));
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No whale transactions found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-1">Try changing your filters or search query.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead className="hidden md:table-cell">From</TableHead>
                      <TableHead className="hidden md:table-cell">To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Value</TableHead>
                      <TableHead className="hidden md:table-cell">Time</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, index) => {
                      const whaleSize = getWhaleSize(tx.usdValue || '$0');
                      // Create a unique key using both hash and index
                      const uniqueKey = tx.hash ? `${tx.hash}-${index}` : `tx-${Date.now()}-${index}`;
                      return (
                        <TableRow 
                          key={uniqueKey} 
                          className={selectedTransaction?.hash === tx.hash ? 'bg-cosmic-800' : ''}
                        >
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={`${getTransactionTypeColor(tx.type)} flex items-center w-fit`}>
                                {getTransactionTypeIcon(tx.type)}
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </Badge>
                              <Badge className={`${getWhaleSizeColor(whaleSize)} flex items-center w-fit text-xs`}>
                                {whaleSize.charAt(0).toUpperCase() + whaleSize.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{tx.tokenSymbol || 'Unknown'}</TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                                  {tx.from 
                                    ? `${tx.from.substring(0, 6)}...${tx.from.substring(Math.max(0, tx.from.length - 4))}`
                                    : 'Unknown'
                                  }
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-mono text-xs">{tx.from || 'Unknown'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                                  {tx.to 
                                    ? `${tx.to.substring(0, 6)}...${tx.to.substring(Math.max(0, tx.to.length - 4))}`
                                    : 'Unknown'
                                  }
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-mono text-xs">{tx.to || 'Unknown'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="font-medium">{tx.valueFormatted || '0'}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {tx.usdValue || '$0'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {tx.age || timeAgo(tx.timestamp) || 'Recently'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => handleAnalyzeTransaction(tx)}
                              >
                                <Bot className="h-3 w-3 mr-1" />
                                Analyze
                              </Button>
                              {tx.hash && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => window.open(getExplorerUrl(tx.hash || ''), '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground">
            <div className="flex items-center">
              <Info className="h-3 w-3 mr-1" />
              <span>
                Whale transactions are defined as movements of significant value ({'>'}$5,000) or representing a large portion of token supply.
              </span>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-2xl">AI Analysis</CardTitle>
            <CardDescription>
              {selectedTransaction 
                ? `Analysis of ${selectedTransaction.tokenSymbol || 'Unknown'} ${selectedTransaction.type} transaction`
                : 'Select a transaction to analyze'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedTransaction ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Bot className="h-16 w-16 text-nebula-400 mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Select a whale transaction from the table to get AI-powered insights
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 text-nebula-400 animate-spin mb-4" />
                <p className="text-nebula-400 animate-pulse">Analyzing transaction data...</p>
                <div className="mt-4 w-48">
                  <Progress value={45} className="h-1" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Examining on-chain patterns and market impact
                </p>
              </div>
            ) : (
              <div className="h-[400px] overflow-auto pr-2">
                <div className="prose prose-invert max-w-none">
                  {aiAnalysis.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-xl font-bold mt-0">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-lg font-semibold mt-4">{line.substring(3)}</h2>;
                    } else if (line.startsWith('- ')) {
                      return <li key={index} className="ml-4">{line.substring(2)}</li>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      // Process bold text and other markdown
                      const processedLine = line.replace(
                        /\*\*(.*?)\*\*/g, 
                        '<strong>$1</strong>'
                      );
                      
                      return <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
                    }
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-cosmic-700">
                  <h3 className="text-sm font-medium mb-2">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Hash:</div>
                    <div className="font-mono text-xs truncate">
                      {selectedTransaction.hash ? (
                        <a 
                          href={getExplorerUrl(selectedTransaction.hash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center hover:text-nebula-400"
                        >
                          {selectedTransaction.hash.substring(0, 18)}...
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        'Unknown'
                      )}
                    </div>
                    
                    <div className="text-muted-foreground">From:</div>
                    <div className="font-mono text-xs truncate">
                      {selectedTransaction.from ? (
                        <a 
                          href={getAddressExplorerUrl(selectedTransaction.from)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nebula-400"
                        >
                          {selectedTransaction.from}
                        </a>
                      ) : (
                        'Unknown'
                      )}
                    </div>
                    
                    <div className="text-muted-foreground">To:</div>
                    <div className="font-mono text-xs truncate">
                      {selectedTransaction.to ? (
                        <a 
                          href={getAddressExplorerUrl(selectedTransaction.to)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-nebula-400"
                        >
                          {selectedTransaction.to}
                        </a>
                      ) : (
                        'Unknown'
                      )}
                    </div>
                    
                    <div className="text-muted-foreground">Value:</div>
                    <div>{selectedTransaction.valueFormatted || '0'} {selectedTransaction.tokenSymbol || 'Unknown'}</div>
                    
                    <div className="text-muted-foreground">USD Value:</div>
                    <div>{selectedTransaction.usdValue || '$0'}</div>
                    
                    <div className="text-muted-foreground">Time:</div>
                    <div>{selectedTransaction.age || timeAgo(selectedTransaction.timestamp) || 'Recently'}</div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>This analysis is powered by AI and should not be considered financial advice. Always do your own research.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhaleTracker;