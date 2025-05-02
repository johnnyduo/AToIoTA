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

// IMPORTANT: Replace this with your actual WalletConnect project ID
// Hardcoding for now to eliminate environment variable issues
export const projectId = '09fc7dba755d62670df0095c041ed441';

// Define networks
const networks = [iotaTestnet];

// Create wagmi config
export const wagmiConfig = typeof window !== 'undefined' 
  ? createConfig({
      chains: networks,
      transports: {
        [iotaTestnet.id]: http('https://json-rpc.evm.testnet.iotaledger.net'),
      },
      connectors: [
        // Only include essential connectors to avoid errors
        injected({
          shimDisconnect: true,
        }),
        walletConnect({
          projectId,
          // Explicitly disable certain wallets that might cause issues
          showQrModal: true,
          // Exclude problematic wallets
          excludeWalletIds: [
            'coinbaseWallet', // Exclude Coinbase Wallet
            'ledger', // Exclude Ledger if causing issues
          ]
        }),
      ],
      autoConnect: true
    })
  : null;

// Setup wagmi adapter
export const wagmiAdapter = typeof window !== 'undefined' && wagmiConfig
  ? new WagmiAdapter({
      networks,
      projectId,
      wagmiConfig,
      autoConnect: true
    })
  : null;

// Create the AppKit instance
export const modal = typeof window !== 'undefined' && wagmiAdapter
  ? (() => {
      try {
        console.log('Creating AppKit modal');
        
        return createAppKit({
          adapters: [wagmiAdapter],
          networks,
          metadata: {
            name: 'AToIoTA',
            description: 'AI-Powered Portfolio Allocation',
            url: 'https://atoiota.xyz',
          },
          projectId,
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': '#8B5CF6',
          },
          // Explicitly configure wallet options
          walletConnectOptions: {
            projectId,
            showQrModal: true,
            // Exclude problematic wallets
            excludeWalletIds: [
              'coinbaseWallet', // Exclude Coinbase Wallet
              'ledger', // Exclude Ledger if causing issues
            ]
          }
        });
      } catch (error) {
        console.error('Error creating AppKit modal:', error);
        return null;
      }
    })()
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