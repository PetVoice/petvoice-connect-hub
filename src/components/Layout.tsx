import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { AILiveChatButton } from './AILiveChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-6 bg-background overflow-auto">
            {/* DEBUG: Layout main content area */}
            <div className="mb-2 p-2 bg-blue-500 text-white text-sm rounded">
              🔵 Layout: Main content area caricata
            </div>
            {children}
          </div>
        </main>
        
        {/* AI Live Chat available on all pages */}
        <AILiveChatButton />
      </div>
    </SidebarProvider>
  );
};

export default Layout;