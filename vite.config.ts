import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jira': {
        target: 'https://govindarajmalaiarasu.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
        secure: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
