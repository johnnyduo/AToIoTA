// src/components/GeminiTest.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTokenInsights, isGeminiAvailable } from '@/lib/geminiService';

const GeminiTest = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testGemini = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Gemini API is available
      if (!isGeminiAvailable()) {
        throw new Error('Gemini API key is not configured or invalid');
      }
      
      // Test with a simple token insight request
      const insight = await generateTokenInsights('ETH', 'Current price: $3,245.78, 24h change: 0.8%, Market cap: $389,000,000,000');
      setResult(insight);
    } catch (err: any) {
      console.error('Gemini test error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle>Gemini API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testGemini} 
          disabled={isLoading}
          className="bg-gradient-button hover:opacity-90"
        >
          {isLoading ? 'Testing...' : 'Test Gemini API'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-md text-red-300">
            <h3 className="font-semibold">Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && !error && (
          <div className="p-4 bg-green-500/20 border border-green-500 rounded-md text-green-300">
            <h3 className="font-semibold">Success! Response:</h3>
            <div className="mt-2 whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeminiTest;