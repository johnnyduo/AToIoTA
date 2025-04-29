import { toast } from '@/components/ui/use-toast';

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
export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    const apiUrl = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
    const response = await fetch(
      `${apiUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    toast({
      title: 'Error fetching token prices',
      description: 'Could not retrieve the latest token data. Using cached data instead.',
      variant: 'destructive',
    });
    
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
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured');
    }
    
    // Gemini API endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Provide a brief market analysis and price prediction for the cryptocurrency ${tokenSymbol}. Include recent news, trading volume, and market sentiment. Keep it concise and focused on actionable insights.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error fetching token insights:', error);
    return 'Unable to retrieve token insights at this time. Please try again later.';
  }
};

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