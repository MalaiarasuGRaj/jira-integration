import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/jira': {
        target: 'https://govindarajmalaiarasu.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
        secure: true,
      },
    },
  },
});
