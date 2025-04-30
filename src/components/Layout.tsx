// src/components/Layout.tsx
import { ReactNode, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Settings, BarChart2 } from 'lucide-react';
import AIChat from './AIChat';
import AllocationAdjuster from './AllocationAdjuster';
import WhaleTracker from './WhaleTracker';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto py-6 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-cosmic-800/50 p-1 rounded-xl shadow-lg border border-cosmic-700">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-nebula-600 data-[state=active]:to-nebula-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="whales" 
                className="flex items-center px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-nebula-600 data-[state=active]:to-nebula-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Whale Tracker</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="chat" 
                className="flex items-center px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-nebula-600 data-[state=active]:to-nebula-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>AI Chat</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className="flex items-center px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-nebula-600 data-[state=active]:to-nebula-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="mt-0 outline-none">
            {children}
          </TabsContent>
          
          <TabsContent value="whales" className="mt-0 outline-none">
            <WhaleTracker />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0 outline-none">
            <div className="max-w-4xl mx-auto">
              <AIChat />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0 outline-none">
            <div className="max-w-4xl mx-auto">
              <AllocationAdjuster />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;