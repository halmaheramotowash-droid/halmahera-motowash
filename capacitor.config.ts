import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.halmahera.motowash',
  appName: 'wash app',
  webDir: 'public',
  server: {
    url: 'https://halmaheramotowash.vercel.app'
  }
};

export default config;