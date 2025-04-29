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
export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '3a2e2d5e88adc8d9faad6fc06e36e1a9';

// Define networks
const networks = [iotaTestnet]

// Create wagmi config with autoConnect EXPLICITLY set to false
export const wagmiConfig = createConfig({
  chains: networks,
  transports: {
    [iotaTestnet.id]: http('https://json-rpc.evm.testnet.iotaledger.net'),
  },
  connectors: [
    // For injected connector (MetaMask), explicitly disable shimDisconnect
    injected({
      shimDisconnect: true, // This forces the connector to forget the connection
    }),
    walletConnect({
      projectId,
    }),
  ],
  autoConnect: false // Explicitly disable auto-connect
})

// Setup wagmi adapter with autoConnect explicitly disabled
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  wagmiConfig,
  autoConnect: false // Explicitly disable auto-connect in the adapter too
})

// Create AppKit modal instance with autoConnect disabled
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AToIoTA',
    description: 'AI-Powered Portfolio Allocation',
    url: import.meta.env.PROD ? 'https://atoiota.vercel.app' : window.location.origin,
    icons: [import.meta.env.PROD ? 'https://atoiota.vercel.app/logo.png' : `${window.location.origin}/logo.png`]
  },
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#8B5CF6',
  },
  features: {
    analytics: true
  },
  // If the AppKit supports this option:
  autoConnect: false
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