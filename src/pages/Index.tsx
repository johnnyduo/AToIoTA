
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import PortfolioOverview from '@/components/PortfolioOverview';
import TokenTable from '@/components/TokenTable';
import PerformanceChart from '@/components/PerformanceChart';
import AIChat from '@/components/AIChat';
import AllocationAdjuster from '@/components/AllocationAdjuster';
import YieldComparison from '@/components/YieldComparison';

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>AToIoTA | IOTA EVM Investment Portfolio</title>
        <meta 
          name="description" 
          content="AI-powered DeFi investment portfolio navigator for the IOTA EVM network - AToIoTA" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <Layout>
        <div className="space-y-4 md:space-y-6">
          <PortfolioOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <PerformanceChart />
            <YieldComparison />
          </div>
          
          <TokenTable category="all" />
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
