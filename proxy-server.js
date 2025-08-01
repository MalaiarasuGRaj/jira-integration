const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Dynamic proxy middleware
app.use('/', (req, res, next) => {
  // Extract domain from request body or headers
  const domain = req.body?.domain || req.headers['x-jira-domain'];
  
  if (!domain) {
    return res.status(400).json({ error: 'Jira domain is required' });
  }

  // Ensure domain has https protocol
  const targetUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  
  // Create dynamic proxy
  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/rest/api/3/', // Rewrite path to Jira API
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward the original request body for POST requests
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error occurred' });
    }
  });

  proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});