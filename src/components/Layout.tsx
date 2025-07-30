import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { AILiveChatButton } from './AILiveChat';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className={`flex-1 bg-background overflow-auto ${
            isMobile ? 'p-4' : 'p-6'
          }`}>
            {children}
          </div>
        </main>
        
        {/* AI Live Chat - responsive positioning */}
        <div className={`fixed z-50 ${
          isMobile 
            ? 'bottom-4 right-4' 
            : 'bottom-6 right-6'
        }`}>
          <AILiveChatButton />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;