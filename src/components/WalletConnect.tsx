
// Since WalletConnect.tsx is a read-only file, we won't be able to modify it directly.
// Let's create our own custom WalletConnectWrapper that extends the functionality

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

// This component will override the success toast when disconnecting wallet
// It will be imported in place of the original WalletConnect component
const WalletConnectWrapper = () => {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const isMobile = useIsMobile();

  const handleDisconnect = async () => {
    try {
      await disconnectAsync();
      // No success toast on disconnect
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet.');
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        description: 'Your wallet address has been copied to clipboard.',
      });
    }
  };

  // Format address for display
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isConnected) {
    // We'll use the original WalletConnect component for this case
    // Import the original component directly
    const OriginalWalletConnect = require('./WalletConnect').default;
    return <OriginalWalletConnect />;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none hover:opacity-90"
      onClick={handleDisconnect}
      title={address}
    >
      <span className="font-mono">{formatAddress(address)}</span>
    </Button>
  );
};

export default WalletConnectWrapper;
