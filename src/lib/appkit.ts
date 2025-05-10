// src/lib/appkit.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit, useAppKit, useAppKitAccount, useAppKitEvents, useAppKitNetwork, useAppKitState, useAppKitTheme, useDisconnect, useWalletInfo } from '@reown/appkit/react'

// Define IOTA EVM Testnet
export const iotaTestnet = {
  id: 1075,
  name: 'IOTA EVM Testnet',
  network: 'iota-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IOTA',
    symbol: 'MIOTA',
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.testnet.iotaledger.net'],
    },
    public: {
      http: ['https://json-rpc.evm.testnet.iotaledger.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.evm.testnet.iotaledger.net',
    },
  },
};

// Get Project ID from environment variables
// Use a function to safely access environment variables
const getProjectId = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Try to get from import.meta.env (Vite)
    if (import.meta.env && import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID) {
      return import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
    }
    
    // Check if it's available in window.ENV (if you set it that way)
    if ((window as any).ENV && (window as any).ENV.WALLET_CONNECT_PROJECT_ID) {
      return (window as any).ENV.WALLET_CONNECT_PROJECT_ID;
    }
  }
  
  // Fallback for development or if env var is missing
  return '09fc7dba755d62670df0095c041ed441';
};

// Get the project ID
export const projectId = getProjectId();

// Log the project ID (masked for security)
if (typeof window !== 'undefined') {
  const maskedId = projectId ? 
    `${projectId.substring(0, 4)}...${projectId.substring(projectId.length - 4)}` : 
    'undefined';
  console.log('Using WalletConnect Project ID:', maskedId);
}

// Define networks as a tuple with at least one element
const networks = [iotaTestnet] as const;

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

// Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AToIoTA',
    description: 'AI-Powered Portfolio Allocation',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://atoiota.xyz',
    icons: ['https://img.icons8.com/3d-fluency/94/globe-africa.png']
  },
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#8B5CF6',
  },
  features: {
    analytics: true
  }
});

// Re-export hooks from @reown/appkit/react
export {
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useAppKitNetwork,
  useWalletInfo,
  useDisconnect
}
