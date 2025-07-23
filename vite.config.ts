import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['vscode-internal-8221-qa.qa01.cloud.kavia.ai'],
    proxy: {
      '/api/jira': {
        target: 'https://placeholder.atlassian.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Get the Jira domain from the request header
            const jiraDomain = req.headers['x-jira-domain'];
            if (jiraDomain) {
              // Dynamically change the target URL
              const targetUrl = jiraDomain.startsWith('http') ? jiraDomain : `https://${jiraDomain}`;
              const url = new URL(targetUrl);
              
              // Override the target for this specific request
              proxyReq.protocol = url.protocol;
              proxyReq.host = url.host;
              proxyReq.hostname = url.hostname;
              proxyReq.port = url.port || (url.protocol === 'https:' ? 443 : 80);
              
              // Set proper headers
              proxyReq.setHeader('Host', url.host);
              proxyReq.setHeader('Origin', targetUrl);
            }
            
            // Forward authorization header from the client request
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
            
            // Clean up headers that shouldn't be forwarded
            delete proxyReq.headers['x-jira-domain'];
            
            console.log(`Proxying request to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Add CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(JSON.stringify({
                error: 'Proxy error',
                message: err.message,
                details: 'Unable to connect to Jira API. Please check your domain and network connection.'
              }));
            }
          });
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
