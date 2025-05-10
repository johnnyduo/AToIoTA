
import { Droplets, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/WalletConnect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { iotaTestnet } from '@/lib/chains';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AIDocumentation from '@/components/AIDocumentation';

const DashboardHeader = () => {
  const [showAIDocumentation, setShowAIDocumentation] = useState(false);

  const handleFaucetClick = () => {
    window.open('https://evm-toolkit.evm.testnet.iotaledger.net/', '_blank');
  };

  const handleAddNetwork = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask Not Found', {
        description: 'Please install MetaMask to add the IOTA EVM Testnet.'
      });
      return;
    }

    try {
      // Convert chainId to hex format (required by MetaMask)
      const chainIdHex = `0x${iotaTestnet.id.toString(16)}`;
      
      // First, try to switch to the network if it already exists
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        toast.success('Network Switched', {
          description: 'Successfully switched to IOTA EVM Testnet.'
        });
        return;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log('Network not found, attempting to add it...');
        } else {
          // For other errors, just try to add the network
          console.log('Error switching network:', switchError);
        }
      }
      
      // Prepare the network params with corrected symbol
      // Note: MetaMask expects "IOTA" not "MIOTA" for this testnet
      const networkParams = {
        chainId: chainIdHex,
        chainName: iotaTestnet.name,
        nativeCurrency: {
          ...iotaTestnet.nativeCurrency,
          symbol: 'IOTA', // Override the symbol to match what MetaMask expects
        },
        rpcUrls: [iotaTestnet.rpcUrls.default.http[0]],
        blockExplorerUrls: [iotaTestnet.blockExplorers.default.url],
      };
      
      console.log('Adding network with params:', networkParams);
      
      // Add the network to MetaMask
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      });
      
      toast.success('Network Added', {
        description: 'IOTA EVM Testnet has been added to your wallet.'
      });
    } catch (error: any) {
      console.error('Error adding network:', error);
      
      // Check for specific error about symbol mismatch
      if (error.message && error.message.includes('nativeCurrency.symbol does not match')) {
        toast.info(
          'Network Already Added', 
          { description: 'The IOTA EVM Testnet is already in your wallet. Please switch to it manually.' }
        );
      } else {
        toast.error(
          'Failed to Add Network', 
          { description: error.message || 'Please try adding the network manually.' }
        );
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-6 px-8">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse-glow">
            <span className="font-space text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-3xl font-bold font-space cosmic-text">AToIoTA</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* AI Documentation Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gradient-to-r from-nebula-600 to-nebula-400 text-white border-none hover:opacity-90"
                  onClick={() => setShowAIDocumentation(true)}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Docs
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Learn about our AI capabilities</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Add Network Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-none hover:opacity-90"
                  onClick={handleAddNetwork}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Network
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add IOTA EVM Testnet to MetaMask</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Faucet Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-none hover:opacity-90"
                  onClick={handleFaucetClick}
                >
                  <Droplets className="h-4 w-4 mr-2" />
                  Faucet
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get testnet tokens for development</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <WalletConnect />
        </div>
      </div>

      {/* AI Documentation Modal */}
      <Dialog open={showAIDocumentation} onOpenChange={setShowAIDocumentation}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <AIDocumentation />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardHeader;
