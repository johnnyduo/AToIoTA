
import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import WalletConnect from './WalletConnect';

// This component wraps the original WalletConnect component
// to modify its behavior when disconnecting
const WalletConnectWrapper = () => {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();

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
      toast.success('Address Copied', {
        description: 'Your wallet address has been copied to clipboard.'
      });
    }
  };

  // Format address for display
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isConnected) {
    return <WalletConnect />;
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
