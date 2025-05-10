
// src/contexts/BlockchainContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { updateAllocations, getExplorerUrl } from '../lib/contractService';
import AutomatedPortfolioABI from '../abi/AutomatedPortfolio.json';
import { useContractRead, useWaitForTransactionReceipt } from 'wagmi';
import { PORTFOLIO_CONTRACT_ADDRESS } from '../lib/contractService';

// Define the default allocations
const defaultAllocations = [
  { id: 'ai', name: 'AI & DeFi', color: '#8B5CF6', allocation: 15 },
  { id: 'meme', name: 'Meme & NFT', color: '#EC4899', allocation: 10 },
  { id: 'rwa', name: 'RWA', color: '#0EA5E9', allocation: 15 },
  { id: 'bigcap', name: 'Big Cap', color: '#10B981', allocation: 25 },
  { id: 'defi', name: 'DeFi', color: '#F59E0B', allocation: 15 },
  { id: 'l1', name: 'Layer 1', color: '#EF4444', allocation: 15 },
  { id: 'stablecoin', name: 'Stablecoins', color: '#14B8A6', allocation: 5 },
];

export interface Allocation {
  id: string;
  name: string;
  color: string;
  allocation: number;
}

interface Transaction {
  id: string;
  hash?: `0x${string}`;
  timestamp: Date;
  type: 'allocation_change' | 'token_swap';
  status: 'pending' | 'confirmed' | 'failed';
  details: any;
}

interface BlockchainContextType {
  // Portfolio allocations
  allocations: Allocation[];
  pendingAllocations: Allocation[] | null;
  setPendingAllocations: (allocations: Allocation[] | null) => void;
  applyAllocations: (fromModal?: boolean, directAllocations?: Allocation[]) => Promise<boolean>;
  isLoadingAllocations: boolean;
  isUpdatingAllocations: boolean;
  isConfirmingTransaction: boolean;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  
  // Contract info
  contractAddress: string;
  isContractOwner: boolean;
  ownerAddress: string | null;
  
  // Refresh function
  refreshAllocations: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

// Storage key for allocations in localStorage
const ALLOCATIONS_STORAGE_KEY = 'atoiota_allocations';
const TRANSACTIONS_STORAGE_KEY = 'atoiota_transactions';

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  
  // Check if the connected wallet is the contract owner
  const { data: ownerAddress, isLoading: isOwnerLoading } = useContractRead({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'owner',
  });
  
  const isContractOwner = address && ownerAddress ? 
    address.toLowerCase() === (ownerAddress as string).toLowerCase() : false;
  
  // Use the portfolio allocations hook from contractService
  const { data: contractAllocations, isLoading: isAllocationsLoading, refetch } = useContractRead({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'getAllocations',
  });

