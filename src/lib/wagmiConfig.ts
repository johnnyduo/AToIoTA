// src/lib/wagmiConfig.ts
import { createConfig, http, webSocket } from 'wagmi';
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
      projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '3a2e2d5e88adc8d9faad6fc06e36e1a9', // Replace with your project ID
    }),
  ],
});