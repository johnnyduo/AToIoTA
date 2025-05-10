// src/components/PortfolioOverview.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { getAddressExplorerUrl } from '@/lib/contractService';
import { useAccount } from 'wagmi';

const PortfolioOverview = () => {
  const { contractAddress, isContractOwner, ownerAddress } = useBlockchain();
  const { address, isConnected } = useAccount();
  const [contractLink, setContractLink] = useState('');
  const [ownerLink, setOwnerLink] = useState('');

  useEffect(() => {
    if (contractAddress) {
      setContractLink(getAddressExplorerUrl(contractAddress));
    }
    if (ownerAddress) {
      setOwnerLink(getAddressExplorerUrl(ownerAddress));
    }
  }, [contractAddress, ownerAddress]);

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-2xl">Portfolio Overview</CardTitle>
        <CardDescription>
          Here's a quick look at your investment portfolio and contract details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Your Wallet</h3>
            <p>
              {isConnected ? (
                <>
                  Connected to: <span className="font-medium font-roboto-mono">{address?.substring(0, 6)}...{address?.substring(address?.length - 4)}</span>
                </>
              ) : (
                'Not connected. Connect your wallet to view portfolio details.'
              )}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Contract Address</h3>
              {contractAddress ? (
                <a href={contractLink} target="_blank" rel="noopener noreferrer" className="underline">
                  <span className="font-medium font-roboto-mono">{contractAddress?.substring(0, 6)}...{contractAddress?.substring(contractAddress?.length - 4)}</span>
                </a>
              ) : (
                'Contract address not available.'
              )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Contract Owner</h3>
            {ownerAddress ? (
              <>
                {isContractOwner ? (
                  <p>You are the owner of this contract.</p>
                ) : (
                  <a href={ownerLink} target="_blank" rel="noopener noreferrer" className="underline">
                    <span className="font-medium font-roboto-mono">{ownerAddress?.substring(0, 6)}...{ownerAddress?.substring(ownerAddress?.length - 4)}</span>
                  </a>
                )}
              </>
            ) : (
              'Owner address not available.'
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioOverview;
