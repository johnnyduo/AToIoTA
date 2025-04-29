// src/lib/appkitConfig.ts
import { createConfig, http, webSocket } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { AppKitWagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Define IOTA EVM Testnet with the correct details
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
      webSocket: ['wss://ws.json-rpc.evm.testnet.iotaledger.net'],
    },
    public: {
      http: ['https://json-rpc.evm.testnet.iotaledger.net'],
      webSocket: ['wss://ws.json-rpc.evm.testnet.iotaledger.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.evm.testnet.iotaledger.net',
    },
  },
};

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [iotaTestnet],
  transports: {
    [iotaTestnet.id]: {
      http: http('https://json-rpc.evm.testnet.iotaledger.net'),
      webSocket: webSocket('wss://ws.json-rpc.evm.testnet.iotaledger.net'),
    },
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '',
    }),
  ],
});

// Create AppKit adapter
export const appKitAdapter = new AppKitWagmiAdapter({ wagmiConfig });