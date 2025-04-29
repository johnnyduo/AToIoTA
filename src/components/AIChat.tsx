import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BarChart2, ArrowRight, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import AdjustmentModal from './AdjustmentModal';
import { fetchTokenInsights } from '@/lib/tokenService';
import { generateChatResponse, isGeminiAvailable } from '@/lib/geminiService';
import { useAccount } from 'wagmi';
import { useBlockchain } from '@/contexts/BlockchainContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    description: string;
    changes?: {
      category: string;
      name: string;
      from: number;
      to: number;
    }[];
  };
}

// Storage key for chat messages in localStorage
const CHAT_STORAGE_KEY = 'atoiota_chat_messages';

// Market intelligence data for AI suggestions
const marketInsights = [
  {
    type: 'trending',
    content: "Based on on-chain data analysis, DEEP (AI) is showing a significant increase in whale accumulation. Three addresses have accumulated over $2.7M in the last 48 hours. Consider increasing your AI allocation by 5%.",
    action: {
      type: 'rebalance',
      description: 'Increase AI allocation based on whale accumulation data',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 20 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
      ]
    }
  },
  {
    type: 'volume',
    content: "HODLHamster is experiencing abnormal trading volume, up 320% in the last 24 hours. Social sentiment analysis shows this meme coin trending across major platforms. Consider a small speculative position of 2%.",
    action: {
      type: 'trade',
      description: 'Add HODLHamster position based on volume and sentiment analysis',
      changes: [
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 12 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 3 }
      ]
    }
  },
  {
    type: 'news',
    content: "Breaking: ShimmerSea DEX volume has increased 78% following the SMR price rally. According to our technical analysis, the MLUM token is currently undervalued based on TVL metrics. Consider increasing your DeFi exposure.",
    action: {
      type: 'analysis',
      description: 'View detailed DeFi Analysis Report for ShimmerSea ecosystem'
    }
  },
  {
    type: 'technical',
    content: "Technical analysis suggests wBTC is forming a bullish consolidation pattern with decreasing sell pressure. With traditional markets showing uncertainty, increasing your Bitcoin exposure may provide a hedge. Recommend 3% allocation shift from stablecoins to wBTC.",
    action: {
      type: 'rebalance',
      description: 'Shift allocation from stablecoins to Bitcoin based on technical analysis',
      changes: [
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 2 }
      ]
    }
  },
  {
    type: 'risk',
    content: "Risk assessment alert: Your portfolio exposure to meme tokens (22%) exceeds recommended thresholds. Consider rebalancing to reduce volatility, particularly with BEAST token showing signs of distribution by early investors.",
    action: {
      type: 'protection',
      description: 'Reduce meme token exposure to mitigate volatility risk',
      changes: [
        { category: 'meme', name: 'Meme & NFT', from: 22, to: 15 },
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 9 }
      ]
    }
  }
];

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isConnected, address } = useAccount();
  const { allocations, pendingAllocations } = useBlockchain();
  
  // Load chat messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    
    if (savedMessages) {
      try {
        // Parse the saved messages and convert timestamp strings back to Date objects
        const parsedMessages = JSON.parse(savedMessages, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
        
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat messages from localStorage:', error);
        // If there's an error, initialize with the default welcome message
        initializeDefaultMessage();
      }
    } else {
      // If no saved messages, initialize with the default welcome message
      initializeDefaultMessage();
    }
  }, []);
  
  // Initialize with default welcome message
  const initializeDefaultMessage = () => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        content: 'Hello! I\'m your AToIoTA assistant. I can help you manage your portfolio, provide market insights, and suggest optimal allocations. How can I assist you today?',
        timestamp: new Date(),
      }
    ]);
  };
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);
  
  // Auto-send an AI insight after component mount if there are no messages
  useEffect(() => {
    if (messages.length <= 1) {
      const timer = setTimeout(() => {
        const randomInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
        triggerAIInsight(randomInsight);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [messages.length]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if Gemini API is available
  useEffect(() => {
    setIsGeminiEnabled(isGeminiAvailable());
  }, []);
  
  const triggerAIInsight = (insight: any) => {
    setIsTyping(true);
    
    // Simulate AI working on analysis
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: `📊 **AI Market Intelligence Alert**\n\n${insight.content}`,
        timestamp: new Date(),
        action: insight.action
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Show toast notification
      toast({
        title: "New AI Market Intelligence",
        description: "Portfolio analysis has discovered a new opportunity",
      });
    }, 1000);
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    
    // Check if the message is asking about a specific token price
    const tokenPriceMatch = message.toLowerCase().match(/price\s+of\s+([a-z0-9]+)|([a-z0-9]+)\s+price|about\s+([a-z0-9]+)/i);
    const tokenSymbol = tokenPriceMatch ? (tokenPriceMatch[1] || tokenPriceMatch[2] || tokenPriceMatch[3]).toUpperCase() : null;
    
    // If asking about a specific token and Gemini is enabled
    if (tokenSymbol && isGeminiEnabled) {
      try {
        // Fetch token insights
        const insights = await fetchTokenInsights(tokenSymbol);
        
        // Check if the response is an error message
        const isErrorResponse = insights.startsWith('Unable to retrieve token insights');
        
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: insights,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
        
        // If we got an error response, also show a toast
        if (isErrorResponse) {
          toast({
            title: "Gemini API Issue",
            description: "There was a problem with the Gemini API. Using fallback responses.",
          });
        }
        
        return;
      } catch (error) {
        console.error('Error fetching token insights:', error);
        // Fall back to pattern matching if API call fails
      }
    }
    
    // Try using Gemini for general chat responses
    if (isGeminiEnabled) {
      try {
        // Get last 5 messages for context
        const recentMessages = messages.slice(-5).map(msg => ({
          sender: msg.sender,
          content: msg.content
        }));
        
        // Generate response using Gemini
        const { content, action } = await generateChatResponse(message, recentMessages);
        
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: content,
          timestamp: new Date(),
          action: action
        };
        
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
        return;
      } catch (error) {
        console.error('Error generating chat response with Gemini:', error);
        
        // Show a toast notification about the API issue
        toast({
          title: "Gemini API Issue",
          description: error instanceof Error 
            ? error.message 
            : "There was a problem with the Gemini API. Using fallback responses.",
          variant: "destructive"
        });
        // Fall back to pattern matching
      }
    }
    
    // Fallback to pattern matching (existing code)
    setTimeout(() => {
      let aiResponse: ChatMessage;
      
      // Pattern matching for demo purposes
      if (message.toLowerCase().includes('rebalance') || message.toLowerCase().includes('portfolio')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'Based on current market conditions and on-chain data, I recommend the following portfolio adjustments:\n\n• Increase AI tokens allocation by 5% (focusing on DEEP)\n• Reduce meme token exposure by 3%\n• Add 2% to Layer 1 protocols (SMR showing strong fundamentals)\n• Maintain current stablecoin reserves as market volatility index is elevated\n\nThis rebalancing would optimize your risk-adjusted returns based on the latest market trends.',
          timestamp: new Date(),
          action: {
            type: 'rebalance',
            description: 'Apply recommended portfolio rebalance',
            changes: [
              { category: 'ai', name: 'AI & DeFi', from: 15, to: 20 },
              { category: 'meme', name: 'Meme & NFT', from: 10, to: 7 },
              { category: 'l1', name: 'Layer 1', from: 15, to: 17 },
              { category: 'defi', name: 'DeFi', from: 15, to: 11 }
            ]
          }
        };
      } else if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('market')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'Latest market analysis reveals several key trends:\n\n1. AI tokens showing strong momentum with institutional inflows\n2. HODLHamster (meme) has surged 78.3% with abnormal social volume\n3. Layer 1 protocols experiencing renewed interest with SMR leading at +7.5%\n4. DeFi sector stabilizing with positive yield trends\n\nWhale addresses are accumulating DEEP and SMR according to on-chain data, suggesting potential continued upside.',
          timestamp: new Date(),
          action: {
            type: 'analysis',
            description: 'View Detailed Market Analysis'
          }
        };
      } else if (message.toLowerCase().includes('ai') || message.toLowerCase().includes('deep')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'DEEP is showing strong fundamentals with several bullish indicators:\n\n• Developer activity up 34% month-over-month\n• New partnership with major AI research firm announced\n• Social sentiment analysis highly positive (89/100)\n• Technical indicators: MACD bullish crossover, RSI at 62\n\nBased on quantitative analysis, DEEP has a 73% probability of outperforming the broader market in the coming month. Consider increasing your allocation.',
          timestamp: new Date(),
          action: {
            type: 'trade',
            description: 'Increase DEEP allocation',
            changes: [
              { category: 'ai', name: 'AI & DeFi', from: 15, to: 20 },
              { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
            ]
          }
        };
      } else if (message.toLowerCase().includes('meme') || message.toLowerCase().includes('risk')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'Risk assessment for meme token category:\n\nYour current allocation (22%) exceeds our recommended threshold of 15% for speculative assets. While HODLHamster and PUNK show strong momentum, the sector volatility is 3.2x higher than other categories.\n\nSuggestion: Consider taking profits on BEAST token which shows distribution patterns from early investors and potential technical weakness.',
          timestamp: new Date(),
          action: {
            type: 'protection',
            description: 'Reduce meme token risk',
            changes: [
              { category: 'meme', name: 'Meme & NFT', from: 22, to: 15 },
              { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
              { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 9 }
            ]
          }
        };
      } else {
        // Get random insight for other queries
        const randomInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: `Based on your query, I've analyzed the current market conditions and found this insight:\n\n${randomInsight.content}`,
          timestamp: new Date(),
          action: randomInsight.action
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleActionClick = async (action: any) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to apply portfolio changes.",
      });
      return;
    }
    
    if (action.changes) {
      // If the action has changes, we need to prepare them for the modal
      // First, get the current allocations from the blockchain context
      const currentAllocations = pendingAllocations || allocations;
      
      // For each change in the action, update the 'from' value to match current allocation
      const updatedChanges = action.changes.map((change: any) => {
        const currentAllocation = currentAllocations.find((a: any) => a.id === change.category);
        return {
          ...change,
          from: currentAllocation ? currentAllocation.allocation : change.from
        };
      });
      
      // Create an updated action with the correct 'from' values
      const updatedAction = {
        ...action,
        changes: updatedChanges
      };
      
      // Set the current action and open the modal
      setCurrentAction(updatedAction);
      setAdjustmentOpen(true);
    } else if (action.type === 'analysis') {
      toast({
        title: "Analysis in Progress",
        description: "Generating detailed market analysis...",
      });
      
      // If it's a market analysis action, send another insight after a delay
      setTimeout(() => {
        const randomInsight = marketInsights[Math.floor(Math.random() * marketInsights.length)];
        triggerAIInsight(randomInsight);
      }, 4000);
    } else {
      toast({
        title: "Action Triggered",
        description: action.description,
      });
    }
  };
  
  return (
    <>
      <Card className="card-glass overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Bot className="mr-2 h-6 w-6 text-nebula-400" />
            AToIoTA Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-nebula-800' : 'bg-cosmic-700'} rounded-2xl p-4`}>
                    <div className="flex items-center mb-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        msg.sender === 'user' ? 'bg-nebula-600' : 'bg-gradient-nebula'
                      }`}>
                        {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <span className="ml-2 font-medium">
                        {msg.sender === 'user' ? 'You' : 'AToIoTA Assistant'}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground font-roboto-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.action && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 bg-white/10 hover:bg-white/20 text-xs"
                        onClick={() => handleActionClick(msg.action)}
                      >
                        {msg.action.type === 'rebalance' ? <BarChart2 className="mr-1 h-3 w-3" /> : 
                         msg.action.type === 'analysis' ? <Search className="mr-1 h-3 w-3" /> :
                         msg.action.type === 'trade' ? <TrendingUp className="mr-1 h-3 w-3" /> :
                         <ArrowRight className="mr-1 h-3 w-3" />}
                        {msg.action.description}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-cosmic-700 rounded-2xl p-4 max-w-[80%]">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-nebula flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <span className="ml-2 font-medium">AToIoTA Assistant</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="h-2 w-2 bg-nebula-400 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-nebula-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-nebula-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t border-[#ffffff1a]">
          <div className="flex w-full space-x-2">
            <Input
              placeholder="Ask AToIoTA assistant about market trends, tokens, or portfolio advice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="input-dark"
            />
            <Button 
              className="bg-gradient-button hover:opacity-90" 
              size="icon" 
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AdjustmentModal 
        open={adjustmentOpen} 
        onOpenChange={setAdjustmentOpen} 
        action={currentAction}
      />
    </>
  );
};

export default AIChat;
