
import { useState } from 'react';
import { Brain, Sparkles, Building, Landmark, TrendingUp, Layers, Coins, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  { id: 'all', name: 'All', icon: TrendingUp, color: 'from-gray-500 to-gray-600', description: 'All investment categories' },
  { id: 'ai', name: 'AI', icon: Brain, color: 'from-purple-600 to-indigo-600', description: 'Artificial Intelligence tokens and platforms' },
  { id: 'meme', name: 'Meme', icon: Sparkles, color: 'from-pink-600 to-rose-600', description: 'Trending meme tokens with high volatility' },
  { id: 'rwa', name: 'RWA', icon: Building, color: 'from-blue-500 to-cyan-600', description: 'Real World Assets tokenized on-chain' },
  { id: 'bigcap', name: 'Big Cap', icon: Coins, color: 'from-emerald-600 to-green-600', description: 'Large market capitalization tokens' },
  { id: 'defi', name: 'DeFi', icon: Landmark, color: 'from-amber-500 to-yellow-600', description: 'Decentralized finance protocols and platforms' },
  { id: 'l1', name: 'Layer 1', icon: Layers, color: 'from-red-500 to-orange-600', description: 'Base layer blockchain protocols' },
  { id: 'stablecoin', name: 'Stablecoins', icon: ArrowRight, color: 'from-teal-500 to-teal-600', description: 'Price-stable cryptocurrency tokens' }
];

const strategies = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Equal allocation across all categories with slight weighting toward Big Cap and DeFi tokens.',
    allocations: {
      'ai': 15,
      'meme': 10,
      'rwa': 10,
      'bigcap': 25,
      'defi': 20,
      'l1': 15,
      'stablecoin': 5
    },
    recommendations: [
      'DEEP (AI): Strong development activity and partnership growth',
      'SMR (L1): Growing ecosystem and adoption metrics',
      'ETH (Big Cap): Core holding for portfolio stability'
    ],
    riskLevel: 'Medium'
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Higher allocation to growth sectors like AI and DeFi with reduced stablecoin holdings.',
    allocations: {
      'ai': 25,
      'meme': 15,
      'rwa': 10,
      'bigcap': 20,
      'defi': 20,
      'l1': 10,
      'stablecoin': 0
    },
    recommendations: [
      'DEEP (AI): Leading token in the AI category with strong potential',
      'MLUM (DeFi): Higher yield opportunities and platform growth',
      'PUNK (Meme): Trending with strong social indicators'
    ],
    riskLevel: 'High'
  },
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Focus on established tokens with higher stablecoin allocation for reduced volatility.',
    allocations: {
      'ai': 5,
      'meme': 0,
      'rwa': 20,
      'bigcap': 30,
      'defi': 15,
      'l1': 10,
      'stablecoin': 20
    },
    recommendations: [
      'wBTC (Big Cap): Digital gold with strong correlation to traditional markets',
      'IPG (RWA): Gold-backed token for inflation hedge',
      'USDC (Stablecoin): Secure reserve asset'
    ],
    riskLevel: 'Low'
  },
  {
    id: 'ai-focused',
    name: 'AI Revolution',
    description: 'Heavily weighted toward AI tokens to capitalize on the emerging AI trend in crypto.',
    allocations: {
      'ai': 40,
      'meme': 10,
      'rwa': 5,
      'bigcap': 15,
      'defi': 15,
      'l1': 10,
      'stablecoin': 5
    },
    recommendations: [
      'DEEP (AI): Core holding with advanced tech development',
      'HODLHamster (Meme): AI-themed meme token with viral growth',
      'SMR (L1): Infrastructure for AI applications'
    ],
    riskLevel: 'Very High'
  }
];

