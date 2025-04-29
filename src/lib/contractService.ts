// src/lib/contractService.ts
import { parseAbi } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from '@reown/appkit';

// Contract address from environment variable (fallback to a placeholder if not set)
export const PORTFOLIO_CONTRACT_ADDRESS = (import.meta.env.VITE_PORTFOLIO_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Contract ABI
export const PORTFOLIO_ABI = parseAbi([
  "constructor()",
  "event AllocationUpdated(string category, uint256 oldPercentage, uint256 newPercentage)",
  "function allocations(uint256) view returns (string category, uint256 percentage)",
  "function getAllocations() view returns (string[] memory, uint256[] memory)",
  "function owner() view returns (address)",
  "function updateAllocations(string[] memory categories, uint256[] memory percentages)"
]);

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

// Hook to read allocations from the contract
export function usePortfolioAllocations() {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: PORTFOLIO_CONTRACT_ADDRESS,
    abi: PORTFOLIO_ABI,
    functionName: 'getAllocations',
    // Only attempt to read if we have a valid contract address
    query: {
      enabled: PORTFOLIO_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    }
  });
  
  // Map contract data to our application format
  const processData = () => {
    if (!data) return [];
    
    const [categories, percentages] = data as [string[], bigint[]];
    
    return categories.map((category, index) => ({
      id: category,
      name: categoryNames[category] || category,
      color: categoryColors[category] || '#6B7280',
      allocation: Number(percentages[index])
    }));
  };
  
  return {
    allocations: processData(),
    isLoading,
    isError,
    refetch
  };
}

// Hook to update allocations on the contract
export function useUpdateAllocations() {
  const { writeContract, isPending, error } = useWriteContract();
  
  const updateAllocations = async (allocations: Allocation[]) => {
    const categories = allocations.map(a => a.id);
    const percentages = allocations.map(a => BigInt(a.allocation));
    
    return writeContract({
      address: PORTFOLIO_CONTRACT_ADDRESS,
      abi: PORTFOLIO_ABI,
      functionName: 'updateAllocations',
      args: [categories, percentages],
    });
  };
  
  return {
    updateAllocations,
    isPending,
    error
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