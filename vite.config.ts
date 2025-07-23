import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jira': {
        target: 'https://your-company.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const jiraDomain = req.headers['x-jira-domain'];
            if (jiraDomain) {
              const target = jiraDomain.startsWith('http') ? jiraDomain : `https://${jiraDomain}`;
              proxy.changeOrigin = true;
              proxy.target = target;
            }
          });
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
