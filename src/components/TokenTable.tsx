import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoveVertical } from 'lucide-react';
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

const TokenTable = ({ category = "all" }: { category?: string }) => {
  const [sortField, setSortField] = useState<keyof Token>('allocation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredTokens = category === 'all' 
    ? mockTokens 
    : mockTokens.filter(token => {
        const tokenCategories = token.category.split('/');
        return tokenCategories.some(cat => cat.toLowerCase() === category.toLowerCase());
      });
  
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

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
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">{getCategoryTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" className="font-medium p-0" onClick={() => handleSort('change24h')}>
                    24h Change 
                    <MoveVertical className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">Volume (24h)</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" size="sm" className="font-medium p-0" onClick={() => handleSort('allocation')}>
                    Allocation
                    <MoveVertical className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedTokens.map((token) => (
                <TableRow key={token.id}>
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
                      <span className="font-roboto-mono">{token.change24h > 0 ? '+' : ''}{token.change24h}%</span>
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
  );
};

export default TokenTable;
