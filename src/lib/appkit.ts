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
export const projectId = '09fc7dba755d62670df0095c041ed441';

// Define networks
const networks = [iotaTestnet];

// Create a singleton pattern for the config and adapter
let _wagmiConfig = null;
let _wagmiAdapter = null;
let _modal = null;

// Create wagmi config
export const wagmiConfig = typeof window !== 'undefined' 
  ? (() => {
      if (_wagmiConfig) {
        return _wagmiConfig;
      }
      
      try {
        console.log('Creating wagmi config');
        _wagmiConfig = createConfig({
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
              showQrModal: true,
              // Exclude problematic wallets
              excludeWalletIds: [
                'coinbaseWallet', // Exclude Coinbase Wallet if causing issues
              ]
            }),
          ],
          autoConnect: true
        });
        return _wagmiConfig;
      } catch (error) {
        console.error('Error creating wagmi config:', error);
        return null;
      }
    })()
  : null;

// Setup wagmi adapter
export const wagmiAdapter = typeof window !== 'undefined' && wagmiConfig
  ? (() => {
      if (_wagmiAdapter) {
        return _wagmiAdapter;
      }
      
      try {
        console.log('Creating wagmi adapter');
        _wagmiAdapter = new WagmiAdapter({
          networks,
          projectId,
          wagmiConfig,
          autoConnect: true
        });
        return _wagmiAdapter;
      } catch (error) {
        console.error('Error creating wagmi adapter:', error);
        return null;
      }
    })()
  : null;

// Create the AppKit instance
export const modal = typeof window !== 'undefined' && wagmiAdapter
  ? (() => {
      if (_modal) {
        return _modal;
      }
      
      try {
        console.log('Creating AppKit modal');
        
        _modal = createAppKit({
          adapters: [wagmiAdapter],
          networks,
          metadata: {
            name: 'AToIoTA',
            description: 'AI-Powered Portfolio Allocation',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://atoiota.xyz',
          },
          projectId,
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': '#8B5CF6',
          }
        });
        
        return _modal;
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