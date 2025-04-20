
import { useState } from 'react';
import { Bell, Wallet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const DashboardHeader = () => {
  const [connected, setConnected] = useState(false);
  
  return (
    <div className="flex items-center justify-between py-6 px-8">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse-glow">
          <span className="font-space text-white text-2xl font-bold">A</span>
        </div>
        <h1 className="text-3xl font-bold font-space cosmic-text">AToIoTA</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full"></span>
        </Button>
        
        {!connected ? (
          <Button className="bg-gradient-button hover:opacity-90 font-medium" onClick={() => setConnected(true)}>
            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="glow-border">
                <span className="px-2 py-0.5 rounded-lg bg-nebula-800 text-white mr-2">IOTA</span>
                <span className="font-roboto-mono">0x7A...F3E2</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Wallet</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => console.log('Copy Address')}>Copy Address</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('View on Explorer')}>View on Explorer</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConnected(false)}>Disconnect</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
