@echo off
REM Development script to launch Chrome with CORS disabled for Jira API testing
REM WARNING: Only use this for development purposes, never in production

echo Starting Chrome with CORS disabled for Jira API development...
echo WARNING: This disables web security features. Only use for development!

REM Create temporary user data directory
set TEMP_DIR=%TEMP%\chrome_dev_jira_%RANDOM%
mkdir "%TEMP_DIR%" 2>nul

REM Launch Chrome with CORS disabled
echo Launching Chrome with disabled security features...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
    --user-data-dir="%TEMP_DIR%" ^
    --disable-web-security ^
    --disable-features=VizDisplayCompositor ^
    --disable-site-isolation-trials ^
    --allow-running-insecure-content ^
    http://localhost:5173

echo.
echo Chrome launched with CORS disabled!
echo You can now test direct Jira API calls from the application.
echo.
echo When you're done testing:
echo 1. Close the Chrome window
echo 2. The temporary profile will be cleaned up automatically
echo.
echo To start the Vite dev server (if not already running):
echo cd jira-integration && npm run dev
echo.
pause
