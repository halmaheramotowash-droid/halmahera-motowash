import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.halmahera.motowash',
  appName: 'wash app',
  webDir: 'public',
  server: {
    url: 'http://172.20.10.9:3000',
    cleartext: true
  }
};

export default config;