const CategorySelector = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const [showStrategyDialog, setShowStrategyDialog] = useState(false);
  const { toast } = useToast();
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    toast({
      title: `Selected: ${categories.find(c => c.id === categoryId)?.name}`,
      description: "Portfolio view updated with selected category",
    });
  };

  const applyStrategy = (strategy: any) => {
    setSelectedStrategy(strategy);
    toast({
      title: `Applied ${strategy.name} Strategy`,
      description: "Portfolio allocation has been updated based on AI recommendation.",
      variant: "default",
    });
    setShowStrategyDialog(false);
  };
  
  return (
    <Card className="card-glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">AI Investment Strategy</CardTitle>
        <Dialog open={showStrategyDialog} onOpenChange={setShowStrategyDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex gap-1 hover:bg-white/10">
              <Settings className="h-4 w-4" />
              Customize
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] bg-neutral-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-xl">AI Investment Strategies</DialogTitle>
              <DialogDescription>
                Choose an AI-recommended investment strategy or customize your own allocation.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="presets" className="w-full mt-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="presets">AI Strategies</TabsTrigger>
                <TabsTrigger value="custom">Custom Allocations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="presets" className="mt-4 space-y-4">
                {strategies.map((strategy) => (
                  <div 
                    key={strategy.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedStrategy.id === strategy.id 
                        ? 'border-purple-500 bg-purple-900/20' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-lg">{strategy.name}</h3>
                      <Badge className={`
                        ${strategy.riskLevel === 'Low' ? 'bg-green-600' : ''}
                        ${strategy.riskLevel === 'Medium' ? 'bg-amber-600' : ''}
                        ${strategy.riskLevel === 'High' ? 'bg-orange-600' : ''}
                        ${strategy.riskLevel === 'Very High' ? 'bg-red-600' : ''}
                      `}>
                        {strategy.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70 mt-1">{strategy.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {Object.entries(strategy.allocations).map(([cat, allocation]) => {
                        if (Number(allocation) > 0) {
                          const category = categories.find(c => c.id === cat);
                          return (
                            <Badge key={cat} variant="outline" className="bg-white/5">
                              {category?.name}: {allocation}%
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="custom" className="mt-4">
                <div className="p-4 border border-white/10 rounded-lg">
                  <p className="text-white/70 mb-4">
                    Create a custom allocation by adjusting percentages for each category.
                    Use the Settings tab to fine-tune your investment allocations.
                  </p>
                  <Button onClick={() => setShowStrategyDialog(false)}>
                    Go to Allocation Adjuster
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStrategyDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-button hover:opacity-90"
                onClick={() => applyStrategy(selectedStrategy)}
              >
                Apply Strategy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{selectedStrategy.name} Strategy</h3>
                <p className="text-sm text-white/70">{selectedStrategy.description}</p>
              </div>
              <Badge className={`
                ${selectedStrategy.riskLevel === 'Low' ? 'bg-green-600' : ''}
                ${selectedStrategy.riskLevel === 'Medium' ? 'bg-amber-600' : ''}
                ${selectedStrategy.riskLevel === 'High' ? 'bg-orange-600' : ''}
                ${selectedStrategy.riskLevel === 'Very High' ? 'bg-red-600' : ''}
              `}>
                {selectedStrategy.riskLevel} Risk
              </Badge>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">AI Recommendations:</h4>
              <ul className="space-y-1">
                {selectedStrategy.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm bg-white/5 p-2 rounded flex items-center">
                    <Brain className="h-3 w-3 mr-2 text-purple-400" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <h4 className="font-medium">Filter by Category:</h4>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={`flex flex-col items-center p-3 h-auto rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                  selectedCategory === category.id 
                  ? `bg-gradient-to-br ${category.color} border-transparent` 
                  : 'border-[#ffffff1a] hover:bg-white/5'
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className={`flex items-center justify-center h-10 w-10 rounded-lg mb-2 ${
                  selectedCategory === category.id ? 'bg-white/20' : `bg-gradient-to-br ${category.color} bg-opacity-10`
                }`}>
                  <category.icon className={`h-5 w-5 ${selectedCategory === category.id ? 'text-white' : 'text-white/70'}`} />
                </div>
                <span className={`text-xs font-medium ${selectedCategory === category.id ? 'text-white' : 'text-white/70'}`}>
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full hover:bg-white/10 border-white/20"
          onClick={() => setShowStrategyDialog(true)}
        >
          <Brain className="h-4 w-4 mr-2 text-purple-400" />
          Get AI Strategy Recommendations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategorySelector;
