// src/lib/config.ts
import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

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

// Metadata for your dApp
export const metadata = {
  name: 'AToIoTA',
  description: 'AI-Powered Portfolio Allocation',
  url: 'https://atoiota.com',
  icons: ['https://atoiota.com/logo.png']
};

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [iotaTestnet],
  transports: {
    [iotaTestnet.id]: http('https://json-rpc.evm.testnet.iotaledger.net'),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata,
    }),
  ],
});