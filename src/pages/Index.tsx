
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import PortfolioOverview from '@/components/PortfolioOverview';
import CategorySelector from '@/components/CategorySelector';
import TokenTable from '@/components/TokenTable';
import PerformanceChart from '@/components/PerformanceChart';
import AIChat from '@/components/AIChat';
import AllocationAdjuster from '@/components/AllocationAdjuster';

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>DeFAI Navigator | IOTA EVM Investment Portfolio</title>
        <meta 
          name="description" 
          content="AI-powered DeFi investment portfolio navigator for the IOTA EVM network" 
        />
      </Helmet>
      <Layout>
        <div className="space-y-6">
          <PortfolioOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart />
            <CategorySelector />
          </div>
          
          <TokenTable category="ai" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIChat />
            <AllocationAdjuster />
          </div>
        </div>
      </Layout>
    </>
  );
};

const Index = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
};

export default Index;
