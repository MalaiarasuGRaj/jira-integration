#!/bin/bash

# Health check script for the Vite development server
# This script monitors the Vite process and provides diagnostic information

set -e

echo "=== Vite Development Server Health Check ==="
echo "Timestamp: $(date)"
echo

# Check if Vite process is running
check_vite_process() {
    local vite_pid=$(pgrep -f "node.*vite" | head -1)
    if [ -n "$vite_pid" ]; then
        echo "✅ Vite process is running (PID: $vite_pid)"
        
        # Check memory usage
        local memory_info=$(cat /proc/$vite_pid/status | grep -E "VmRSS|VmSize|VmPeak")
        echo "Memory usage:"
        echo "$memory_info"
        
        # Check if memory usage is concerning
        local rss_kb=$(echo "$memory_info" | grep VmRSS | awk '{print $2}')
        local rss_mb=$((rss_kb / 1024))
        
        if [ $rss_mb -gt 1000 ]; then
            echo "⚠️  WARNING: High memory usage detected ($rss_mb MB)"
        else
            echo "✅ Memory usage is normal ($rss_mb MB)"
        fi
        
        return 0
    else
        echo "❌ Vite process is not running"
        return 1
    fi
}

# Check port status
check_port_status() {
    if netstat -tlnp | grep -q ":3000.*LISTEN"; then
        echo "✅ Port 3000 is listening"
        local port_info=$(netstat -tlnp | grep ":3000.*LISTEN")
        echo "Port info: $port_info"
        return 0
    else
        echo "❌ Port 3000 is not listening"
        return 1
    fi
}

# Check system resources
check_system_resources() {
    echo "System Memory:"
    free -h
    echo
    
    echo "Disk Usage:"
    df -h /home/kavia/workspace/cm543c1f6d/jira-integration
    echo
    
    echo "Load Average:"
    uptime
    echo
}

# Check for recent crashes
check_for_crashes() {
    echo "Checking for recent Node.js crashes..."
    local crash_files=$(find /tmp -name "core.*" -newer /proc -exec ls -la {} \; 2>/dev/null || true)
    if [ -n "$crash_files" ]; then
        echo "⚠️  Found recent crash files:"
        echo "$crash_files"
    else
        echo "✅ No recent crash files found"
    fi
}

# Main health check
main() {
    echo "1. Checking Vite process..."
    check_vite_process
    echo
    
    echo "2. Checking port status..."
    check_port_status
    echo
    
    echo "3. Checking system resources..."
    check_system_resources
    
    echo "4. Checking for crashes..."
    check_for_crashes
    echo
    
    echo "=== Health Check Complete ==="
    
    # If both process and port checks pass, everything is healthy
    if check_vite_process >/dev/null 2>&1 && check_port_status >/dev/null 2>&1; then
        echo "✅ Overall Status: HEALTHY"
        exit 0
    else
        echo "❌ Overall Status: UNHEALTHY"
        exit 1
    fi
}

main "$@"
