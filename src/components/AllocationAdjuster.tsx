// src/components/AllocationAdjuster.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AllocationCategory {
  id: string;
  name: string;
  color: string;
  currentAllocation: number;
  newAllocation: number;
}

const AllocationAdjuster = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount(); // Using wagmi's useAccount hook
  const { 
    allocations, 
    pendingAllocations, 
    setPendingAllocations, 
    applyAllocations,
    isLoadingAllocations,
    isUpdatingAllocations
  } = useBlockchain();
  
  const [categories, setCategories] = useState<AllocationCategory[]>([]);
  const [isBalanced, setIsBalanced] = useState(true);
  
  // Initialize categories from blockchain data
  useEffect(() => {
    if (allocations.length > 0) {
      if (pendingAllocations) {
        // If there are pending changes, use those for new allocations
        setCategories(allocations.map(item => {
          const pendingItem = pendingAllocations.find(p => p.id === item.id);
          return {
            id: item.id,
            name: item.name,
            color: item.color,
            currentAllocation: item.allocation,
            newAllocation: pendingItem ? pendingItem.allocation : item.allocation
          };
        }));
      } else {
        // Otherwise use current allocations for both
        setCategories(allocations.map(item => ({
          id: item.id,
          name: item.name,
          color: item.color,
          currentAllocation: item.allocation,
          newAllocation: item.allocation
        })));
      }
    }
  }, [allocations, pendingAllocations]);
  
  const handleSliderChange = (index: number, value: number[]) => {
    const newCategories = [...categories];
    newCategories[index].newAllocation = value[0];
    
    // Check total allocation
    const total = newCategories.reduce((sum, cat) => sum + cat.newAllocation, 0);
    setIsBalanced(total === 100);
    
    setCategories(newCategories);
    
    // Update pending changes
    const updatedPendingAllocations = newCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      allocation: cat.newAllocation
    }));
    
    setPendingAllocations(updatedPendingAllocations);
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
    
    // Update pending changes
    const updatedPendingAllocations = newCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      allocation: cat.newAllocation
    }));
    
    setPendingAllocations(updatedPendingAllocations);
  };
  
  const handleApplyChanges = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to update portfolio allocations.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isBalanced) {
      toast({
        title: "Error",
        description: "Total allocation must equal 100%. Please adjust your allocations.",
        variant: "destructive",
      });
      return;
    }
    
    await applyAllocations();
  };
  
  const totalAllocation = categories.reduce((sum, cat) => sum + cat.newAllocation, 0);
  
  if (isLoadingAllocations) {
    return (
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="text-2xl">Adjust Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-nebula-400" />
          <span className="ml-2">Loading portfolio data...</span>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">Adjust Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to update portfolio allocations.
            </AlertDescription>
          </Alert>
        )}
        
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
              disabled={isUpdatingAllocations || !isConnected}
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
        <Button 
          variant="outline" 
          onClick={autoBalance}
          disabled={isUpdatingAllocations || !isConnected}
        >
          Auto Balance
        </Button>
        <Button 
          className="bg-gradient-button hover:opacity-90" 
          onClick={handleApplyChanges}
          disabled={!isBalanced || isUpdatingAllocations || !isConnected}
        >
          {isUpdatingAllocations ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting to Blockchain...
            </>
          ) : (
            "Apply Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AllocationAdjuster;