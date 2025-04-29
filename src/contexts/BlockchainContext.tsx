// src/contexts/BlockchainContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { 
  useUpdateAllocations, 
  usePortfolioAllocations,
  useTransactionReceipt,
  useIsContractOwner,
  getExplorerUrl,
  PORTFOLIO_CONTRACT_ADDRESS,
  Allocation
} from '../lib/contractService';

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
  applyAllocations: () => Promise<boolean>;
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
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  
  // Check if the connected wallet is the contract owner
  const { isOwner, ownerAddress, isLoading: isOwnerLoading } = useIsContractOwner();
  
  // Use the portfolio allocations hook from contractService
  const { 
    allocations: contractAllocations, 
    isLoading: isAllocationsLoading,
    refetch: refetchAllocations
  } = usePortfolioAllocations();

  // State for allocations
  const [allocations, setAllocations] = useState<Allocation[]>(defaultAllocations);
  const [pendingAllocations, setPendingAllocations] = useState<Allocation[] | null>(null);
  const [isUpdatingAllocations, setIsUpdatingAllocations] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>(undefined);
  
  // Load allocations from localStorage on mount
  useEffect(() => {
    const savedAllocations = localStorage.getItem('atoiota_allocations');
    if (savedAllocations) {
      try {
        const parsedAllocations = JSON.parse(savedAllocations);
        setAllocations(parsedAllocations);
      } catch (error) {
        console.error('Error loading allocations from localStorage:', error);
      }
    }
  }, []);
  
  // Log wallet and contract information for debugging
  useEffect(() => {
    console.log('Wallet and contract status:', {
      isConnected,
      address,
      isContractOwner: isOwner,
      ownerAddress,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS,
      chainId: (window as any).ethereum?.chainId, // If using MetaMask
    });
  }, [isConnected, address, isOwner, ownerAddress]);
  
  // Use the hook to monitor transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt
  } = useTransactionReceipt({
    hash: pendingTxHash,
  });
  
  // Update allocations when contract data changes
  useEffect(() => {
    if (contractAllocations && contractAllocations.length > 0) {
      // Only update if the data is different to prevent infinite loops
      const currentIds = allocations.map(a => a.id).sort().join(',');
      const newIds = contractAllocations.map(a => a.id).sort().join(',');
      
      if (currentIds !== newIds || 
          JSON.stringify(allocations) !== JSON.stringify(contractAllocations)) {
        console.log('Updating allocations from contract:', contractAllocations);
        setAllocations(contractAllocations);
      }
    }
  }, [contractAllocations]); // Only depend on contractAllocations, not allocations
  
  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash && receipt) {
      console.log('Transaction confirmed:', receipt);
      
      // Transaction confirmed
      const status = receipt.status === 'success' ? 'confirmed' : 'failed';
      
      updateTransaction(pendingTxHash, { status });
      
      // Clear the pending hash
      setPendingTxHash(undefined);
      
      // Refetch allocations from the contract
      refetchAllocations();
      
      // Show success message
      if (status === 'confirmed') {
        toast.success(
          "Transaction Confirmed", 
          "Your allocation changes have been confirmed on the blockchain."
        );
      } else {
        toast.error(
          "Transaction Failed", 
          "Your allocation changes failed to process on the blockchain."
        );
      }
    }
  }, [isConfirmed, pendingTxHash, receipt, refetchAllocations]);
  
  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Load transactions from localStorage if available
    const saved = localStorage.getItem('atoiota_transactions');
    if (saved) {
      try {
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      } catch (error) {
        console.error('Error loading transactions from localStorage:', error);
        return [];
      }
    }
    return [];
  });
  
  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('atoiota_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
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
  
  // Use the allocations-aware hook
  const { 
    updateAllocations, 
    isPending: isContractWriteLoading,
    error: contractWriteError,
    isOwner: isUpdatePermitted
  } = useUpdateAllocations();

  // Apply pending allocations to the blockchain
  const applyAllocations = async (): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Wallet Not Connected", "Please connect your wallet to update portfolio allocations.");
      return false;
    }
    
    if (!isOwner) {
      toast.error(
        "Not Contract Owner", 
        `Only the contract owner can update allocations.`
      );
      return false;
    }
    
    if (!pendingAllocations) {
      toast.error("No Changes", "There are no pending allocation changes to apply.");
      return false;
    }
    
    // Validate total allocation is 100%
    const total = pendingAllocations.reduce((sum, item) => sum + item.allocation, 0);
    if (total !== 100) {
      toast.error("Invalid Allocation", `Total allocation must be 100%. Current total: ${total}%`);
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
          newAllocations: pendingAllocations
        }
      };
      
      // Add the pending transaction
      addTransaction(pendingTx);
      
      // Call the contract
      console.log('Submitting allocation update to contract:', pendingAllocations);
      
      // Call the updateAllocations function from contractService
      const tx = await updateAllocations(pendingAllocations);
      
      if (!tx?.hash) {
        throw new Error('No transaction hash returned');
      }
      
      console.log('Transaction submitted:', tx.hash);
      
      // Update transaction with hash
      updateTransaction(txId, { hash: tx.hash, id: tx.hash });
      
      // Set the pending hash for monitoring
      setPendingTxHash(tx.hash);
      
      // Update local state
      setAllocations([...pendingAllocations]);
      setPendingAllocations(null);
      
      // Store the updated allocations in localStorage for persistence
      localStorage.setItem('atoiota_allocations', JSON.stringify(pendingAllocations));
      
      // Show pending message with link to explorer
      toast.success(
        "Transaction Submitted", 
        <div>
          Transaction has been submitted to the blockchain.{' '}
          <a 
            href={getExplorerUrl(tx.hash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            View on Explorer
          </a>
        </div>
      );
      
      return true;
    } catch (error: any) {
      console.error('Error updating allocations:', error);
      // Update the pending transaction to failed
      const errorTxId = `pending_${Date.now().toString(16)}`;
      updateTransaction(errorTxId, { 
        status: 'failed',
        details: {
          ...pendingAllocations,
          error: error.message || 'Transaction failed'
        }
      });
      toast.error("Update Failed", error.message || "Failed to update allocations. Please try again.");
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
      isContractOwner: isOwner,
      ownerAddress: ownerAddress || null
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