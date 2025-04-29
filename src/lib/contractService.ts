// src/lib/contractService.ts
import { useContractRead, useContractWrite, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ethers } from 'ethers';
import AutomatedPortfolioABI from '../abi/AutomatedPortfolio.json';

// Contract address from environment variable
export const PORTFOLIO_CONTRACT_ADDRESS = (import.meta.env.VITE_PORTFOLIO_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Interface for portfolio allocation
export interface Allocation {
  id: string;
  name: string;
  color: string;
  allocation: number;
}

// Default category colors and names for UI display
export const categoryColors: Record<string, string> = {
  'ai': '#8B5CF6',
  'meme': '#EC4899',
  'rwa': '#0EA5E9',
  'bigcap': '#10B981',
  'defi': '#F59E0B',
  'l1': '#EF4444',
  'stablecoin': '#14B8A6',
};

export const categoryNames: Record<string, string> = {
  'ai': 'AI & DeFi',
  'meme': 'Meme & NFT',
  'rwa': 'RWA',
  'bigcap': 'Big Cap',
  'defi': 'DeFi',
  'l1': 'Layer 1',
  'stablecoin': 'Stablecoins',
};

// Direct contract interaction function using ethers.js
export async function updateAllocationsDirectly(allocations: Allocation[]): Promise<{ hash: `0x${string}` }> {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Using direct ethers.js contract interaction:', {
      userAddress,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS
    });
    
    // Create contract instance
    const contract = new ethers.Contract(
      PORTFOLIO_CONTRACT_ADDRESS,
      AutomatedPortfolioABI,
      signer
    );
    
    // Check if user is owner
    const owner = await contract.owner();
    console.log('Contract owner check:', {
      owner,
      userAddress,
      isOwner: owner.toLowerCase() === userAddress.toLowerCase()
    });
    
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error('You are not the owner of this contract. Only the owner can update allocations.');
    }
    
    // Prepare transaction data
    const categories = allocations.map(a => a.id);
    const percentages = allocations.map(a => a.allocation);
    
    console.log('Calling updateAllocations with:', {
      categories,
      percentages
    });
    
    // Send transaction
    const tx = await contract.updateAllocations(categories, percentages);
    console.log('Transaction sent:', tx);
    
    return {
      hash: tx.hash as `0x${string}`
    };
  } catch (error) {
    console.error('Error in direct contract interaction:', error);
    throw error;
  }
}

// Hook to read allocations from the contract
export function usePortfolioAllocations() {
  const { data, isLoading, isError, refetch } = useContractRead({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'getAllocations',
    query: {
      enabled: PORTFOLIO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Map contract data to our application format
  const processData = () => {
    if (!data) return [];
    
    try {
      const [categories, percentages] = data as [string[], bigint[]];
      
      return categories.map((category, index) => ({
        id: category,
        name: categoryNames[category] || category,
        color: categoryColors[category] || '#6B7280',
        allocation: Number(percentages[index])
      }));
    } catch (error) {
      console.error('Error processing allocation data:', error);
      return [];
    }
  };
  
  return {
    allocations: processData(),
    isLoading,
    isError,
    refetch
  };
}

// Function to check if an address is the contract owner
export function useIsContractOwner() {
  const { address } = useAccount();
  
  const { data, isLoading, isError } = useContractRead({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'owner',
    query: {
      enabled: !!address && PORTFOLIO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Check if the connected address is the owner
  const isOwner = address && data ? address.toLowerCase() === (data as string).toLowerCase() : false;
  
  return {
    isOwner,
    isLoading,
    isError,
    ownerAddress: data as string
  };
}

// Hook to update allocations on the contract (using wagmi)
export function useUpdateAllocations() {
  const { address, isConnected } = useAccount();
  const { isOwner } = useIsContractOwner();
  
  console.log('useUpdateAllocations init:', {
    address,
    isConnected,
    isOwner,
    contractAddress: PORTFOLIO_CONTRACT_ADDRESS
  });
  
  const { 
    writeAsync, 
    isPending, 
    error,
    isSuccess,
    data,
    status
  } = useContractWrite({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: AutomatedPortfolioABI,
    functionName: 'updateAllocations',
  });
  
  console.log('useContractWrite status:', {
    isPending,
    error,
    isSuccess,
    status,
    writeAsyncExists: !!writeAsync
  });

  const updateAllocations = async (allocations: Allocation[]) => {
    console.log('updateAllocations called with:', {
      allocations,
      isConnected,
      address,
      isOwner,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS,
      writeAsyncExists: !!writeAsync
    });
    
    // Check if wallet is connected
    if (!isConnected || !address) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    
    // Check if contract address is valid
    if (!PORTFOLIO_CONTRACT_ADDRESS || PORTFOLIO_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invalid contract address. Please check your environment variables.');
    }
    
    // Check if user is the owner
    if (!isOwner) {
      console.warn('User is not the contract owner:', {
        userAddress: address,
        contractAddress: PORTFOLIO_CONTRACT_ADDRESS
      });
      throw new Error('You are not the owner of this contract. Only the owner can update allocations.');
    }
    
    // Try direct ethers.js approach if wagmi's writeAsync is not available
    if (!writeAsync) {
      console.log('writeAsync not available, using direct ethers.js approach');
      return updateAllocationsDirectly(allocations);
    }
    
    try {
      // Map allocations to the format expected by the contract
      const categories = allocations.map(a => a.id);
      const percentages = allocations.map(a => BigInt(a.allocation));
      
      console.log('Calling contract with args:', { categories, percentages });
      
      // Call the contract using wagmi
      const tx = await writeAsync({ 
        args: [categories, percentages],
      });
      
      console.log('Transaction submitted:', tx);
      return tx;
    } catch (error) {
      console.error('Error updating allocations with wagmi:', error);
      
      // Fall back to direct ethers.js approach if wagmi fails
      console.log('Falling back to direct ethers.js approach');
      return updateAllocationsDirectly(allocations);
    }
  };

  return {
    updateAllocations,
    isPending,
    error,
    isSuccess,
    transaction: data,
    isOwner
  };
}

// Hook to wait for transaction receipt
export function useTransactionReceipt(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
  });
}

// Function to get explorer URL for a transaction
export function getExplorerUrl(hash: string) {
  const explorerUrl = import.meta.env.VITE_IOTA_EXPLORER_URL || 'https://explorer.evm.testnet.iotaledger.net';
  return `${explorerUrl}/tx/${hash}`;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(address: string) {
  const explorerUrl = import.meta.env.VITE_IOTA_EXPLORER_URL || 'https://explorer.evm.testnet.iotaledger.net';
  return `${explorerUrl}/address/${address}`;
}