import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5902ad2396c64f9995c48e601d99495a',
  appName: 'petvoice-connect-hub',
  webDir: 'dist',
  server: {
    url: 'https://5902ad23-96c6-4f99-95c4-8e601d99495a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
};

export default config;