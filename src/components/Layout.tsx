import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { AILiveChatButton } from './AILiveChat';
import InteractiveGuide from '@/components/guide/InteractiveGuide';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { useSearchParams } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isFirstTime, loading, markGuideAsSeen } = useFirstTimeUser();
  const [searchParams] = useSearchParams();
  
  // Allow manual activation via URL parameter for testing
  const forceGuide = searchParams.get('guide') === 'true';
  const shouldShowGuide = !loading && (isFirstTime || forceGuide);
  
  console.log('🎯 Layout: Guide status -', {
    loading, 
    isFirstTime, 
    forceGuide, 
    shouldShowGuide,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  console.log('🎯 Layout: About to render InteractiveGuide with isOpen:', shouldShowGuide);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-6 bg-gradient-subtle overflow-auto">
            {children}
          </div>
        </main>
        
        {/* AI Live Chat available on all pages */}
        <AILiveChatButton />
      </div>

      {/* Interactive Guide for first time users */}
      <InteractiveGuide 
        isOpen={shouldShowGuide} 
        onClose={markGuideAsSeen}
        onComplete={markGuideAsSeen}
      />
    </SidebarProvider>
  );
};

export default Layout;