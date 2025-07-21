# Vite Development Server Troubleshooting Guide

This document provides solutions for common issues with the Vite development server, particularly exit code 137 and port conflicts.

## Recent Fixes Applied

### 1. Memory Management (Exit Code 137 Fix)
- **Issue**: Vite process killed with exit code 137 (Out of Memory)
- **Solution**: Added Node.js memory limit configuration
  ```bash
  NODE_OPTIONS='--max-old-space-size=4096'
  ```
- **Implementation**: Updated `package.json` scripts with memory limits

### 2. Port Conflict Management
- **Issue**: Repeated port conflicts when starting Vite
- **Solution**: Enhanced Vite configuration with flexible port handling
  ```typescript
  server: {
    port: 3000,
    strictPort: false, // Allow fallback to different ports
    // ... other config
  }
  ```

### 3. Build Optimization
- **Issue**: Large bundle sizes causing memory pressure
- **Solution**: Added chunk splitting and build optimizations
  ```typescript
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  }
  ```

### 4. Proxy Configuration Improvements
- **Issue**: Proxy timeouts and connection issues
- **Solution**: Enhanced proxy configuration with logging and error handling
  ```typescript
  proxy: {
    '/api/jira': {
      target: 'https://govindarajmalaiarasu.atlassian.net',
      timeout: 30000,
      configure: (proxy) => {
        // Added error handling and logging
      },
    },
  }
  ```

## Available Scripts

### Standard Scripts
- `npm run dev` - Start development server with memory optimization
- `npm run build` - Build for production with memory optimization
- `npm run preview` - Preview production build

### Monitoring Scripts
- `./health-check.sh` - Check Vite process health and system resources
- `./start-dev.sh` - Enhanced startup script with auto-restart and port management
- `./dev-monitor.sh` - Development monitoring with automatic restart

## Troubleshooting Steps

### If Vite Won't Start
1. **Check for existing processes**:
   ```bash
   ps aux | grep -E "(vite|npm)" | grep -v grep
   ```

2. **Kill existing processes**:
   ```bash
   pkill -f "vite"
   pkill -f "npm run dev"
   ```

3. **Check port availability**:
   ```bash
   netstat -tlnp | grep :3000
   ```

4. **Use the enhanced startup script**:
   ```bash
   ./start-dev.sh
   ```

### If Vite Crashes with Exit Code 137
1. **Check system memory**:
   ```bash
   free -h
   ```

2. **Check process memory usage**:
   ```bash
   ./health-check.sh
   ```

3. **Restart with monitoring**:
   ```bash
   ./dev-monitor.sh
   ```

### If Port 3000 is Occupied
1. **The enhanced configuration will automatically find an available port**
2. **Or manually specify a port**:
   ```bash
   npx vite --port 3001 --host 0.0.0.0
   ```

## System Requirements
- **Minimum RAM**: 2GB available
- **Recommended RAM**: 4GB available
- **Node.js**: v18.20.8 or higher
- **npm**: 10.8.2 or higher

## Monitoring Commands

### Check Health
```bash
./health-check.sh
```

### Monitor Memory Usage
```bash
watch -n 5 './health-check.sh'
```

### View Process Details
```bash
ps aux | grep vite
cat /proc/$(pgrep -f "node.*vite")/status | grep -E "VmPeak|VmSize|VmRSS"
```

## Configuration Files Modified
- `vite.config.ts` - Enhanced with memory management and proxy improvements
- `package.json` - Added Node.js memory limits to scripts
- `health-check.sh` - Process monitoring script
- `start-dev.sh` - Enhanced startup script
- `dev-monitor.sh` - Development monitoring script

## Emergency Recovery
If all else fails:
1. Restart the container/system
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Use the enhanced startup script: `./start-dev.sh`
