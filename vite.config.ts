import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Proxy and hardcoded Jira domain removed.
  // The app uses user-provided Jira domain input at runtime for all API calls.
});
