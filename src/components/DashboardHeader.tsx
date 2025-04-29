// src/components/DashboardHeader.tsx
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectWallet from '@/components/ConnectWallet'; // Use the correct import path

const DashboardHeader = () => {
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
        
        <ConnectWallet />
      </div>
    </div>
  );
};

export default DashboardHeader;