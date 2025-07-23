import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jira': {
        target: (req) => {
          const jiraDomain = req.headers['x-jira-domain'];
          if (jiraDomain) {
            return jiraDomain.startsWith('http') ? jiraDomain : `https://${jiraDomain}`;
          }
          return 'https://placeholder.atlassian.net';
        },
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
