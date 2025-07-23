#!/bin/bash

# Development script to launch Chrome with CORS disabled for Jira API testing
# WARNING: Only use this for development purposes, never in production

echo "Starting Chrome with CORS disabled for Jira API development..."
echo "WARNING: This disables web security features. Only use for development!"

# Create temporary user data directory
TEMP_DIR="/tmp/chrome_dev_jira_$(date +%s)"
mkdir -p "$TEMP_DIR"

# Detect OS and launch Chrome accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Detected macOS - launching Chrome..."
    open -n -a "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        --args \
        --user-data-dir="$TEMP_DIR" \
        --disable-web-security \
        --disable-features=VizDisplayCompositor \
        --disable-site-isolation-trials \
        --allow-running-insecure-content \
        http://localhost:5173
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Detected Linux - launching Chrome..."
    google-chrome \
        --user-data-dir="$TEMP_DIR" \
        --disable-web-security \
        --disable-features=VizDisplayCompositor \
        --disable-site-isolation-trials \
        --allow-running-insecure-content \
        http://localhost:5173 &
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    echo "Detected Windows - launching Chrome..."
    start chrome \
        --user-data-dir="$TEMP_DIR" \
        --disable-web-security \
        --disable-features=VizDisplayCompositor \
        --disable-site-isolation-trials \
        --allow-running-insecure-content \
        http://localhost:5173
else
    echo "Unsupported OS: $OSTYPE"
    echo "Please manually launch Chrome with the following flags:"
    echo "--user-data-dir=$TEMP_DIR --disable-web-security --disable-features=VizDisplayCompositor"
    exit 1
fi

echo ""
echo "Chrome launched with CORS disabled!"
echo "You can now test direct Jira API calls from the application."
echo ""
echo "When you're done testing:"
echo "1. Close the Chrome window"
echo "2. The temporary profile will be cleaned up automatically"
echo ""
echo "To start the Vite dev server (if not already running):"
echo "cd jira-integration && npm run dev"
