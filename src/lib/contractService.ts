// src/lib/contractService.ts
import { useContractRead, useContractWrite, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ethers, BrowserProvider, Contract } from 'ethers'; // Import from ethers v6
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

// Direct contract interaction using ethers.js v6
export const updateAllocations = async (allocations: Allocation[]) => {
  if (!(window as any).ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  
  try {
    console.log('Starting direct contract interaction with allocations:', allocations);
    
    // Request account access explicitly
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get the provider and signer - ethers v6 syntax
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Connected with address:', userAddress);
    
    // Create contract instance - ethers v6 syntax
    const contract = new Contract(
      PORTFOLIO_CONTRACT_ADDRESS,
      AutomatedPortfolioABI,
      signer
    );
    
    // Prepare the data for the contract call
    const categories = allocations.map(a => a.id);
    const percentages = allocations.map(a => a.allocation);
    
    console.log('Calling contract with:', {
      userAddress,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS,
      categories,
      percentages
    });
    
    // Estimate gas first to check if the transaction will succeed
    try {
      const gasEstimate = await contract.updateAllocations.estimateGas(categories, percentages);
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
      throw new Error(`Transaction would fail: ${gasError instanceof Error ? gasError.message : 'Unknown error'}`);
    }
    
    // Call the contract function with explicit gas limit - ethers v6 syntax
    const tx = await contract.updateAllocations(categories, percentages, {
      gasLimit: 300000 // ethers v6 accepts number directly
    });
    
    console.log('Transaction sent:', tx);
    
    return {
      hash: tx.hash as `0x${string}`
    };
  } catch (error) {
    console.error('Error in updateAllocations:', error);
    throw error;
  }
};

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
  
  const contractWrite = useContractWrite({
    abi: AutomatedPortfolioABI,
    functionName: 'updateAllocations',
  });

  const { isPending, error, isSuccess, data, status } = contractWrite;

  const updateAllocationsFn = async (allocations: Allocation[]) => {
    console.log('updateAllocations called with:', {
      allocations,
      isConnected,
      address,
      isOwner,
      contractAddress: PORTFOLIO_CONTRACT_ADDRESS,
      writeAsyncExists: typeof contractWrite.writeAsync === 'function'
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
    if (typeof contractWrite.writeAsync !== 'function') {
      console.log('writeAsync not available, using direct ethers.js approach');
      return updateAllocations(allocations);
    }

    try {
      // Map allocations to the format expected by the contract
      const categories = allocations.map(a => a.id);
      const percentages = allocations.map(a => BigInt(a.allocation));

      console.log('Calling contract with args:', { categories, percentages });

      // Call the contract using wagmi
      const tx = await contractWrite.writeAsync({ 
        args: [categories, percentages],
      });

      console.log('Transaction submitted:', tx);
      return tx;
    } catch (error) {
      console.error('Error updating allocations with wagmi:', error);
      // Fall back to direct ethers.js approach if wagmi fails
      console.log('Falling back to direct ethers.js approach');
      return updateAllocations(allocations);
    }
  };

  return {
    updateAllocations: updateAllocationsFn,
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