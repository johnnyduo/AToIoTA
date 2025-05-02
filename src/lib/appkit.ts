// src/lib/appkit.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

// Add debug logging to track initialization
console.log('Initializing appkit.ts');

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

// Enhanced environment variable access with better logging
const getProjectId = () => {
  // Log environment information for debugging
  const envInfo = {
    hasWindow: typeof window !== 'undefined',
    hasImportMeta: typeof import.meta !== 'undefined',
    hasEnv: typeof import.meta !== 'undefined' && !!import.meta.env,
  };
  
  console.log('Environment check:', envInfo);
  
  // Hardcoded fallback project ID (replace with your actual project ID)
  const fallbackId = '09fc7dba755d62670df0095c041ed441';
  
  // Try to get from environment variables
  let projectId;
  
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WALLET_CONNECT_PROJECT_ID) {
      projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
      console.log('Using project ID from environment variable');
    } else if (typeof window !== 'undefined' && (window as any).ENV?.WALLET_CONNECT_PROJECT_ID) {
      projectId = (window as any).ENV.WALLET_CONNECT_PROJECT_ID;
      console.log('Using project ID from window.ENV');
    } else {
      projectId = fallbackId;
      console.log('Using fallback project ID');
    }
  } catch (error) {
    console.error('Error accessing environment variables:', error);
    projectId = fallbackId;
    console.log('Using fallback project ID after error');
  }
  
  console.log('Project ID (masked):', projectId ? `${projectId.substring(0, 4)}...${projectId.substring(projectId.length - 4)}` : 'undefined');
  
  return projectId;
};

// Get the project ID
export const projectId = getProjectId();

// Define networks
const networks = [iotaTestnet];

// Create wagmi config - but only if we're in a browser environment
export const wagmiConfig = (() => {
  if (typeof window === 'undefined') {
    console.log('Not creating wagmiConfig - not in browser environment');
    return null;
  }
  
  try {
    console.log('Creating wagmi config');
    return createConfig({
      chains: networks,
      transports: {
        [iotaTestnet.id]: http('https://json-rpc.evm.testnet.iotaledger.net'),
      },
      connectors: [
        injected({
          shimDisconnect: true,
        }),
        walletConnect({
          projectId,
        }),
      ],
      autoConnect: true
    });
  } catch (error) {
    console.error('Error creating wagmi config:', error);
    return null;
  }
})();

// Setup wagmi adapter - but only if we're in a browser environment
export const wagmiAdapter = (() => {
  if (typeof window === 'undefined' || !wagmiConfig) {
    console.log('Not creating wagmiAdapter - not in browser or no wagmiConfig');
    return null;
  }
  
  try {
    console.log('Creating WagmiAdapter');
    return new WagmiAdapter({
      networks,
      projectId,
      wagmiConfig,
      autoConnect: true
    });
  } catch (error) {
    console.error('Error creating WagmiAdapter:', error);
    return null;
  }
})();

// Get the current origin safely
const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://atoiota.xyz';
};

// Create the AppKit instance immediately if we're in a browser environment
export const modal = (() => {
  if (typeof window === 'undefined' || !wagmiAdapter) {
    console.log('Not creating modal - not in browser or no wagmiAdapter');
    return null;
  }
  
  try {
    const currentOrigin = getCurrentOrigin();
    console.log('Creating AppKit modal for origin:', currentOrigin);
    
    return createAppKit({
      adapters: [wagmiAdapter],
      networks,
      metadata: {
        name: 'AToIoTA',
        description: 'AI-Powered Portfolio Allocation',
        url: currentOrigin,
      },
      projectId,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#8B5CF6',
      }
    });
  } catch (error) {
    console.error('Error creating AppKit modal:', error);
    return null;
  }
})();

// Add a utility function to check if wallet connection is available
export const isWalletConnectionAvailable = () => {
  return !!modal;
};

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
} from '@reown/appkit/react'

// Log when the module has finished initializing
console.log('appkit.ts initialized, modal available:', !!modal);