#!/bin/bash

# Improved startup script for Vite development server
# This script handles port conflicts, memory management, and process monitoring

set -e

# Configuration
MAX_RESTARTS=3
MEMORY_LIMIT=4096
START_PORT=3000
MAX_PORT=3010

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up processes..."
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    exit 0
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Find available port
find_available_port() {
    for ((port=START_PORT; port<=MAX_PORT; port++)); do
        if check_port $port; then
            echo $port
            return 0
        fi
    done
    
    log_error "No available ports found between $START_PORT and $MAX_PORT"
    return 1
}

# Kill existing processes
kill_existing_processes() {
    log_info "Checking for existing Vite processes..."
    
    if pgrep -f "vite" > /dev/null; then
        log_warn "Found existing Vite processes, terminating..."
        pkill -f "vite" || true
        sleep 3
        
        # Force kill if still running
        if pgrep -f "vite" > /dev/null; then
            log_warn "Force killing stubborn processes..."
            pkill -9 -f "vite" || true
            sleep 2
        fi
    fi
    
    if pgrep -f "npm run dev" > /dev/null; then
        log_warn "Found existing npm processes, terminating..."
        pkill -f "npm run dev" || true
        sleep 2
    fi
}

# Check system resources
check_system_resources() {
    log_info "Checking system resources..."
    
    # Check memory
    local available_memory=$(free -m | awk '/^Mem:/{print $7}')
    if [ $available_memory -lt 1000 ]; then
        log_warn "Low available memory: ${available_memory}MB"
        log_info "Running garbage collection..."
        # Force garbage collection if possible
        sync
        echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    else
        log_info "Available memory: ${available_memory}MB"
    fi
    
    # Check disk space
    local disk_usage=$(df -h . | awk 'NR==2{print $5}' | sed 's/%//')
    if [ $disk_usage -gt 90 ]; then
        log_warn "High disk usage: ${disk_usage}%"
    else
        log_info "Disk usage: ${disk_usage}%"
    fi
}

# Start Vite with monitoring
start_vite() {
    local port=$1
    local restart_count=0
    
    log_info "Starting Vite development server on port $port..."
    
    # Set Node.js options
    export NODE_OPTIONS="--max-old-space-size=$MEMORY_LIMIT"
    
    while [ $restart_count -lt $MAX_RESTARTS ]; do
        log_info "Starting Vite (attempt $((restart_count + 1))/$MAX_RESTARTS)..."
        
        local start_time=$(date +%s)
        
        # Start Vite
        if [ $port -eq 3000 ]; then
            npm run dev &
        else
            npx vite --port $port --host 0.0.0.0 &
        fi
        
        local vite_pid=$!
        log_info "Vite started with PID: $vite_pid"
        
        # Wait for Vite to start
        sleep 5
        
        # Check if process is still running
        if ! kill -0 $vite_pid 2>/dev/null; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            log_error "Vite process died after $duration seconds"
            
            restart_count=$((restart_count + 1))
            
            if [ $duration -lt 10 ]; then
                log_warn "Quick restart detected, waiting longer..."
                sleep 10
            else
                sleep 5
            fi
            continue
        fi
        
        # Monitor the process
        log_info "Vite is running successfully on port $port"
        log_info "Access your application at: http://localhost:$port"
        
        # Wait for the process to complete
        wait $vite_pid
        local exit_code=$?
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        if [ $exit_code -eq 137 ]; then
            log_error "Vite was killed (exit code 137) - likely OOM after ${duration}s"
            restart_count=$((restart_count + 1))
            log_info "Cleaning up and waiting before restart..."
            sleep 10
        elif [ $exit_code -ne 0 ]; then
            log_error "Vite exited with code $exit_code after ${duration}s"
            restart_count=$((restart_count + 1))
            sleep 5
        else
            log_info "Vite exited normally after ${duration}s"
            break
        fi
    done
    
    if [ $restart_count -ge $MAX_RESTARTS ]; then
        log_error "Maximum restart attempts ($MAX_RESTARTS) reached"
        log_error "Please check the system resources and logs"
        return 1
    fi
    
    return 0
}

# Main function
main() {
    log_info "=== Vite Development Server Startup ==="
    log_info "Timestamp: $(date)"
    
    # Check system resources
    check_system_resources
    
    # Kill existing processes
    kill_existing_processes
    
    # Find available port
    local port=$(find_available_port)
    if [ $? -ne 0 ]; then
        log_error "Could not find available port"
        exit 1
    fi
    
    if [ $port -ne 3000 ]; then
        log_warn "Port 3000 is occupied, using port $port instead"
    fi
    
    # Start Vite
    start_vite $port
    
    if [ $? -eq 0 ]; then
        log_info "Vite development server completed successfully"
    else
        log_error "Vite development server failed to start or crashed repeatedly"
        exit 1
    fi
}

main "$@"
