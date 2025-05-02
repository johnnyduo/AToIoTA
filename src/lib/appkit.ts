// src/lib/appkit.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

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

// Project ID for WalletConnect
export const projectId = 
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_WALLET_CONNECT_PROJECT_ID 
    ? import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID 
    : '09fc7dba755d62670df0095c041ed441';

// Define networks
const networks = [iotaTestnet];

// Create wagmi config - but only if we're in a browser environment
export const wagmiConfig = typeof window !== 'undefined' 
  ? createConfig({
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
    })
  : null;

// Setup wagmi adapter - but only if we're in a browser environment
export const wagmiAdapter = typeof window !== 'undefined' && wagmiConfig
  ? new WagmiAdapter({
      networks,
      projectId,
      wagmiConfig,
      autoConnect: true
    })
  : null;

// Create the AppKit instance immediately if we're in a browser environment
export const modal = typeof window !== 'undefined' && wagmiAdapter
  ? createAppKit({
      adapters: [wagmiAdapter],
      networks,
      metadata: {
        name: 'AToIoTA',
        description: 'AI-Powered Portfolio Allocation',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://atoiota.xyz',
        // Remove the custom icon - this will use the default icon
        icons: []
      },
      projectId,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#8B5CF6',
      },
      features: {
        analytics: true
      }
    })
  : null;

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