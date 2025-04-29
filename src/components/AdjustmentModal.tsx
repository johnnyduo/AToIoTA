// src/components/AdjustmentModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { toast } from 'sonner';

interface AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: any;
}

const AdjustmentModal = ({ open, onOpenChange, action }: AdjustmentModalProps) => {
  const { allocations, pendingAllocations, setPendingAllocations, applyAllocations, isUpdatingAllocations } = useBlockchain();
  const [isApplying, setIsApplying] = useState(false);
  const [localAllocations, setLocalAllocations] = useState<any[]>([]);
  const [total, setTotal] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with current allocations when modal opens
  useEffect(() => {
    if (open && action) {
      // Start with current allocations from blockchain context
      const currentAllocations = pendingAllocations || allocations;
      
      // Create a deep copy to avoid reference issues
      const initialAllocations = JSON.parse(JSON.stringify(currentAllocations));
      
      // If AI action includes changes, apply them to our local state
      if (action.changes && Array.isArray(action.changes)) {
        action.changes.forEach((change: any) => {
          const allocationToUpdate = initialAllocations.find((a: any) => a.id === change.category);
          if (allocationToUpdate) {
            allocationToUpdate.allocation = change.to;
          }
        });
        
        // Mark that we have changes from AI
        setHasChanges(true);
      }
      
      setLocalAllocations(initialAllocations);
      
      // Calculate total
      const newTotal = initialAllocations.reduce((sum: number, item: any) => sum + item.allocation, 0);
      setTotal(newTotal);
    }
  }, [open, action, allocations, pendingAllocations]);

  const handleSliderChange = (id: string, value: number) => {
    const updated = localAllocations.map(item => 
      item.id === id ? { ...item, allocation: value } : item
    );
    
    setLocalAllocations(updated);
    setHasChanges(true);
    
    // Recalculate total
    const newTotal = updated.reduce((sum, item) => sum + item.allocation, 0);
    setTotal(newTotal);
  };

  const handleApply = async () => {
    if (total !== 100) {
      toast.error("Invalid Allocation", "Total allocation must equal 100%");
      return;
    }
    
    setIsApplying(true);
    
    try {
      // Update pending allocations in the blockchain context
      setPendingAllocations(localAllocations);
      
      // Close the modal
      onOpenChange(false);
      
      // Apply the changes to the blockchain
      const success = await applyAllocations();
      
      if (success) {
        toast.success("Allocations Updated", "Your portfolio has been rebalanced successfully!");
      }
    } catch (error) {
      console.error('Error applying allocations:', error);
      toast.error(
        "Update Failed", 
        error instanceof Error ? error.message : "Failed to update allocations. Please try again."
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    // Reset to original allocations
    setLocalAllocations(allocations);
    setTotal(100);
    setHasChanges(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] bg-cosmic-900 border-cosmic-700 max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-nebula-400" />
            Portfolio Rebalance
          </DialogTitle>
          <DialogDescription>
            {action?.description || "Adjust your portfolio allocation across different asset categories."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Sliders */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Adjust Allocations</h3>
              {localAllocations.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                      {action?.changes?.some((change: any) => change.category === item.id) && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-nebula-500/20 text-nebula-400">
                          AI Suggested
                        </span>
                      )}
                    </div>
                    <span className="font-roboto-mono">{item.allocation}%</span>
                  </div>
                  <Slider
                    value={[item.allocation]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleSliderChange(item.id, value[0])}
                    className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-nebula-600 [&>span:first-child]:to-nebula-400"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t border-cosmic-700">
                <span className="font-medium">Total Allocation</span>
                <span className={`font-roboto-mono font-bold ${total !== 100 ? 'text-red-500' : 'text-green-500'}`}>{total}%</span>
              </div>
              {total !== 100 && (
                <div className="flex items-center p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Total allocation must equal 100%. Please adjust your allocations.</p>
                </div>
              )}
            </div>
            {/* Right column: Summary and AI recommendation */}
            <div className="space-y-4">
              {/* Portfolio balance summary */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Portfolio Changes</h3>
                <div className="p-4 rounded-md bg-cosmic-800">
                  <div className="grid grid-cols-2 gap-2">
                    {localAllocations.map((item) => {
                      const originalAllocation = allocations.find(a => a.id === item.id);
                      const hasChanged = originalAllocation && originalAllocation.allocation !== item.allocation;
                      const changeDirection = hasChanged 
                        ? (item.allocation > originalAllocation!.allocation ? 'increase' : 'decrease') 
                        : null;
                      return (
                        <div key={`balance-${item.id}`} className="flex items-center justify-between">
                          <span className="text-sm">{item.name}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-roboto-mono">{item.allocation}%</span>
                            {hasChanged && (
                              <span 
                                className={`ml-2 text-xs ${changeDirection === 'increase' ? 'text-green-500' : 'text-red-500'}`}
                              >
                                {changeDirection === 'increase' ? '+' : ''}
                                {item.allocation - originalAllocation!.allocation}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* AI recommendation */}
              {action?.changes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Recommendation</h3>
                  <div className="p-4 rounded-md bg-nebula-500/10 border border-nebula-500/20">
                    <h4 className="font-medium text-nebula-400 mb-2">Market Analysis</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This rebalancing is based on current market trends and AI analysis:
                    </p>
                    <ul className="space-y-1 text-sm">
                      {action.changes.map((change: any) => {
                        const direction = change.from < change.to ? 'Increase' : 'Decrease';
                        const diff = Math.abs(change.to - change.from);
                        return (
                          <li key={change.category} className="flex items-center">
                            <span className={`h-2 w-2 rounded-full mr-2 ${change.from < change.to ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>
                              {direction} <strong>{change.name}</strong> by {diff}% 
                              ({change.from}% → {change.to}%)
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || isApplying}>
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-button hover:opacity-90" 
              onClick={handleApply} 
              disabled={total !== 100 || isApplying || isUpdatingAllocations}
            >
              {isApplying || isUpdatingAllocations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Changes'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustmentModal;