import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AllocationCategory {
  id: string;
  name: string;
  color: string;
  currentAllocation: number;
  newAllocation: number;
}

const AllocationAdjuster = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<AllocationCategory[]>([
    { id: 'ai', name: 'AI & DeFi', color: '#8B5CF6', currentAllocation: 15, newAllocation: 15 },
    { id: 'meme', name: 'Meme & NFT', color: '#EC4899', currentAllocation: 10, newAllocation: 10 },
    { id: 'rwa', name: 'RWA', color: '#0EA5E9', currentAllocation: 15, newAllocation: 15 },
    { id: 'bigcap', name: 'Big Cap', color: '#10B981', currentAllocation: 25, newAllocation: 25 },
    { id: 'defi', name: 'DeFi', color: '#F59E0B', currentAllocation: 15, newAllocation: 15 },
    { id: 'l1', name: 'Layer 1', color: '#EF4444', currentAllocation: 15, newAllocation: 15 },
    { id: 'stablecoin', name: 'Stablecoins', color: '#14B8A6', currentAllocation: 5, newAllocation: 5 },
  ]);
  
  const [isBalanced, setIsBalanced] = useState(true);
  
  const handleSliderChange = (index: number, value: number[]) => {
    const newCategories = [...categories];
    const previousValue = newCategories[index].newAllocation;
    const newValue = value[0];
    const difference = newValue - previousValue;
    
    newCategories[index].newAllocation = newValue;
    
    // Check total allocation
    const total = newCategories.reduce((sum, cat) => sum + cat.newAllocation, 0);
    
    setIsBalanced(total === 100);
    setCategories(newCategories);
  };
  
  const autoBalance = () => {
    const newCategories = [...categories];
    const total = newCategories.reduce((sum, cat) => sum + cat.newAllocation, 0);
    
    if (total !== 100) {
      // Adjust each category proportionally
      const scaleFactor = 100 / total;
      newCategories.forEach((category, index) => {
        newCategories[index].newAllocation = Math.round(category.newAllocation * scaleFactor);
      });
      
      // Handle rounding errors by adjusting the first category
      const adjustedTotal = newCategories.reduce((sum, cat) => sum + cat.newAllocation, 0);
      if (adjustedTotal !== 100) {
        newCategories[0].newAllocation += (100 - adjustedTotal);
      }
    }
    
    setCategories(newCategories);
    setIsBalanced(true);
  };
  
  const applyChanges = () => {
    if (!isBalanced) {
      toast({
        title: "Error",
        description: "Total allocation must equal 100%. Please adjust your allocations.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would normally send these changes to your backend
    toast({
      title: "Changes Applied",
      description: "Your new portfolio allocation has been saved.",
    });
    
    // Update current allocations to match new allocations
    setCategories(categories.map(cat => ({
      ...cat,
      currentAllocation: cat.newAllocation
    })));
  };
  
  const totalAllocation = categories.reduce((sum, cat) => sum + cat.newAllocation, 0);
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">Adjust Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category, index) => (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground font-roboto-mono text-sm">Current: {category.currentAllocation}%</span>
                <span className="font-roboto-mono font-medium">{category.newAllocation}%</span>
              </div>
            </div>
            <Slider 
              defaultValue={[category.currentAllocation]} 
              max={100} 
              step={1}
              value={[category.newAllocation]}
              onValueChange={(value) => handleSliderChange(index, value)}
              className="cursor-pointer"
            />
          </div>
        ))}
        
        <div className={`rounded-lg p-4 ${totalAllocation === 100 ? 'bg-nebula-900/50' : 'bg-destructive/20'}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Allocation:</span>
            <span 
              className={`font-roboto-mono font-bold ${
                totalAllocation === 100 ? 'text-nebula-400' : 'text-destructive'
              }`}
            >
              {totalAllocation}%
            </span>
          </div>
          {totalAllocation !== 100 && (
            <p className="text-xs text-destructive mt-1">
              Total allocation must equal 100%. Adjust your allocations or click "Auto Balance".
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={autoBalance}>Auto Balance</Button>
        <Button 
          className="bg-gradient-button hover:opacity-90" 
          onClick={applyChanges}
          disabled={!isBalanced}
        >
          Apply Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AllocationAdjuster;
