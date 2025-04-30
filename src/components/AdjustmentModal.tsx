import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, TrendingUp, AlertTriangle, Check } from 'lucide-react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { toast } from 'sonner';

interface AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: any;
}

const AdjustmentModal = ({ open, onOpenChange, action }: AdjustmentModalProps) => {
  const { 
    allocations, 
    pendingAllocations, 
    setPendingAllocations, 
    applyAllocations, 
    isUpdatingAllocations 
  } = useBlockchain();
  
  const [isApplying, setIsApplying] = useState(false);
  const [localAllocations, setLocalAllocations] = useState<any[]>([]);
  const [total, setTotal] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);
  const [isBalancing, setIsBalancing] = useState(false);
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);

  // Initialize with current allocations when modal opens
  useEffect(() => {
    if (open && action) {
      // Reset transaction state when modal opens
      setTransactionSubmitted(false);
      
      // Start with current allocations from blockchain context
      const currentAllocations = pendingAllocations || allocations;
      
      // Create a deep copy to avoid reference issues
      const initialAllocations = JSON.parse(JSON.stringify(currentAllocations));
      
      // If AI action includes changes, apply them to our local state
      if (action.changes && Array.isArray(action.changes)) {
        // First, ensure all 'from' values match current allocations
        action.changes.forEach((change: any) => {
          const allocationToUpdate = initialAllocations.find((a: any) => a.id === change.category);
          if (allocationToUpdate) {
            // Update the 'from' value in the action to match current allocation
            change.from = allocationToUpdate.allocation;
            
            // Apply the change to our local allocations
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
      
      // Auto-balance if total is not 100%
      if (newTotal !== 100) {
        autoBalanceAllocations(initialAllocations);
      }
    }
  }, [open, action, allocations, pendingAllocations]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsApplying(false);
      setHasChanges(false);
      setTransactionSubmitted(false);
    }
  }, [open]);

  // Auto-balance allocations to ensure total is 100%
  const autoBalanceAllocations = useCallback((allocationsToBalance: any[]) => {
    setIsBalancing(true);
    
    // Calculate current total
    const currentTotal = allocationsToBalance.reduce((sum, item) => sum + item.allocation, 0);
    
    if (currentTotal === 100) {
      setIsBalancing(false);
      return allocationsToBalance; // No balancing needed
    }
    
    // Find allocations that can be adjusted (not part of the AI recommendation)
    const aiChangedCategories = action?.changes?.map((change: any) => change.category) || [];
    const adjustableAllocations = allocationsToBalance.filter(item => 
      !aiChangedCategories.includes(item.id) && item.allocation > 0
    );
    
    if (adjustableAllocations.length === 0) {
      // If no adjustable allocations, adjust the largest allocation
      const sortedAllocations = [...allocationsToBalance].sort((a, b) => b.allocation - a.allocation);
      const largestAllocation = sortedAllocations[0];
      
      // Adjust the largest allocation to make total 100%
      const difference = 100 - currentTotal;
      const balanced = allocationsToBalance.map(item => 
        item.id === largestAllocation.id 
          ? { ...item, allocation: Math.max(0, item.allocation + difference) }
          : item
      );
      
      setLocalAllocations(balanced);
      setTotal(100);
      setIsBalancing(false);
      return balanced;
    }
    
    // Calculate how much to adjust each adjustable allocation
    const difference = 100 - currentTotal;
    const adjustmentPerAllocation = difference / adjustableAllocations.length;
    
    // Apply adjustments proportionally
    const balanced = allocationsToBalance.map(item => {
      if (adjustableAllocations.some(a => a.id === item.id)) {
        return {
          ...item,
          allocation: Math.max(0, Math.min(100, Math.round(item.allocation + adjustmentPerAllocation)))
        };
      }
      return item;
    });
    
    // Check if we're still not at 100% due to rounding
    const newTotal = balanced.reduce((sum, item) => sum + item.allocation, 0);
    
    if (newTotal !== 100) {
      // Find the largest adjustable allocation to make final adjustment
      const sortedAdjustable = adjustableAllocations.sort((a, b) => b.allocation - a.allocation);
      const largestAdjustable = sortedAdjustable[0];
      
      // Make final adjustment to reach exactly 100%
      const finalBalanced = balanced.map(item => 
        item.id === largestAdjustable.id 
          ? { ...item, allocation: item.allocation + (100 - newTotal) }
          : item
      );
      
      setLocalAllocations(finalBalanced);
      setTotal(100);
      setIsBalancing(false);
      return finalBalanced;
    }
    
    setLocalAllocations(balanced);
    setTotal(100);
    setIsBalancing(false);
    return balanced;
  }, [action]);

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
    // Prevent double-submission
    if (isApplying || transactionSubmitted) {
      return;
    }
    
    if (total !== 100) {
      toast.error("Invalid Allocation", "Total allocation must equal 100%");
      return;
    }
    
    setIsApplying(true);
    
    try {
      // Create a deep copy of localAllocations
      const allocationsToApply = JSON.parse(JSON.stringify(localAllocations));
      
      // Log current state for debugging
      console.log('Current state before applying:', {
        localAllocations: allocationsToApply,
        currentAllocations: allocations,
        pendingAllocations
      });
      
      // Check if there are actual changes compared to the current allocations
      let hasRealChanges = false;
      for (const newAlloc of allocationsToApply) {
        const currentAlloc = allocations.find(a => a.id === newAlloc.id);
        if (currentAlloc && currentAlloc.allocation !== newAlloc.allocation) {
          console.log(`Detected change for ${newAlloc.id}: ${currentAlloc.allocation} -> ${newAlloc.allocation}`);
          hasRealChanges = true;
          break;
        }
      }
      
      if (!hasRealChanges) {
        console.log('No real changes detected, showing toast and closing modal');
        toast.info("No Changes Detected", "Your allocations match the current portfolio. No update needed.");
        onOpenChange(false);
        setIsApplying(false);
        return;
      }
      
      console.log('Real changes detected, submitting to blockchain');
      
      // CRITICAL: Update pending allocations in the context BEFORE closing the modal
      setPendingAllocations(allocationsToApply);
      
      // Give a small delay to ensure state is updated before proceeding
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Close the modal immediately to improve UX
      onOpenChange(false);
      
      // Then initiate the blockchain transaction with a direct reference to the allocations
      // This avoids relying on the pendingAllocations state which might not be updated yet
      console.log('Calling applyAllocations with direct allocations reference');
      const success = await applyAllocations(true, allocationsToApply);
      
      if (!success) {
        console.log('Transaction failed, reopening modal');
        // If transaction failed, reopen the modal with the same state
        setTransactionSubmitted(false);
        onOpenChange(true);
      } else {
        console.log('Transaction submitted successfully');
      }
    } catch (error) {
      console.error('Error applying allocations:', error);
      toast.error(
        "Update Failed", 
        error instanceof Error ? error.message : "Failed to update allocations. Please try again."
      );
      
      // Reset transaction state so user can try again
      setTransactionSubmitted(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    // Reset to original allocations
    setLocalAllocations(allocations);
    setTotal(allocations.reduce((sum, item) => sum + item.allocation, 0));
    setHasChanges(false);
  };
  
  const handleAutoBalance = () => {
    autoBalanceAllocations(localAllocations);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing the modal during transaction submission
      if (isApplying) return;
      onOpenChange(newOpen);
    }}>
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Adjust Allocations</h3>
                {total !== 100 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={handleAutoBalance}
                    disabled={isBalancing}
                  >
                    {isBalancing ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Balancing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Auto-Balance
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {localAllocations.map((item) => {
                // Check if this allocation is part of the AI recommendation
                const isRecommended = action?.changes?.some((change: any) => change.category === item.id);
                // Get the original value if it's part of a recommendation
                const originalValue = isRecommended 
                  ? action.changes.find((change: any) => change.category === item.id).from
                  : item.allocation;
                
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="font-medium">{item.name}</span>
                        {isRecommended && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-nebula-500/20 text-nebula-400">
                            AI Suggested
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-roboto-mono">{item.allocation}%</span>
                        {isRecommended && originalValue !== item.allocation && (
                          <span 
                            className={`ml-2 text-xs ${originalValue < item.allocation ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {originalValue < item.allocation ? '+' : ''}
                            {item.allocation - originalValue}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Slider
                      value={[item.allocation]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleSliderChange(item.id, value[0])}
                      className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-nebula-600 [&>span:first-child]:to-nebula-400"
                      aria-label={`Adjust ${item.name} allocation`}
                    />
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4 border-t border-cosmic-700">
                <span className="font-medium">Total Allocation</span>
                <span className={`font-roboto-mono font-bold ${total !== 100 ? 'text-red-500' : 'text-green-500'}`}>{total}%</span>
              </div>
              {total !== 100 && (
                <div className="flex items-center p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Total allocation must equal 100%. Please adjust your allocations or use Auto-Balance.</p>
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
                          <div className="flex items-center">
                            <span 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="text-sm">{item.name}</span>
                          </div>
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
              
              {/* Risk assessment */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Risk Assessment</h3>
                <div className="p-4 rounded-md bg-cosmic-800">
                  {total !== 100 ? (
                    <div className="text-red-400 text-sm">
                      <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                      Invalid allocation total. Please ensure total equals 100%.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Volatility</span>
                        <span className="text-sm">
                        {localAllocations.some(a => a.id === 'meme' && a.allocation > 15) ? 'High' : 
                           localAllocations.some(a => a.id === 'meme' && a.allocation > 10) ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Growth Potential</span>
                        <span className="text-sm">
                          {localAllocations.some(a => (a.id === 'ai' || a.id === 'l1') && a.allocation > 20) ? 'High' : 
                           localAllocations.some(a => (a.id === 'ai' || a.id === 'l1') && a.allocation > 15) ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Stability</span>
                        <span className="text-sm">
                          {localAllocations.some(a => (a.id === 'stablecoin' || a.id === 'rwa') && a.allocation > 20) ? 'High' : 
                           localAllocations.some(a => (a.id === 'stablecoin' || a.id === 'rwa') && a.allocation > 10) ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || isApplying || isUpdatingAllocations}>
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
              disabled={total !== 100 || isApplying || isUpdatingAllocations || transactionSubmitted}
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