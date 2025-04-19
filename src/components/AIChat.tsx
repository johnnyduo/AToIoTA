
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BarChart2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    description: string;
  };
}

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Hello! I\'m your DeFAI assistant. I can help you manage your portfolio, provide market insights, and execute trades for you. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
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
    
    // Simulate AI response after delay
    setTimeout(() => {
      let aiResponse: ChatMessage;
      
      // Pattern matching for demo purposes
      if (message.toLowerCase().includes('rebalance') || message.toLowerCase().includes('portfolio')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'I can help you rebalance your portfolio. Based on recent market conditions, I recommend increasing your allocation to AI tokens by 5% and reducing your exposure to Meme tokens. Would you like me to make these changes for you?',
          timestamp: new Date(),
          action: {
            type: 'rebalance',
            description: 'Rebalance portfolio: +5% AI, -5% Meme'
          }
        };
      } else if (message.toLowerCase().includes('market') || message.toLowerCase().includes('trend')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'Current market trends show increased institutional interest in AI tokens, with Neural Network (NNET) showing strong momentum. The meme sector is experiencing high volatility with Doge Moon (DMOON) up 45.2% in the last 24 hours. Would you like me to show you a detailed analysis?',
          timestamp: new Date(),
          action: {
            type: 'analysis',
            description: 'View Market Analysis'
          }
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: 'I understand you\'re interested in optimizing your investment strategy. Based on your portfolio, I recommend focusing on AI tokens which are showing strong fundamentals. Would you like me to provide specific token recommendations?',
          timestamp: new Date(),
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleActionClick = (action: any) => {
    toast({
      title: "Action Triggered",
      description: action.description,
    });
  };
  
  return (
    <Card className="card-glass overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Bot className="mr-2 h-6 w-6 text-nebula-400" />
          DeFAI Assistant
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
                      {msg.sender === 'user' ? 'You' : 'DeFAI Assistant'}
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
                      {msg.action.type === 'rebalance' ? <BarChart2 className="mr-1 h-3 w-3" /> : <ArrowRight className="mr-1 h-3 w-3" />}
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
                    <span className="ml-2 font-medium">DeFAI Assistant</span>
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
            placeholder="Ask DeFAI assistant..."
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
  );
};

export default AIChat;
