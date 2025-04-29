// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/appkit';
import { BlockchainProvider } from '@/contexts/BlockchainContext';
import { usePreventAutoConnect } from '@/hooks/usePreventAutoConnect';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a query client
const queryClient = new QueryClient();

// Component to use the hook (since hooks can't be used at the top level)
function AppContent() {
  // Use the hook to prevent auto-connect
  usePreventAutoConnect();
  
  return (
    <BlockchainProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </BlockchainProvider>
  );
}

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;