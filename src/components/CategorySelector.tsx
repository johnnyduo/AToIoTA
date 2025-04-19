
import { useState } from 'react';
import { Brain, Sparkles, Building, Landmark, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categories = [
  { id: 'ai', name: 'AI', icon: Brain, color: 'from-purple-600 to-indigo-600', description: 'Artificial Intelligence protocols and platforms' },
  { id: 'meme', name: 'Meme', icon: Sparkles, color: 'from-pink-600 to-rose-600', description: 'Trending meme tokens with high volatility' },
  { id: 'rwa', name: 'RWA', icon: Building, color: 'from-blue-500 to-cyan-600', description: 'Real World Assets tokenized on-chain' },
  { id: 'bigcap', name: 'Big Cap', icon: TrendingUp, color: 'from-emerald-600 to-green-600', description: 'Large market capitalization tokens' },
  { id: 'defi', name: 'DeFi', icon: Landmark, color: 'from-amber-500 to-yellow-600', description: 'Decentralized finance protocols and platforms' }
];

const CategorySelector = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('ai');
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">Investment Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className={`flex flex-col items-center p-4 h-auto rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                selectedCategory === category.id 
                ? `bg-gradient-to-br ${category.color} border-transparent` 
                : 'border-[#ffffff1a] hover:bg-white/5'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className={`flex items-center justify-center h-12 w-12 rounded-lg mb-2 ${
                selectedCategory === category.id ? 'bg-white/20' : `bg-gradient-to-br ${category.color} bg-opacity-10`
              }`}>
                <category.icon className={`h-6 w-6 ${selectedCategory === category.id ? 'text-white' : 'text-white/70'}`} />
              </div>
              <span className={`text-sm font-medium ${selectedCategory === category.id ? 'text-white' : 'text-white/70'}`}>
                {category.name}
              </span>
              <span className="text-xs text-white/70 mt-1 text-center">{category.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySelector;
