import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, BarChart2, ArrowRight, TrendingUp, Search, Shield } from 'lucide-react';
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

// Enhanced market intelligence data for AI suggestions with realistic allocation changes
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
      type: 'rebalance',
      description: 'Increase DeFi exposure based on ShimmerSea metrics',
      changes: [
        { category: 'defi', name: 'DeFi', from: 15, to: 18 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 2 }
      ]
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
  },
  {
    type: 'defi',
    content: "DeFi yield opportunities analysis: AAVE protocol has increased lending yields to 8.2% APY for stablecoins. Consider shifting 3% from your Layer 1 allocation to DeFi to capitalize on this yield opportunity.",
    action: {
      type: 'rebalance',
      description: 'Increase DeFi allocation to capture higher yields',
      changes: [
        { category: 'defi', name: 'DeFi', from: 15, to: 18 },
        { category: 'l1', name: 'Layer 1', from: 15, to: 12 }
      ]
    }
  },
  {
    type: 'layer1',
    content: "On-chain metrics for SMR are showing strong growth with daily active addresses up 34% this month. The upcoming protocol upgrade could drive further adoption. Consider increasing your Layer 1 exposure.",
    action: {
      type: 'rebalance',
      description: 'Increase Layer 1 allocation based on SMR metrics',
      changes: [
        { category: 'l1', name: 'Layer 1', from: 15, to: 18 },
        { category: 'rwa', name: 'RWA', from: 15, to: 12 }
      ]
    }
  },
  {
    type: 'rwa',
    content: "Real World Assets (RWA) tokens are showing increased institutional adoption. Tokenized real estate platform REALT has onboarded three new institutional investors. Consider increasing your RWA allocation for portfolio stability.",
    action: {
      type: 'rebalance',
      description: 'Increase RWA allocation for portfolio stability',
      changes: [
        { category: 'rwa', name: 'RWA', from: 15, to: 18 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 7 }
      ]
    }
  },
  {
    type: 'bigcap',
    content: "Bitcoin's correlation with traditional markets has decreased to a 6-month low (0.32), suggesting improved diversification benefits. Consider increasing your Big Cap allocation as a hedge against market uncertainty.",
    action: {
      type: 'rebalance',
      description: 'Increase Bitcoin allocation as market hedge',
      changes: [
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 30 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
      ]
    }
  },
  {
    type: 'stablecoin',
    content: "Market volatility indicators are flashing warning signals with the Crypto Fear & Greed Index at 82 (Extreme Greed). Consider increasing your stablecoin reserves to prepare for potential market corrections.",
    action: {
      type: 'protection',
      description: 'Increase stablecoin reserves as volatility hedge',
      changes: [
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 10 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 }
      ]
    }
  },
  {
    type: 'balanced',
    content: "Portfolio analysis indicates your current allocation is suboptimal based on risk-adjusted return metrics. A more balanced approach across sectors could improve your Sharpe ratio by an estimated 0.4 points.",
    action: {
      type: 'rebalance',
      description: 'Optimize portfolio for better risk-adjusted returns',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 18 },
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 28 },
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 },
        { category: 'defi', name: 'DeFi', from: 15, to: 17 },
        { category: 'l1', name: 'Layer 1', from: 15, to: 12 },
        { category: 'rwa', name: 'RWA', from: 15, to: 15 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 5 }
      ]
    }
  },
  {
    type: 'security',
    content: "Security analysis of your portfolio indicates high exposure to newer, less audited protocols. Consider shifting 5% from AI tokens to more established projects with stronger security track records.",
    action: {
      type: 'protection',
      description: 'Reduce exposure to less secure protocols',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 10 },
        { category: 'bigcap', name: 'Big Cap', from: 25, to: 30 }
      ]
    }
  },
  {
    type: 'regulatory',
    content: "Regulatory developments in the EU suggest increased scrutiny of meme tokens. To mitigate regulatory risk, consider reducing your meme token exposure and increasing allocation to compliant assets.",
    action: {
      type: 'protection',
      description: 'Reduce regulatory risk exposure',
      changes: [
        { category: 'meme', name: 'Meme & NFT', from: 10, to: 5 },
        { category: 'rwa', name: 'RWA', from: 15, to: 20 }
      ]
    }
  },
  {
    type: 'yield',
    content: "Yield analysis shows SMR staking returns have increased to 9.3% APY following the latest protocol upgrade. Consider increasing your Layer 1 allocation to capture these enhanced staking rewards.",
    action: {
      type: 'rebalance',
      description: 'Increase Layer 1 allocation for higher staking yields',
      changes: [
        { category: 'l1', name: 'Layer 1', from: 15, to: 20 },
        { category: 'stablecoin', name: 'Stablecoins', from: 5, to: 0 }
      ]
    }
  },
  {
    type: 'innovation',
    content: "The AI token sector is experiencing accelerated innovation with DEEP launching a new neural network marketplace. Early adopters could benefit from significant growth. Consider increasing your AI allocation.",
    action: {
      type: 'rebalance',
      description: 'Increase AI allocation to capture innovation growth',
      changes: [
        { category: 'ai', name: 'AI & DeFi', from: 15, to: 20 },
        { category: 'defi', name: 'DeFi', from: 15, to: 10 }
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
    const checkGeminiAvailability = async () => {
      try {
        const available = await isGeminiAvailable();
        setIsGeminiEnabled(available);
      } catch (error) {
        console.error('Error checking Gemini availability:', error);
        setIsGeminiEnabled(false);
      }
    };
    
    checkGeminiAvailability();
  }, []);
  
  // Helper function to adapt AI suggestions to current portfolio allocations
  const adaptSuggestionToCurrentAllocations = useCallback((suggestion: any) => {
    if (!suggestion.action?.changes || !allocations.length) return suggestion;
    
    const currentAllocationMap = Object.fromEntries(
      allocations.map(a => [a.id, a.allocation])
    );
    
    // Create a deep copy of the suggestion
    const adaptedSuggestion = JSON.parse(JSON.stringify(suggestion));
    
    // Adapt the changes to current allocations
    adaptedSuggestion.action.changes = adaptedSuggestion.action.changes.map((change: any) => {
      const currentValue = currentAllocationMap[change.category] || change.from;
      const difference = change.to - change.from; // Original intended change
      
      return {
        ...change,
        from: currentValue,
        to: Math.max(0, Math.min(100, currentValue + difference)) // Ensure values are between 0-100
      };
    });
    
    return adaptedSuggestion;
  }, [allocations]);
  
  const triggerAIInsight = (insight: any) => {
    setIsTyping(true);
    
    // Adapt the insight to current allocations
    const adaptedInsight = adaptSuggestionToCurrentAllocations(insight);
    
    // Simulate AI working on analysis
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: `📊 **AI Market Intelligence Alert**\n\n${adaptedInsight.content}`,
        timestamp: new Date(),
        action: adaptedInsight.action
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
  
  // Function to get a random rule-based response when Gemini fails
  const getRandomRuleBasedResponse = (userMessage: string) => {
    // Analyze the user message for keywords to provide more relevant responses
    const lowerCaseMsg = userMessage.toLowerCase();
    
    // Check for specific topics in the user message
    if (lowerCaseMsg.includes('bitcoin') || lowerCaseMsg.includes('btc')) {
      return marketInsights.find(insight => insight.type === 'bigcap') || marketInsights[8];
    } else if (lowerCaseMsg.includes('ai') || lowerCaseMsg.includes('artificial intelligence')) {
      return marketInsights.find(insight => insight.type === 'innovation') || marketInsights[14];
    } else if (lowerCaseMsg.includes('defi') || lowerCaseMsg.includes('yield')) {
      return marketInsights.find(insight => insight.type === 'yield') || marketInsights[5];
    } else if (lowerCaseMsg.includes('risk') || lowerCaseMsg.includes('safe')) {
      return marketInsights.find(insight => insight.type === 'security') || marketInsights[11];
    } else if (lowerCaseMsg.includes('meme') || lowerCaseMsg.includes('nft')) {
      return marketInsights.find(insight => insight.type === 'risk') || marketInsights[4];
    } else if (lowerCaseMsg.includes('layer 1') || lowerCaseMsg.includes('l1') || lowerCaseMsg.includes('blockchain')) {
      return marketInsights.find(insight => insight.type === 'layer1') || marketInsights[6];
    } else if (lowerCaseMsg.includes('stable') || lowerCaseMsg.includes('usdt') || lowerCaseMsg.includes('usdc')) {
      return marketInsights.find(insight => insight.type === 'stablecoin') || marketInsights[9];
    } else if (lowerCaseMsg.includes('rwa') || lowerCaseMsg.includes('real world')) {
      return marketInsights.find(insight => insight.type === 'rwa') || marketInsights[7];
    }     else if (lowerCaseMsg.includes('rebalance') || lowerCaseMsg.includes('portfolio')) {
      return marketInsights.find(insight => insight.type === 'balanced') || marketInsights[10];
    } else if (lowerCaseMsg.includes('regulation') || lowerCaseMsg.includes('compliance')) {
      return marketInsights.find(insight => insight.type === 'regulatory') || marketInsights[12];
    }
    
    // If no specific topic is detected, return a random insight
    return marketInsights[Math.floor(Math.random() * marketInsights.length)];
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
        
        // If action contains changes, adapt them to current allocations
        let adaptedAction = action;
        if (action?.changes) {
          adaptedAction = {
            ...action,
            changes: action.changes.map((change: any) => {
              const currentAllocation = allocations.find(a => a.id === change.category);
              const currentValue = currentAllocation ? currentAllocation.allocation : change.from;
              const difference = change.to - change.from; // Original intended change
              
              return {
                ...change,
                from: currentValue,
                to: Math.max(0, Math.min(100, currentValue + difference)) // Ensure values are between 0-100
              };
            })
          };
        }
        
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: content,
          timestamp: new Date(),
          action: adaptedAction
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
        
        // Fall back to rule-based responses
        const ruleBasedResponse = getRandomRuleBasedResponse(message);
        const adaptedResponse = adaptSuggestionToCurrentAllocations(ruleBasedResponse);
        
        setTimeout(() => {
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: `Based on your query, I've analyzed the current market conditions:\n\n${adaptedResponse.content}`,
            timestamp: new Date(),
            action: adaptedResponse.action
          };
          
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);
        }, 1500);
        
        return;
      }
    }
    
    // Fallback to rule-based responses if Gemini is not enabled
    setTimeout(() => {
      const ruleBasedResponse = getRandomRuleBasedResponse(message);
      const adaptedResponse = adaptSuggestionToCurrentAllocations(ruleBasedResponse);
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: `Based on your query, I've analyzed the current market conditions:\n\n${adaptedResponse.content}`,
        timestamp: new Date(),
        action: adaptedResponse.action
      };
      
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
      
      // Create a deep copy to avoid reference issues
      const currentAllocationsCopy = JSON.parse(JSON.stringify(currentAllocations));
      
      // For each change in the action, update the 'from' value to match current allocation
      const updatedChanges = action.changes.map((change: any) => {
        const currentAllocation = currentAllocationsCopy.find((a: any) => a.id === change.category);
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
      
      console.log('Setting current action for modal:', updatedAction);
      
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
        const adaptedInsight = adaptSuggestionToCurrentAllocations(randomInsight);
        triggerAIInsight(adaptedInsight);
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
                         msg.action.type === 'protection' ? <Shield className="mr-1 h-3 w-3" /> :
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