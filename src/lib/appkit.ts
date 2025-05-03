// src/lib/appkit.ts (or config.ts)
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

// Project ID for WalletConnect
export const projectId = '09fc7dba755d62670df0095c041ed441'

// Define networks
const networks = [iotaTestnet]

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

// Create modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AToIoTA',
    description: 'AI-Powered Portfolio Allocation',
    url: 'https://atoiota.xyz',
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
})

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