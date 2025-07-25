import React from 'react';
import { PetProvider } from '@/contexts/PetContext';
import Layout from '@/components/Layout';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    // <PetProvider>
      <Layout>
        {children}
      </Layout>
    // </PetProvider>
  );
};

export default AppLayout;