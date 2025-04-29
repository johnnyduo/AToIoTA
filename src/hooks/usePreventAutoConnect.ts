// src/hooks/usePreventAutoConnect.ts
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDisconnect } from '@/lib/appkit';

export function usePreventAutoConnect() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Check for auto-connect on mount and disconnect if needed
  useEffect(() => {
    const preventAutoConnect = localStorage.getItem('PREVENT_AUTO_CONNECT');
    
    if (preventAutoConnect === 'true' && isConnected) {
      console.log('Detected auto-reconnect, disconnecting...');
      
      // Call disconnect
      disconnect();
      
      // Clear the flag
      localStorage.removeItem('PREVENT_AUTO_CONNECT');
      
      // Clear all wallet-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('wallet') || key.includes('wagmi') || key.includes('connect') || key.includes('reown')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [isConnected, disconnect]);
}