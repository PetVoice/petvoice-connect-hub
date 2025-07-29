import React, { Suspense, lazy } from 'react';
import { PageSkeleton, DashboardSkeleton, ListSkeleton } from './page-skeleton';

interface LazyComponentProps {
  children: React.ComponentType<any>;
  fallback?: React.ComponentType;
  props?: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children: Component,
  fallback: Fallback = PageSkeleton,
  props = {},
}) => {
  return (
    <Suspense fallback={<Fallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Lazy-loaded page components
export const LazyDashboardPage = lazy(() => import('@/pages/DashboardPage'));
export const LazyAnalysisPage = lazy(() => import('@/pages/AnalysisPage'));
export const LazyCalendarPage = lazy(() => import('@/pages/CalendarPage'));
export const LazyCommunityPage = lazy(() => import('@/pages/CommunityPage'));
export const LazyDiaryPage = lazy(() => import('@/pages/DiaryPage'));
export const LazyPetsPage = lazy(() => import('@/pages/PetsPage'));
export const LazySettingsPage = lazy(() => import('@/pages/SettingsPage'));
export const LazyTrainingDashboard = lazy(() => import('@/pages/TrainingDashboard'));
export const LazyTutorialPage = lazy(() => import('@/pages/TutorialPage'));
export const LazySubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'));
export const LazySupportPage = lazy(() => import('@/pages/SupportPage'));
export const LazyPetMatchingPage = lazy(() => import('@/pages/PetMatchingPage'));
export const LazyAIMusicTherapyPage = lazy(() => import('@/pages/AIMusicTherapyPage'));
export const LazyTrainingPage = lazy(() => import('@/pages/TrainingPage'));

// Lazy-loaded admin components
export const LazyAdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
export const LazyAdminTickets = lazy(() => import('@/pages/admin/AdminTickets').then(module => ({ default: module.AdminTickets })));

// HOC for creating lazy components with custom fallbacks
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) {
  return React.forwardRef<any, P>((props, ref) => (
    <LazyComponent
      children={Component}
      fallback={fallback}
      props={{ ...props, ref }}
    />
  ));
}

// Preload utility for critical routes
export const preloadComponent = (componentImporter: () => Promise<any>) => {
  componentImporter();
};

// Preload critical components on app initialization
export const preloadCriticalComponents = () => {
  // Preload dashboard and analysis as they're most commonly used
  preloadComponent(() => import('@/pages/DashboardPage'));
  preloadComponent(() => import('@/pages/AnalysisPage'));
};