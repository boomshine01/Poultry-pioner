
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.895eb4b66544421aba4627cd81708fbf',
  appName: 'poultry-pioneer',
  webDir: 'dist',
  server: {
    url: 'https://895eb4b6-6544-421a-ba46-27cd81708fbf.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
