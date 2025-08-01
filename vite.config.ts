import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://your-domain.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/rest/api/3'),
        configure: (proxy, options) => {
          // This will be overridden by the dynamic proxy setup
        }
      }
    }
  }
}))
    exclude: ['lucide-react'],
  },
});
