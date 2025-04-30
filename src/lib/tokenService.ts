// src/lib/tokenService.ts
import { toast } from '@/components/ui/use-toast';
import { generateTokenInsights, isGeminiAvailable } from './geminiService';

// Types for token data
export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

/**
 * Fetch token prices from CoinGecko API
 * This is a free public API that doesn't require authentication
 */
export const fetchTokenPrices = async (specificTokens?: string[]): Promise<TokenPrice[]> => {
  try {
    const apiUrl = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
    const response = await fetch(
      `${apiUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // If specific tokens are requested, filter the results
    if (specificTokens && specificTokens.length > 0) {
      const filteredData = data.filter((token: TokenPrice) => 
        specificTokens.some(symbol => 
          token.symbol.toLowerCase() === symbol.toLowerCase()
        )
      );
      return filteredData;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    
    // Return empty array if fetch fails
    return [];
  }
};

/**
 * Fetch token insights using Gemini API
 * This requires a valid Gemini API key in the .env file
 */
export const fetchTokenInsights = async (tokenSymbol: string): Promise<string> => {
  try {
    // Check if we have cached insights for this token
    const cachedInsights = localStorage.getItem(`token_insights_${tokenSymbol.toLowerCase()}`);
    const cacheTime = localStorage.getItem(`token_insights_${tokenSymbol.toLowerCase()}_time`);
    
    // If we have cached insights that are less than 1 hour old, use them
    if (cachedInsights && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime);
      if (cacheAge < 60 * 60 * 1000) { // 1 hour
        return cachedInsights;
      }
    }
    
    // Check if Gemini API is available
    if (!isGeminiAvailable()) {
      throw new Error('Gemini API key not configured');
    }
    
    // Get current price data for context
    let priceContext = '';
    try {
      const tokenPrices = await fetchTokenPrices([tokenSymbol]);
      if (tokenPrices.length > 0) {
        const token = tokenPrices[0];
        priceContext = `Current price: $${token.current_price}, 24h change: ${token.price_change_percentage_24h.toFixed(2)}%, Market cap: $${token.market_cap}`;
      }
    } catch (error) {
      console.error('Error fetching price data for insights:', error);
      // Continue without price context
    }
    
    // Generate insights using our geminiService
    const insights = await generateTokenInsights(tokenSymbol, priceContext);
    
    // Cache the insights
    localStorage.setItem(`token_insights_${tokenSymbol.toLowerCase()}`, insights);
    localStorage.setItem(`token_insights_${tokenSymbol.toLowerCase()}_time`, Date.now().toString());
    
    return insights;
  } catch (error) {
    console.error('Error fetching token insights:', error);
    return 'Unable to retrieve token insights at this time. Please try again later.';
  }
};

// Re-export isGeminiAvailable from geminiService
export { isGeminiAvailable } from './geminiService';

/**
 * Cache token data in localStorage
 */
export const cacheTokenData = (data: TokenPrice[]): void => {
  try {
    localStorage.setItem('cached_token_data', JSON.stringify(data));
    localStorage.setItem('token_data_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error caching token data:', error);
  }
};

/**
 * Get cached token data from localStorage
 */
export const getCachedTokenData = (): { data: TokenPrice[], timestamp: number } => {
  try {
    const cachedData = localStorage.getItem('cached_token_data');
    const timestamp = parseInt(localStorage.getItem('token_data_timestamp') || '0', 10);
    
    if (cachedData) {
      return { 
        data: JSON.parse(cachedData),
        timestamp
      };
    }
  } catch (error) {
    console.error('Error retrieving cached token data:', error);
  }
  
  return { data: [], timestamp: 0 };
};