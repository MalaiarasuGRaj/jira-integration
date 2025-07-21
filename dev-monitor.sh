#!/bin/bash

# Development monitoring script for Vite
# This script helps monitor the Vite process and restart it if it crashes

set -e

echo "Starting Vite development server with monitoring..."

# Function to cleanup processes on exit
cleanup() {
    echo "Cleaning up processes..."
    pkill -f "vite" || true
    pkill -f "npm run dev" || true
    exit 0
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is already in use"
        return 1
    else
        echo "Port $port is available"
        return 0
    fi
}

# Function to find available port
find_available_port() {
    local start_port=3000
    local max_port=3010
    
    for ((port=start_port; port<=max_port; port++)); do
        if check_port $port; then
            echo $port
            return 0
        fi
    done
    
    echo "No available ports found between $start_port and $max_port"
    return 1
}

# Main execution
main() {
    # Check memory
    echo "Checking system memory..."
    free -h
    
    # Check for existing Vite processes
    echo "Checking for existing Vite processes..."
    if pgrep -f "vite" > /dev/null; then
        echo "Killing existing Vite processes..."
        pkill -f "vite" || true
        sleep 2
    fi
    
    # Find available port
    PORT=$(find_available_port)
    if [ $? -ne 0 ]; then
        echo "Could not find available port, exiting..."
        exit 1
    fi
    
    echo "Using port: $PORT"
    
    # Start Vite with memory limits
    echo "Starting Vite development server..."
    export NODE_OPTIONS="--max-old-space-size=4096"
    export VITE_PORT=$PORT
    
    # Run with restart capability
    local max_restarts=3
    local restart_count=0
    
    while [ $restart_count -lt $max_restarts ]; do
        echo "Starting Vite (attempt $((restart_count + 1))/$max_restarts)..."
        
        if [ $PORT -ne 3000 ]; then
            # Use different port
            npx vite --port $PORT --host 0.0.0.0
        else
            # Use default configuration
            npm run dev
        fi
        
        local exit_code=$?
        
        if [ $exit_code -eq 137 ]; then
            echo "Vite process was killed (exit code 137) - likely OOM"
            restart_count=$((restart_count + 1))
            echo "Waiting 5 seconds before restart..."
            sleep 5
        elif [ $exit_code -ne 0 ]; then
            echo "Vite exited with code $exit_code"
            restart_count=$((restart_count + 1))
            echo "Waiting 3 seconds before restart..."
            sleep 3
        else
            echo "Vite exited normally"
            break
        fi
    done
    
    if [ $restart_count -ge $max_restarts ]; then
        echo "Maximum restart attempts reached. Please check the logs and system resources."
        exit 1
    fi
}

main "$@"
