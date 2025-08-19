// src/lib/chains.ts
export const iotaTestnet = {
  id: 1076,
  name: 'IOTA EVM Testnet',
  network: 'iota-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IOTA Token',
    symbol: 'MIOTA',
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.testnet.iota.cafe'],
    },
    public: {
      http: ['https://json-rpc.evm.testnet.iota.cafe'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.evm.testnet.iota.cafe',
    },
  },
};