# CORS and Deployment Guide for Jira Integration

## Overview

This Jira Integration frontend now supports connecting to any Jira Cloud domain dynamically based on user input. However, making direct API calls to Jira from a browser application introduces Cross-Origin Resource Sharing (CORS) considerations that need to be addressed.

## CORS Challenges

### What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers that blocks requests from one domain to another unless the target domain explicitly allows it. Jira Cloud instances typically do not allow direct API access from browser applications running on different domains.

### Why This Matters

When users enter their Jira domain (e.g., `company.atlassian.net`), the browser will attempt to make direct API calls to that domain. If the Jira instance doesn't have appropriate CORS headers configured, these requests will be blocked by the browser.

## Development Solutions

### 1. Browser Extensions (Easiest for Development)
- **Chrome**: Install "CORS Unblock" or "Disable CORS" extension
- **Firefox**: Install "CORS Everywhere" extension
- **Edge**: Install "CORS Toggle" extension

### 2. Browser Flags (Command Line)
```bash
# Chrome
google-chrome --disable-web-security --user-data-dir=/tmp/chrome_dev_test

# Chrome on macOS
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir=/tmp/chrome_dev_test --disable-web-security

# Firefox
firefox -P development -pref security.tls.insecure_fallback_hosts=your-company.atlassian.net
```

### 3. Development Proxy (Recommended)
If you need to maintain CORS compliance during development, you can re-enable the Vite proxy by updating `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/jira': {
        target: 'https://your-company.atlassian.net', // Replace with your domain
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
        secure: true,
      },
    },
  },
});
```

Then update the `getApiBaseUrl` method in `src/services/jiraApi.ts` to return `/api/jira` instead of the direct domain.

## Production Solutions

### 1. Backend Proxy Server (Recommended)
Create a backend service that acts as a proxy between your frontend and Jira:

```javascript
// Example Express.js proxy
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/api/jira/:domain/*', (req, res, next) => {
  const domain = req.params.domain;
  const target = `https://${domain}.atlassian.net`;
  
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/jira/${domain}`]: '',
    },
  })(req, res, next);
});
```

### 2. Server-Side Configuration
If you control your deployment server, add CORS headers:

```nginx
# Nginx configuration
location /api/jira/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    proxy_pass https://your-jira-domain.atlassian.net/;
}
```

### 3. OAuth 2.0 Flow (Advanced)
Implement Jira's OAuth 2.0 flow instead of basic authentication:
- More secure than API tokens
- Supported by Atlassian's CORS policies
- Requires backend implementation for token exchange

### 4. CORS Proxy Services
Use public CORS proxy services (NOT recommended for production):
- `https://cors-anywhere.herokuapp.com/`
- `https://api.allorigins.win/`

**Warning**: Never use public proxies for production applications as they can log sensitive data.

## Implementation Notes

### Current Architecture
The application now:
- ✅ Accepts any Jira domain from users
- ✅ Makes direct API calls to user-specified domains
- ✅ Provides clear error messages for CORS issues
- ✅ Includes troubleshooting guidance in error messages

### Security Considerations
- API tokens are stored in browser session storage (not persistent)
- Basic authentication headers are created client-side
- No credentials are hardcoded in the application
- All API calls use HTTPS

### Error Handling
The application detects CORS errors and provides specific guidance:
- Development-focused solutions for local development
- Production-focused solutions for deployment
- Troubleshooting steps for debugging

## Testing Direct API Calls

### Using Browser Developer Tools
1. Open Developer Tools (F12)
2. Go to Network tab
3. Attempt to log in
4. Look for failed requests with CORS errors

### Using curl (Command Line)
```bash
# Test API access directly
curl -H "Authorization: Basic $(echo -n 'email:api_token' | base64)" \
     -H "Accept: application/json" \
     https://your-company.atlassian.net/rest/api/3/myself
```

### Using Postman
1. Create new request to `https://your-company.atlassian.net/rest/api/3/myself`
2. Set Authorization to Basic Auth
3. Enter email and API token
4. Send request to verify API access

## Deployment Checklist

### Before Deployment
- [ ] Decide on CORS solution (proxy server recommended)
- [ ] Test with actual Jira domains users will use
- [ ] Verify API token permissions and expiration
- [ ] Test error handling for various failure scenarios

### For Production
- [ ] Implement backend proxy if needed
- [ ] Configure proper HTTPS certificates
- [ ] Set up monitoring for API failures
- [ ] Document CORS setup for your team
- [ ] Consider implementing OAuth 2.0 flow

### User Communication
- [ ] Inform users about browser requirements
- [ ] Provide clear instructions for API token generation
- [ ] Document supported Jira Cloud versions
- [ ] Set expectations about CORS limitations

## Troubleshooting Common Issues

### "Failed to fetch" Errors
- Usually indicates CORS blocking
- Check browser console for specific CORS messages
- Verify Jira domain is correct and accessible

### Authentication Failures
- Verify API token is valid and not expired
- Check that user has necessary permissions
- Ensure email address matches Jira account

### Network Timeouts
- Check internet connectivity
- Verify Jira instance is accessible
- Consider implementing retry logic

## Future Improvements

1. **OAuth 2.0 Implementation**: More secure and CORS-friendly
2. **Backend Service**: Dedicated proxy server for production
3. **Caching**: Implement response caching for better performance
4. **Retry Logic**: Automatic retry for transient failures
5. **Monitoring**: Add error tracking and analytics

---

For additional support, refer to:
- [Atlassian REST API documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [CORS MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Jira API authentication guide](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/)
