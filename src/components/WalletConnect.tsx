// src/components/WalletConnect.tsx
import { useAccount, useChainId, useConnect } from 'wagmi'
import { iotaTestnet, modal, useDisconnect } from '@/lib/appkit'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { Loader2, Wallet, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { error } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { connectAsync, connectors } = useConnect()

  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Use a ref to track if we've attempted a direct connection
  const directConnectAttempted = useRef(false);

  // Log connection status for debugging
  useEffect(() => {
    console.log('Wallet connection status:', {
      isConnected,
      address: address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : null,
      chainId,
      modalAvailable: !!modal,
      availableConnectors: connectors.map(c => c.name)
    });
  }, [isConnected, address, chainId, connectors]);

  // Switch to IOTA testnet if connected to wrong network
  useEffect(() => {
    if (isConnected && chainId !== iotaTestnet.id) {
      connectAsync({ chainId: iotaTestnet.id }).catch(console.error)
    }
  }, [chainId, isConnected, connectAsync])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      console.error('Connection error:', error);
      toast.error('Connection Error', error.message || 'Failed to connect wallet');
    }
  }, [error]);

  // Direct connect using available connectors
  const handleDirectConnect = async () => {
    try {
      console.log('Attempting direct connection');
      directConnectAttempted.current = true;
      
      if (connectors.length > 0) {
        // Try to find injected connector (MetaMask) first as it's most common
        const injectedConnector = connectors.find(c => 
          c.name === 'Injected' || c.id === 'injected' || c.name.includes('MetaMask')
        );
        
        if (injectedConnector) {
          console.log('Using injected connector:', injectedConnector.name);
          await connectAsync({ connector: injectedConnector });
        } else {
          // Fallback to first available connector
          console.log('Using first available connector:', connectors[0].name);
          await connectAsync({ connector: connectors[0] });
        }
        
        console.log('Direct connection successful');
        return true;
      } else {
        console.error('No connectors available');
        return false;
      }
    } catch (error) {
      console.error('Direct connection error:', error);
      return false;
    }
  };

  // Safe disconnect that handles cleanup properly
  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    
    setIsDisconnecting(true);
    setIsDropdownOpen(false);
    
    try {
      console.log("Disconnecting wallet...");
      
      // Call the disconnect function
      await disconnect();
      
      // Reset our direct connect attempt tracker
      directConnectAttempted.current = false;
      
      // Clear specific localStorage items
      if (typeof window !== 'undefined') {
        // Clear only specific items to avoid breaking other functionality
        localStorage.removeItem('wagmi.connected');
        localStorage.removeItem('wagmi.wallet');
        localStorage.removeItem('wagmi.store');
      }
      
      toast.success("Disconnected", "Your wallet has been disconnected successfully.");
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Disconnect Error', 'Failed to disconnect wallet.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address Copied", "Your wallet address has been copied to clipboard.");
      setIsDropdownOpen(false);
    }
  };
  
  const getExplorerUrl = (address: string) => {
    return `https://explorer.evm.testnet.iotaledger.net/address/${address}`;
  };

  // Function to handle wallet connection
  const handleConnect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      console.log('Attempting to connect wallet');
      
      // If we've already tried direct connect, or if modal isn't available, use direct connect
      if (directConnectAttempted.current || !modal) {
        console.log('Using direct connection approach');
        const directSuccess = await handleDirectConnect();
        
        if (!directSuccess) {
          throw new Error('Direct connection failed');
        }
      } else {
        // Try modal approach first if available
        try {
          console.log('Modal available:', !!modal);
          console.log('Trying modal approach');
          
          await modal.open();
          console.log('Modal opened successfully');
        } catch (modalError) {
          console.error('Modal approach failed:', modalError);
          
          // Fall back to direct connection
          console.log('Falling back to direct connection');
          const directSuccess = await handleDirectConnect();
          
          if (!directSuccess) {
            throw new Error('Both connection methods failed');
          }
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Connection Error', 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="glow-border">
            <span className="px-2 py-0.5 rounded-lg bg-nebula-800 text-white mr-2">IOTA</span>
            <span className="font-roboto-mono">{formatAddress(address || '')}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            <span className="mr-2">📋</span>
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <a 
              href={getExplorerUrl(address || '')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center w-full"
            >
              <span className="mr-2">🔍</span>
              View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDisconnect} 
            className="cursor-pointer text-destructive"
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <span className="mr-2">🔌</span>
                Disconnect
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <Button 
      className="bg-gradient-button hover:opacity-90 font-medium"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}

export default WalletConnect;