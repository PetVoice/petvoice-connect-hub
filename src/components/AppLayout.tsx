import React from 'react';
import { PetProvider } from '@/contexts/PetContext';
import { AdaptiveIntelligenceProvider } from '@/contexts/AdaptiveIntelligenceContext';
import Layout from '@/components/Layout';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <PetProvider>
      <AdaptiveIntelligenceProvider>
        <Layout>
          {children}
        </Layout>
      </AdaptiveIntelligenceProvider>
    </PetProvider>
  );
};

export default AppLayout;