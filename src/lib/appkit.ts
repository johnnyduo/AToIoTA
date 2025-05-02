// src/lib/appkit.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit, useDisconnect } from '@reown/appkit/react'
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
export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '09fc7dba755d62670df0095c041ed441';

// Define networks
const networks = [iotaTestnet];

// Check if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Create wagmi config with autoConnect disabled in development
export const wagmiConfig = createConfig({
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
  // Disable auto-connect in development, but allow it in production
  autoConnect: !isDevelopment
})

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  wagmiConfig,
  // Disable auto-connect in development
  autoConnect: !isDevelopment
})

// Update the metadata.url to dynamically match the actual page URL
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AToIoTA',
    description: 'AI-Powered Portfolio Allocation',
    url: window.location.origin, // Dynamically use the current page URL
    icons: [import.meta.env.PROD ? 'https://img.icons8.com/3d-fluency/94/globe-africa.png' : 'https://img.icons8.com/3d-fluency/94/globe-africa.png']
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

// Export modal instance and all necessary hooks
export {
  modal,
}

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