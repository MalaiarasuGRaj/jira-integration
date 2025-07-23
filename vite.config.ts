import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['vscode-internal-8221-qa.qa01.cloud.kavia.ai'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
