
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { BarChart2, Check, AlertTriangle } from 'lucide-react';

interface AdjustmentAction {
  type: string;
  description: string;
  changes?: {
    category: string;
    name: string;
    from: number;
    to: number;
  }[];
}

interface AdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: AdjustmentAction | null;
}

const AdjustmentModal = ({ open, onOpenChange, action }: AdjustmentModalProps) => {
  const [adjustments, setAdjustments] = useState<{[key: string]: number}>({});
  const [isBalanced, setIsBalanced] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (action?.changes) {
      const initialAdjustments: {[key: string]: number} = {};
      action.changes.forEach(change => {
        initialAdjustments[change.category] = change.to;
      });
      setAdjustments(initialAdjustments);
    }
  }, [action]);

  const handleSliderChange = (category: string, value: number[]) => {
    const newAdjustments = { ...adjustments, [category]: value[0] };
    setAdjustments(newAdjustments);
    
    // Check if total allocation is still 100%
    const total = Object.values(newAdjustments).reduce((sum, value) => sum + value, 0);
    setIsBalanced(total === 100);
  };

  const confirmChanges = () => {
    if (!isBalanced) {
      toast({
        title: "Error",
        description: "Total allocation must equal 100%. Please adjust your allocations.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Portfolio Updated",
      description: "The suggested allocation changes have been applied.",
      variant: "default",
    });
    
    onOpenChange(false);
  };

  if (!action) return null;

  const totalAllocation = action.changes ? 
    Object.values(adjustments).reduce((sum, value) => sum + value, 0) : 
    100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-neutral-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart2 className="h-5 w-5 text-nebula-400" />
            {action.type === 'rebalance' ? 'Portfolio Rebalance' : 'Allocation Adjustment'}
          </DialogTitle>
          <DialogDescription>
            {action.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {action.changes && action.changes.map(change => (
            <div key={change.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: 
                        change.category === 'ai' ? '#8B5CF6' : 
                        change.category === 'meme' ? '#EC4899' : 
                        change.category === 'rwa' ? '#0EA5E9' :
                        change.category === 'bigcap' ? '#10B981' :
                        change.category === 'defi' ? '#F59E0B' :
                        change.category === 'l1' ? '#EF4444' :
                        '#14B8A6'
                    }}
                  ></div>
                  <span className="font-medium">{change.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{change.from}%</span>
                  <span>→</span>
                  <span className="font-medium">{adjustments[change.category] || change.to}%</span>
                </div>
              </div>
              
              <Slider 
                defaultValue={[change.to]} 
                min={0}
                max={100}
                step={1}
                value={[adjustments[change.category] || change.to]}
                onValueChange={(value) => handleSliderChange(change.category, value)}
              />
            </div>
          ))}
          
          <div className={`rounded-lg p-4 ${totalAllocation === 100 ? 'bg-nebula-900/50' : 'bg-destructive/20'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Allocation:</span>
              <span 
                className={`font-bold ${
                  totalAllocation === 100 ? 'text-nebula-400' : 'text-destructive'
                }`}
              >
                {totalAllocation}%
              </span>
            </div>
            {totalAllocation !== 100 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-xs text-destructive">
                  Total allocation must equal 100%. Adjust your allocations.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-gradient-button hover:opacity-90" 
            onClick={confirmChanges}
            disabled={!isBalanced}
          >
            <Check className="h-4 w-4 mr-1" /> Confirm Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustmentModal;
