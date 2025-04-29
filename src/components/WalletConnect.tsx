// src/components/WalletConnect.tsx
import { useAccount, useChainId, useConnect } from 'wagmi'
import { iotaTestnet, useAppKit, useDisconnect } from '@/lib/appkit'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
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
  const { connectAsync } = useConnect()

  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Switch to IOTA testnet if connected to wrong network
  useEffect(() => {
    if (isConnected && chainId !== iotaTestnet.id) {
      connectAsync({ chainId: iotaTestnet.id })
    }
  }, [chainId, isConnected, connectAsync])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      toast.error('Connection Error', error.message || 'Failed to connect wallet');
    }
  }, [error]);

  // Handle chain mismatch
  useEffect(() => {
    if (isConnected && chainId !== undefined && chainId !== iotaTestnet.id) {
      toast('Wrong Network', 'Switching to IOTA Testnet...');
    }
  }, [chainId, isConnected])

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await disconnect()
      
      // Only remove wallet-specific items from localStorage
      window.localStorage.removeItem('wagmi.connected')
      window.localStorage.removeItem('wagmi.wallet')
      window.localStorage.removeItem('wagmi.store')
      
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('Disconnect Error', 'Failed to disconnect wallet. Please try again.');
    } finally {
      setIsDisconnecting(false)
    }
  }

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

  // Get the AppKit modal controller
  const appKit = useAppKit();
  
  return (
    <Button 
      className="bg-gradient-button hover:opacity-90 font-medium"
      onClick={() => appKit.open()}
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}

export default WalletConnect;