// src/contexts/BlockchainContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import AutomatedPortfolioABI from '../abi/AutomatedPortfolio.json';
import { useContractWrite, useContractRead } from 'wagmi';

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
  applyAllocations: () => Promise<boolean>;
  isLoadingAllocations: boolean;
  isUpdatingAllocations: boolean;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const contractAddress = import.meta.env.VITE_PORTFOLIO_CONTRACT as `0x${string}`;

  // wagmi contract write hook
  const {
    write: updateAllocationsWrite,
    data: updateAllocationsData,
    isLoading: isContractWriteLoading,
    isSuccess: isContractWriteSuccess,
    error: contractWriteError
  } = useContractWrite({
    address: contractAddress,
    abi: AutomatedPortfolioABI,
    functionName: 'updateAllocations',
  });

  // Fetch allocations from contract
  const { data: contractAllocations, isLoading: isAllocationsLoading } = useContractRead({
    address: contractAddress,
    abi: AutomatedPortfolioABI,
    functionName: 'getAllocations',
    watch: true,
  });

  useEffect(() => {
    if (contractAllocations && Array.isArray(contractAllocations[0]) && Array.isArray(contractAllocations[1])) {
      const categories: string[] = contractAllocations[0];
      const percentages: number[] = contractAllocations[1];
      const newAllocations = categories.map((name, i) => {
        // Try to match color/id from defaultAllocations, fallback if not found
        const match = defaultAllocations.find(a => a.name === name);
        return {
          id: match?.id || name.toLowerCase().replace(/\s+/g, '-'),
          name,
          color: match?.color || '#888',
          allocation: Number(percentages[i])
        };
      });
      setAllocations(newAllocations);
    }
  }, [contractAllocations]);

  // For MVP, we'll use local state instead of actual contract calls
  const [allocations, setAllocations] = useState<Allocation[]>(defaultAllocations);
  const [pendingAllocations, setPendingAllocations] = useState<Allocation[] | null>(null);
  const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);
  const [isUpdatingAllocations, setIsUpdatingAllocations] = useState(false);
  
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
  
  // Apply pending allocations to the blockchain
  const applyAllocations = async (): Promise<boolean> => {
    if (!isConnected) {
      toast.error("Wallet Not Connected", "Please connect your wallet to update portfolio allocations.");
      return false;
    }
    
    if (!pendingAllocations) {
      toast.error("No Changes", "There are no pending allocation changes to apply.");
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
      
      // Prepare arguments for contract call
      const categories = pendingAllocations.map(a => a.name);
      const percentages = pendingAllocations.map(a => a.allocation);
      
      // Call the contract
      const tx = await updateAllocationsWrite({ args: [categories, percentages] });
      if (!tx?.hash) throw new Error('No transaction hash returned');
      
      // NOTE: To track transaction status, use the useWaitForTransaction hook at the component level, not inside this async function.
      // You can update the transaction status in a useEffect that watches for the transaction hash.
      updateTransaction(txId, { hash: tx.hash, id: tx.hash });
      setAllocations(pendingAllocations);
      setPendingAllocations(null);
      updateTransaction(tx.hash, { status: 'confirmed' });
      toast.success("Allocations Updated", "Your portfolio allocations have been successfully updated on the blockchain.");
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
      transactions,
      addTransaction,
      updateTransaction
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