  // State for allocations
  const [allocations, setAllocations] = useState<Allocation[]>(defaultAllocations);
  const [pendingAllocations, setPendingAllocations] = useState<Allocation[] | null>(null);
  const [isUpdatingAllocations, setIsUpdatingAllocations] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);
  
  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Wait for transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });
  
  // Load saved data on component mount
  useEffect(() => {
    // Load allocations from localStorage
    const savedAllocations = localStorage.getItem(ALLOCATIONS_STORAGE_KEY);
    if (savedAllocations) {
      try {
        const parsedAllocations = JSON.parse(savedAllocations);
        setAllocations(parsedAllocations);
      } catch (error) {
        console.error('Error loading allocations from localStorage:', error);
      }
    }
    
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error('Error loading transactions from localStorage:', error);
      }
    }
  }, []);
  
  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);
  
  // Process contract allocations data
  useEffect(() => {
    if (contractAllocations) {
      try {
        const [categories, percentages] = contractAllocations as [string[], bigint[]];
        
        if (Array.isArray(categories) && Array.isArray(percentages) && categories.length === percentages.length) {
          const newAllocations = categories.map((category, index) => {
            // Find matching default allocation for color and name
            const defaultAllocation = defaultAllocations.find(a => a.id === category);
            
            return {
              id: category,
              name: defaultAllocation?.name || category,
              color: defaultAllocation?.color || '#888888',
              allocation: Number(percentages[index])
            };
          });
          
          console.log('Received contract allocations:', newAllocations);
          
          // Update state and localStorage
          setAllocations(newAllocations);
          localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(newAllocations));
        }
      } catch (error) {
        console.error('Error processing contract allocations:', error);
      }
    }
  }, [contractAllocations]);
  
  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash && receipt) {
      console.log('Transaction confirmed:', receipt);
      
      // Transaction confirmed
      const status = receipt.status === 'success' ? 'confirmed' : 'failed';
      
      // Update transaction status
      updateTransaction(pendingTxHash, { status });
      
      // Clear the pending hash
      setPendingTxHash(undefined);
      
      // Refetch allocations from the contract
      refreshAllocations();
      
      // Show success message
      if (status === 'confirmed') {
        toast.success("Transaction Confirmed", {
          description: "Your allocation changes have been confirmed on the blockchain."
        });
      } else {
        toast.error("Transaction Failed", {
          description: "Your allocation changes failed to process on the blockchain."
        });
      }
    }
  }, [isConfirmed, pendingTxHash, receipt]);
  
  // Add a new transaction
  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };
  
  // Update an existing transaction
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  };
  
  // Function to refresh allocations from the contract
  const refreshAllocations = useCallback(async () => {
    try {
      console.log('Refreshing allocations from contract...');
      await refetch();
    } catch (error) {
      console.error('Error refreshing allocations:', error);
    }
  }, [refetch]);
  
  // Apply pending allocations to the blockchain
  const applyAllocations = async (fromModal: boolean = false, directAllocations?: Allocation[]): Promise<boolean> => {
    console.log('Starting applyAllocations with:', {
      isConnected,
      isContractOwner,
      hasPendingAllocations: !!pendingAllocations,
      hasDirectAllocations: !!directAllocations,
      pendingAllocations,
      directAllocations,
      currentAllocations: allocations,
      fromModal
    });
    
    if (!isConnected) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet to update portfolio allocations."
      });
      return false;
    }
    
    if (!isContractOwner) {
      toast.error(
        "Not Contract Owner", 
        { description: "Only the contract owner can update allocations." }
      );
      return false;
    }
    
    // Use direct allocations if provided, otherwise use pending allocations
    const allocationsToUse = directAllocations || pendingAllocations;
    
    if (!allocationsToUse) {
      // Only show this toast if not called from modal (to avoid duplicate messages)
      if (!fromModal) {
        toast.error("No Changes", {
          description: "There are no pending allocation changes to apply."
        });
      }
      return false;
    }
    
    // Make a deep copy to ensure we don't lose it during processing
    const allocationsToSubmit = JSON.parse(JSON.stringify(allocationsToUse));
    
    // Validate total allocation is 100%
    const total = allocationsToSubmit.reduce((sum, item) => sum + item.allocation, 0);
    if (total !== 100) {
      toast.error("Invalid Allocation", {
        description: `Total allocation must be 100%. Current total: ${total}%`
      });
      return false;
    }
    
    // Check if there are actual changes compared to current allocations
    let hasChanges = false;
    console.log('Checking for changes between:');
    console.log('Current:', allocations);
    console.log('To Submit:', allocationsToSubmit);
    
    for (const newAlloc of allocationsToSubmit) {
      const currentAlloc = allocations.find(a => a.id === newAlloc.id);
      if (!currentAlloc) {
        console.log(`New allocation found: ${newAlloc.id} with ${newAlloc.allocation}%`);
        hasChanges = true;
      } else if (currentAlloc.allocation !== newAlloc.allocation) {
        console.log(`Change detected for ${newAlloc.id}: ${currentAlloc.allocation}% -> ${newAlloc.allocation}%`);
        hasChanges = true;
      }
    }
    
    if (!hasChanges) {
      console.log('No changes detected between current and pending allocations');
      // Only show this toast if not called from modal (to avoid duplicate messages)
      if (!fromModal) {
        toast.info("No Changes Detected", {
          description: "Your allocations match the current portfolio. No update needed."
        });
      }
      // Clear pending allocations since they match current state
      setPendingAllocations(null);
      return false;
    }
    
    setIsUpdatingAllocations(true);
    
    try {
      // Create a pending transaction
      const txId = `pending_${Date.now().toString(16)}`;
      const pendingTx: Transaction = {
        id: txId,
        timestamp: new Date(),
        type: 'allocation_change',
        status: 'pending',
        details: {
          oldAllocations: allocations,
          newAllocations: allocationsToSubmit
        }
      };
      
      // Add the pending transaction
      addTransaction(pendingTx);
      
      console.log('About to call updateAllocations with:', {
        categories: allocationsToSubmit.map(a => a.id),
        percentages: allocationsToSubmit.map(a => a.allocation),
        total: allocationsToSubmit.reduce((sum, item) => sum + item.allocation, 0)
      });
      
      try {
        // Call the contract directly using ethers.js
        const tx = await updateAllocations(allocationsToSubmit);
        
        if (!tx?.hash) {
          throw new Error('No transaction hash returned');
        }
        
        console.log('Transaction submitted:', tx.hash);
        
        // Update transaction with hash
        updateTransaction(txId, { hash: tx.hash, id: tx.hash });
        
        // Set the pending hash for monitoring
        setPendingTxHash(tx.hash);
        
        // Update local state immediately for better UX
        setAllocations([...allocationsToSubmit]);
        
        // Store the updated allocations in localStorage for persistence
        localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(allocationsToSubmit));
        
        // Clear pending allocations AFTER we've used them
        setPendingAllocations(null);
        
        // Show toast with link to explorer
        toast.success(
          fromModal ? "Portfolio Rebalance Submitted" : "Transaction Submitted", 
          {
            description: (
              <div>
                {fromModal 
                  ? "Your allocation changes have been submitted to the blockchain." 
                  : "Transaction has been submitted to the blockchain."
                }{' '}
                <a 
                  href={getExplorerUrl(tx.hash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on Explorer
                </a>
              </div>
            )
          }
        );
        
        return true;
      } catch (error: any) {
        // Check if this is a user rejection/cancellation
        const isUserCancelled = 
          error.code === 4001 || // MetaMask user rejected
          error.message?.includes('User denied') || 
          error.message?.includes('user rejected') ||
          error.message?.includes('cancelled') ||
          error.message?.includes('canceled');
        
        if (isUserCancelled) {
          console.log('Transaction was cancelled by user');
          // Update transaction status to cancelled
          updateTransaction(txId, { status: 'failed', details: { ...pendingTx.details, error: 'Transaction cancelled by user' } });
          
          // Show a different toast for user cancellation
          toast.info(
            "Transaction Cancelled", 
            { description: "You cancelled the transaction. No changes were made to your portfolio." }
          );
        } else {
          // For other errors, show the error toast
          console.error('Error in contract interaction:', error);
          updateTransaction(txId, { status: 'failed', details: { ...pendingTx.details, error: error.message || 'Transaction failed' } });
          
          toast.error(
            "Transaction Failed", 
            { description: error.message || "Failed to update allocations. Please try again." }
          );
        }
        
        return false;
      }
    } catch (error: any) {
      console.error('Error in applyAllocations:', error);
      
      // Add a failed transaction
      const errorTxId = `failed_${Date.now().toString(16)}`;
      addTransaction({
        id: errorTxId,
        timestamp: new Date(),
        type: 'allocation_change',
        status: 'failed',
        details: {
          oldAllocations: allocations,
          newAllocations: allocationsToSubmit,
          error: error.message || 'Transaction failed'
        }
      });
      
      toast.error("Update Failed", { 
        description: error.message || "Failed to update allocations. Please try again."
      });
      
      return false;
    } finally {
      setIsUpdatingAllocations(false);
    }
  };
  
  return (
    <BlockchainContext.Provider value={{
      allocations,
      pendingAllocations,
      setPendingAllocations,
      applyAllocations,
      isLoadingAllocations: isAllocationsLoading,
      isUpdatingAllocations,
      isConfirmingTransaction: isConfirming,
      transactions,
      addTransaction,
      updateTransaction,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS,
      isContractOwner,
      ownerAddress: ownerAddress as string || null,
      refreshAllocations
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}
