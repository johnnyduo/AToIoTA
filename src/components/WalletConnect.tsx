// src/components/ConnectWallet.tsx
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, ExternalLink, Copy, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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
  
  const handleConnect = (connector: any) => {
    connect({ connector });
    setIsDropdownOpen(false);
  };
  
  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };
  
  const getExplorerUrl = (address: string) => {
    return `https://explorer.evm.testnet.iotaledger.net/address/${address}`;
  };
  
  return (
    <>
      {!isConnected ? (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gradient-button hover:opacity-90 font-medium">
              {isPending ? (
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
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {connectors.map((connector) => (
              <DropdownMenuItem
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={!connector.ready}
                className="cursor-pointer"
              >
                {connector.name}
                {isPending && pendingConnector?.id === connector.id && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
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
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <a 
                href={getExplorerUrl(address || '')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default ConnectWallet;