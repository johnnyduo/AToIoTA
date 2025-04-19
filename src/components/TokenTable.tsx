
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

const mockTokens: Token[] = [
  { id: '1', name: 'Neural Network', symbol: 'NNET', price: 14.32, change24h: 8.5, marketCap: 456000000, volume: 78000000, allocation: 15, category: 'ai' },
  { id: '2', name: 'Machine Learning', symbol: 'MLEARN', price: 6.78, change24h: 12.3, marketCap: 245000000, volume: 45000000, allocation: 10, category: 'ai' },
  { id: '3', name: 'AI Oracle', symbol: 'AIOR', price: 22.45, change24h: -3.2, marketCap: 890000000, volume: 156000000, allocation: 10, category: 'ai' },
  { id: '4', name: 'Doge Moon', symbol: 'DMOON', price: 0.0025, change24h: 45.2, marketCap: 87000000, volume: 35000000, allocation: 8, category: 'meme' },
  { id: '5', name: 'Pepe Finance', symbol: 'PEPEF', price: 0.0072, change24h: -12.5, marketCap: 65000000, volume: 28000000, allocation: 7, category: 'meme' },
  { id: '6', name: 'Shiba DeFi', symbol: 'SHIBD', price: 0.00043, change24h: 18.7, marketCap: 120000000, volume: 56000000, allocation: 5, category: 'meme' },
  { id: '7', name: 'Real Estate Token', symbol: 'REIT', price: 87.65, change24h: 2.3, marketCap: 1250000000, volume: 98000000, allocation: 12, category: 'rwa' },
  { id: '8', name: 'Carbon Credit', symbol: 'CARB', price: 32.14, change24h: 5.6, marketCap: 567000000, volume: 76000000, allocation: 8, category: 'rwa' },
  { id: '9', name: 'Commodity Token', symbol: 'COMT', price: 45.78, change24h: -1.5, marketCap: 780000000, volume: 125000000, allocation: 5, category: 'rwa' },
  { id: '10', name: 'IOTA', symbol: 'MIOTA', price: 0.32, change24h: 3.7, marketCap: 1800000000, volume: 87000000, allocation: 8, category: 'bigcap' },
  { id: '11', name: 'Ethereum', symbol: 'ETH', price: 4320.45, change24h: 2.1, marketCap: 520000000000, volume: 15600000000, allocation: 7, category: 'bigcap' },
  { id: '12', name: 'Solana', symbol: 'SOL', price: 178.24, change24h: 5.3, marketCap: 78000000000, volume: 4500000000, allocation: 5, category: 'bigcap' },
];

const TokenTable = ({ category = "ai" }: { category?: string }) => {
  const [sortField, setSortField] = useState<keyof Token>('allocation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const filteredTokens = category ? mockTokens.filter(token => token.category === category) : mockTokens;
  
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });
  
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
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">
          {category === 'ai' ? 'AI Tokens' : 
           category === 'meme' ? 'Meme Tokens' : 
           category === 'rwa' ? 'Real World Assets' : 
           category === 'bigcap' ? 'Big Cap Tokens' : 'All Tokens'}
        </CardTitle>
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
              {sortedTokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center">
                        <span className="font-medium text-xs">{token.symbol.substring(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-muted-foreground font-roboto-mono">{token.symbol}</div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenTable;
