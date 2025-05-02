// src/components/WalletConnect.tsx
import { useAccount, useChainId, useConnect } from 'wagmi'
import { iotaTestnet, modal, useDisconnect, isWalletConnectionAvailable } from '@/lib/appkit'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Loader2, Wallet, ChevronDown, AlertTriangle } from 'lucide-react'
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
  const { connectAsync } = useConnect()

  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Check if wallet connection is available
  const walletConnectionAvailable = isWalletConnectionAvailable();

  // Switch to IOTA testnet if connected to wrong network
  useEffect(() => {
    if (isConnected && chainId !== iotaTestnet.id) {
      connectAsync({ chainId: iotaTestnet.id }).catch(console.error)
    }
  }, [chainId, isConnected, connectAsync])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      setConnectionError(error.message || 'Failed to connect wallet');
      toast.error('Connection Error', error.message || 'Failed to connect wallet');
    } else {
      setConnectionError(null);
    }
  }, [error]);

  // Handle chain mismatch
  useEffect(() => {
    if (isConnected && chainId !== undefined && chainId !== iotaTestnet.id) {
      toast('Wrong Network', 'Switching to IOTA Testnet...');
    }
  }, [chainId, isConnected])

  // Log wallet connection status on mount
  useEffect(() => {
    console.log('WalletConnect component mounted', {
      isConnected,
      address,
      chainId,
      walletConnectionAvailable,
      modalAvailable: !!modal
    });
  }, [isConnected, address, chainId, walletConnectionAvailable]);

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    
    setIsDisconnecting(true);
    setIsDropdownOpen(false);
    
    try {
      console.log("Disconnecting wallet...");
      
      // Call the disconnect function
      await disconnect();
      
      // Clear specific localStorage items
      if (typeof window !== 'undefined') {
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
    setConnectionError(null);
    
    try {
      console.log('Attempting to connect wallet');
      console.log('Modal available:', !!modal);
      
      if (modal) {
        await modal.open();
        console.log('Modal opened successfully');
      } else {
        console.error('Wallet modal is not available');
        
        // Try direct connection as fallback
        console.log('Attempting direct connection as fallback');
        await connectAsync();
        
        toast.success('Connected', 'Your wallet has been connected successfully.');
      }
    } catch (error: any) {
      console.error('Failed to open wallet modal:', error);
      setConnectionError(error.message || 'Failed to open wallet connection modal.');
      toast.error('Connection Error', error.message || 'Failed to open wallet connection modal.');
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
  
  // Show error state if wallet connection is not available
  if (!walletConnectionAvailable && !connectionError) {
    return (
      <Button 
        className="bg-amber-600 hover:bg-amber-700 font-medium"
        onClick={() => window.location.reload()}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Wallet Unavailable - Reload
      </Button>
    );
  }
  
  // Show error state if there was a connection error
  if (connectionError) {
    return (
      <Button 
        className="bg-red-600 hover:bg-red-700 font-medium"
        onClick={() => {
          setConnectionError(null);
          window.location.reload();
        }}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Connection Error - Reload
      </Button>
    );
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