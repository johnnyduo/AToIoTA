
import { ReactNode } from 'react';
import DashboardHeader from './DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, MessageCircle, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto py-6 pb-16">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-3 w-80">
              <TabsTrigger value="dashboard" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard">
            {children}
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="max-w-4xl mx-auto">
              <AIChat />
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
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
