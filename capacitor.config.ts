
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3c346588518c400c98761e08c8d86734',
  appName: 'prismsearch',
  webDir: 'dist',
  server: {
    url: 'https://3c346588-518c-400c-9876-1e08c8d86734.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    }
  }
};

export default config;
