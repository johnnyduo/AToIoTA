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

// Project ID for WalletConnect (get one from https://cloud.walletconnect.com)
export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '3a2e2d5e88adc8d9faad6fc06e36e1a9';

// Define networks
const networks = [iotaTestnet]

// Create wagmi config
const wagmiConfig = createConfig({
  chains: networks,
  transports: {
    [iotaTestnet.id]: http('https://json-rpc.evm.testnet.iotaledger.net'),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId,
    }),
  ],
})

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  wagmiConfig
})

// Create AppKit modal instance
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AToIoTA',
    description: 'AI-Powered Portfolio Allocation',
    url: import.meta.env.PROD ? 'https://atoiota.com' : window.location.origin,
    icons: [import.meta.env.PROD ? 'https://atoiota.com/logo.png' : `${window.location.origin}/logo.png`]
  },
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#8B5CF6', // Purple accent to match your theme
  },
  features: {
    analytics: true
  }
})

// Export modal instance and all necessary hooks
export {
  modal,
  wagmiConfig
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