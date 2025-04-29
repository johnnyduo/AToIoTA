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

const AllocationAdjuster = () => {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const {
    allocations,
    pendingAllocations,
    setPendingAllocations,
    applyAllocations,
    isLoadingAllocations,
    isUpdatingAllocations
  } = useBlockchain();

  const [localAllocations, setLocalAllocations] = useState<any[]>([]);
  const [isBalanced, setIsBalanced] = useState(true);

  // Initialize local state from blockchain context
  useEffect(() => {
    if (pendingAllocations) {
      setLocalAllocations(pendingAllocations);
    } else {
      setLocalAllocations(allocations);
    }
  }, [allocations, pendingAllocations]);

  const handleSliderChange = (index: number, value: number[]) => {
    const newAllocations = [...localAllocations];
    newAllocations[index] = { ...newAllocations[index], allocation: value[0] };
    setLocalAllocations(newAllocations);
    const total = newAllocations.reduce((sum, item) => sum + item.allocation, 0);
    setIsBalanced(total === 100);
    setPendingAllocations(newAllocations);
  };

  const autoBalance = () => {
    const total = localAllocations.reduce((sum, item) => sum + item.allocation, 0);
    let newAllocations = [...localAllocations];
    if (total !== 100) {
      const scaleFactor = 100 / total;
      newAllocations = newAllocations.map(item => ({
        ...item,
        allocation: Math.round(item.allocation * scaleFactor)
      }));
      // Fix rounding errors
      const adjustedTotal = newAllocations.reduce((sum, item) => sum + item.allocation, 0);
      if (adjustedTotal !== 100) {
        newAllocations[0].allocation += (100 - adjustedTotal);
      }
    }
    setLocalAllocations(newAllocations);
    setIsBalanced(true);
    setPendingAllocations(newAllocations);
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
    try {
      setPendingAllocations(localAllocations);
      const success = await applyAllocations();
      if (success) {
        toast({
          title: "Allocations Updated",
          description: "Your portfolio has been rebalanced successfully!"
        });
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update allocations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalAllocation = localAllocations.reduce((sum, item) => sum + item.allocation, 0);

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
        {localAllocations.map((item, index) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground font-roboto-mono text-sm">Current: {allocations.find(a => a.id === item.id)?.allocation}%</span>
                <span className="font-roboto-mono font-medium">{item.allocation}%</span>
              </div>
            </div>
            <Slider
              defaultValue={[allocations.find(a => a.id === item.id)?.allocation || 0]}
              max={100}
              step={1}
              value={[item.allocation]}
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