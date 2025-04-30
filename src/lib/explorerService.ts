// src/lib/explorerService.ts
import axios from 'axios';

// Use the mainnet explorer API v2
const EXPLORER_API_URL = 'https://explorer.evm.iota.org/api/v2';

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  tokenSymbol?: string;
  tokenName?: string;
  tokenAddress?: string;
  decimals?: number;
}

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  timestamp: number | string;
  age: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  type: 'buy' | 'sell' | 'transfer';
  usdValue?: string;
  isMock?: boolean; // Add this property to support mock data flag
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  holders: number;
  type: string;
}

// Get token transfers
export async function getTokenTransfers(
  page = 1, 
  limit = 100,
  tokenAddress?: string,
  fromTimestamp?: number
): Promise<TokenTransfer[]> {
  try {
    const params: any = {
      page,
      items_count: limit
    };
    
    if (tokenAddress) {
      params.token = tokenAddress;
    }
    
    if (fromTimestamp) {
      params.from_timestamp = fromTimestamp;
    }
    
    const response = await axios.get(`${EXPLORER_API_URL}/token-transfers`, { params });
    
    if (!response.data.items) {
      return [];
    }
    
    // Map the response to our TokenTransfer interface
    return response.data.items.map((item: any) => ({
      hash: item.tx_hash,
      from: item.from?.hash || '',
      to: item.to?.hash || '',
      value: item.total?.value || '0',
      timestamp: item.timestamp,
      tokenSymbol: item.token?.symbol || 'Unknown',
      tokenName: item.token?.name || 'Unknown Token',
      tokenAddress: item.token?.address || '',
      decimals: parseInt(item.token?.decimals || '18')
    }));
  } catch (error) {
    console.error(`Error fetching token transfers:`, error);
    return [];
  }
}

