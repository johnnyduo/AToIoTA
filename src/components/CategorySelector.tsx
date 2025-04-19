
import { useState } from 'react';
import { Brain, Sparkles, Building, Landmark, TrendingUp, Layers, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

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

const CategorySelector = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const { toast } = useToast();
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    toast({
      title: `Selected: ${categories.find(c => c.id === categoryId)?.name}`,
      description: "Portfolio view updated with selected category",
    });
  };
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">Investment Categories</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default CategorySelector;