// Get transactions for a specific token
export async function getTokenInfo(tokenAddress: string): Promise<any> {
  try {
    const response = await axios.get(`${EXPLORER_API_URL}/tokens/${tokenAddress}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    return null;
  }
}

// Get top tokens
export async function getTopTokens(limit = 10): Promise<Token[]> {
  try {
    // For the demo, we'll use mock data since the API might not have a direct endpoint for top tokens
    return getMockTopTokens();
  } catch (error) {
    console.error('Error fetching top tokens:', error);
    return getMockTopTokens();
  }
}

// Get whale transactions
export async function getWhaleTransactions(
  timeframe: '24h' | '3d' | '7d',
  tokenFilter: string = 'all',
  limit = 100
): Promise<WhaleTransaction[]> {
  try {
    // Calculate timestamp based on timeframe
    const now = Math.floor(Date.now() / 1000);
    let fromTimestamp: number;
    
    switch (timeframe) {
      case '24h':
        fromTimestamp = now - (24 * 60 * 60);
        break;
      case '3d':
        fromTimestamp = now - (3 * 24 * 60 * 60);
        break;
      case '7d':
        fromTimestamp = now - (7 * 24 * 60 * 60);
        break;
      default:
        fromTimestamp = now - (24 * 60 * 60);
    }
    
    try {
      // Get token transfers
      const params: any = {
        page: 1,
        items_count: 200, // Get more items to filter down later
        from_timestamp: fromTimestamp
      };
      
      // If a specific token is selected, add it to the params
      if (tokenFilter !== 'all') {
        const tokens = getMockTopTokens();
        const token = tokens.find(t => t.symbol === tokenFilter);
        if (token) {
          params.token = token.address;
        }
      }
      
      const response = await axios.get(`${EXPLORER_API_URL}/token-transfers`, { params });
      
      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('No transfers found');
      }
      
      // Process transfers
      const transfers = response.data.items.map((item: any) => {
        return {
          hash: item.transaction_hash || '',
          from: item.from?.hash || '',
          to: item.to?.hash || '',
          value: item.total?.value || '0',
          timestamp: item.timestamp, // Keep as ISO string
          tokenSymbol: item.token?.symbol || 'Unknown',
          tokenName: item.token?.name || 'Unknown Token',
          tokenAddress: item.token?.address || '',
          decimals: parseInt(item.token?.decimals || '18')
        };
      });
      
      // Calculate USD value and format values
      const processedTransfers = transfers.map(transfer => {
        const valueFormatted = formatValue(transfer.value, transfer.decimals);
        const usdValue = calculateMockUsdValue(valueFormatted, transfer.tokenSymbol);
        
        // Determine transaction type
        let type: 'buy' | 'sell' | 'transfer' = 'transfer';
        
        if (transfer.from.toLowerCase().includes('0x000000000000000000000000000000000000dead')) {
          type = 'buy';
        } else if (transfer.to.toLowerCase().includes('0x000000000000000000000000000000000000dead')) {
          type = 'sell';
        }
        
        // Calculate age using the timeAgo function which now handles ISO string timestamps
        const age = timeAgo(transfer.timestamp);
        
        return {
          hash: transfer.hash,
          from: transfer.from,
          to: transfer.to,
          value: transfer.value,
          valueFormatted,
          timestamp: transfer.timestamp,
          age,
          tokenSymbol: transfer.tokenSymbol,
          tokenName: transfer.tokenName,
          tokenAddress: transfer.tokenAddress,
          type,
          usdValue
        };
      });
      
      // Filter for whale transactions (value > $5,000)
      const whaleTransfers = processedTransfers.filter(transfer => {
        const usdValueNum = parseFloat(transfer.usdValue.replace(/[^0-9.-]+/g, '') || '0');
        return usdValueNum >= 5000;
      });
      
      // Sort by USD value (descending) and take top results
      const sortedWhaleTransfers = whaleTransfers
        .sort((a, b) => {
          const aValue = parseFloat(a.usdValue.replace(/[^0-9.-]+/g, '') || '0');
          const bValue = parseFloat(b.usdValue.replace(/[^0-9.-]+/g, '') || '0');
          return bValue - aValue;
        })
        .slice(0, limit);
      
      return sortedWhaleTransfers;
    } catch (apiError) {
      console.error('API error, using mock data:', apiError);
      // Generate mock whale transactions for demo purposes
      return generateMockWhaleTransactions(getMockTopTokens(), timeframe);
    }
  } catch (error) {
    console.error('Error in getWhaleTransactions:', error);
    return [];
  }
}

// Format large numbers for display
export function formatValue(value: string, decimals = 18): string {
  try {
    const valueBigInt = BigInt(value);
    const divisor = BigInt(10) ** BigInt(decimals);
    
    if (valueBigInt === BigInt(0)) return '0';
    
    // Handle case where value is less than 1
    if (valueBigInt < divisor) {
      const fractionalPart = valueBigInt.toString().padStart(decimals, '0');
      // Find first non-zero digit
      let firstNonZero = 0;
      for (let i = 0; i < fractionalPart.length; i++) {
        if (fractionalPart[i] !== '0') {
          firstNonZero = i;
          break;
        }
      }
      
      // Return with appropriate precision
      return `0.${fractionalPart.substring(0, firstNonZero + 4)}`;
    }
    
    // For values >= 1
    const wholePart = valueBigInt / divisor;
    const fractionalPart = valueBigInt % divisor;
    
    // Format the fractional part to have leading zeros
    let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    // Trim trailing zeros
    fractionalStr = fractionalStr.replace(/0+$/, '');
    
    // Format whole part with commas
    const wholePartStr = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Only show fractional part if it's not zero
    return fractionalStr ? `${wholePartStr}.${fractionalStr.substring(0, 4)}` : wholePartStr;
  } catch (e) {
    console.error('Error formatting value:', e);
    return '0';
  }
}

// Calculate how long ago a timestamp was
export function timeAgo(timestamp: number | string | undefined | null): string {
  // Handle invalid timestamps
  if (!timestamp) {
    return 'Recently';
  }
  
  let date: Date;
  
  // Handle string ISO timestamps (from API)
  if (typeof timestamp === 'string') {
    try {
      date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
    } catch (e) {
      return 'Recently';
    }
  } else if (typeof timestamp === 'number') {
    // Handle numeric Unix timestamps
    // Check if it's in seconds (Unix timestamp) or milliseconds
    if (timestamp > 1000000000000) {
      // Timestamp is in milliseconds
      date = new Date(timestamp);
    } else {
      // Timestamp is in seconds
      date = new Date(timestamp * 1000);
    }
    
    if (isNaN(date.getTime())) {
      return 'Recently';
    }
  } else {
    return 'Recently';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  
  // Handle invalid or future timestamps
  if (seconds < 0) {
    return 'Just now';
  }
  
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Mock function to calculate USD value
function calculateMockUsdValue(amount: string, symbol: string): string {
  // Remove commas from formatted amount
  const cleanAmount = amount.replace(/,/g, '');
  let price = 0;
  
  // Mock prices
  switch (symbol) {
    case 'MIOTA':
    case 'IOTA':
      price = 0.18;
      break;
    case 'SMR':
      price = 0.03;
      break;
    case 'ASMB':
      price = 0.05;
      break;
    case 'USDT':
    case 'USDC':
    case 'DAI':
      price = 1.0;
      break;
    case 'WBTC':
      price = 62000;
      break;
    case 'WETH':
      price = 3500;
      break;
    case 'LINK':
      price = 15;
      break;
    case 'UNI':
      price = 8;
      break;
    default:
      // Random price for other tokens
      price = 0.01 + (Math.random() * 0.5);
  }
  
  try {
    const usdValue = parseFloat(cleanAmount) * price;
    return usdValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    });
  } catch (e) {
    return '$0.00';
  }
}

// Function to generate mock top tokens
function getMockTopTokens(): Token[] {
  return [
    {
      address: '0x1234567890123456789012345678901234567890',
      name: 'IOTA Token',
      symbol: 'MIOTA',
      totalSupply: '2779530283277761',
      decimals: 18,
      holders: 12500,
      type: 'ERC20'
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      symbol: 'SMR',
      name: 'Shimmer',
      totalSupply: '1813616289453125',
      decimals: 18,
      holders: 8700,
      type: 'ERC20'
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      symbol: 'ASMB',
      name: 'Assembly',
      totalSupply: '1000000000000000000',
      decimals: 18,
      holders: 5400,
      type: 'ERC20'
    },
    {
      address: '0x4567890123456789012345678901234567890123',
      symbol: 'USDT',
      name: 'Tether USD',
      totalSupply: '78000000000000000',
      decimals: 6,
      holders: 3200,
      type: 'ERC20'
    },
    {
      address: '0x5678901234567890123456789012345678901234',
      symbol: 'USDC',
      name: 'USD Coin',
      totalSupply: '43000000000000000',
      decimals: 6,
      holders: 2800,
      type: 'ERC20'
    },
    {
      address: '0x6789012345678901234567890123456789012345',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      totalSupply: '120000000000000',
      decimals: 8,
      holders: 1900,
      type: 'ERC20'
    },
    {
      address: '0x7890123456789012345678901234567890123456',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      totalSupply: '1200000000000000000',
      decimals: 18,
      holders: 1700,
      type: 'ERC20'
    },
    {
      address: '0x8901234567890123456789012345678901234567',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      totalSupply: '32000000000000000',
      decimals: 18,
      holders: 1500,
      type: 'ERC20'
    },
    {
      address: '0x9012345678901234567890123456789012345678',
      symbol: 'LINK',
      name: 'Chainlink',
      totalSupply: '1000000000000000000',
      decimals: 18,
      holders: 1300,
      type: 'ERC20'
    },
    {
      address: '0x0123456789012345678901234567890123456789',
      symbol: 'UNI',
      name: 'Uniswap',
      totalSupply: '1000000000000000000',
      decimals: 18,
      holders: 1100,
      type: 'ERC20'
    }
  ];
}

// Function to generate mock whale transactions
function generateMockWhaleTransactions(tokens: Token[], timeframe: string): WhaleTransaction[] {
  const now = Math.floor(Date.now() / 1000);
  const mockTransactions: WhaleTransaction[] = [];
  
  // Generate 3-5 transactions for each token
  tokens.forEach(token => {
    const transactionCount = 3 + Math.floor(Math.random() * 3); // 3-5 transactions
    
    for (let i = 0; i < transactionCount; i++) {
      // Random transaction type
      const typeOptions: ('buy' | 'sell' | 'transfer')[] = ['buy', 'sell', 'transfer'];
      const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
      
      // Random value based on token
      const baseValue = Math.random() * 100000; // Base value between 0 and 100,000
      const valueMultiplier = token.symbol === 'MIOTA' || token.symbol === 'SMR' ? 10 : 1;
      const value = baseValue * valueMultiplier;
      
      // Random timestamp within the timeframe
      let timeframeHours: number;
      switch (timeframe) {
        case '3d':
          timeframeHours = 72;
          break;
        case '7d':
          timeframeHours = 168;
          break;
        default:
          timeframeHours = 24;
      }
      
      const randomHoursAgo = Math.random() * timeframeHours;
      const date = new Date(Date.now() - (randomHoursAgo * 60 * 60 * 1000));
      const timestamp = date.toISOString(); // Use ISO string format to match API
      
      // Generate random addresses
      const from = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const to = `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Create mock transaction
      mockTransactions.push({
        hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        from,
        to,
        value: BigInt(Math.floor(value * 10**18)).toString(),
        valueFormatted: value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        timestamp: timestamp,
        age: timeAgo(timestamp),
        tokenSymbol: token.symbol,
        tokenName: token.name,
        tokenAddress: token.address,
        type,
        usdValue: `$${(value * (token.symbol === 'USDT' || token.symbol === 'USDC' || token.symbol === 'DAI' ? 1 : Math.random() * 2)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        isMock: true // Mark as mock data
      });
    }
  });
  
  // Sort by timestamp (most recent first)
  return mockTransactions.sort((a, b) => {
    const aTime = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
    const bTime = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
    return bTime - aTime;
  });
}