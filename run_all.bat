@echo off
echo ==========================================
echo   SYNAPSE REAL-TIME MONITORING SYSTEM
echo ==========================================
echo.

echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies. Please check Node.js installation.
    pause
    exit /b
)

echo.
echo [2/3] Starting CSV Streamer (Data Source)...
start "Synapse Data Streamer" node csv-streamer.js

echo.
echo [3/3] Opening Dashboard in Browser...
timeout /t 3 > nul
start http://localhost:8081/index.html

echo.
echo ===================================================
echo   ✓ SYNAPSE IS NOW RUNNING!
echo ===================================================
echo.
echo   Dashboard URL: http://localhost:8081/index.html
echo   Data Stream:   ws://localhost:8081
echo.
echo   ► Live data is streaming to your dashboard
echo   ► Check the "Synapse Data Streamer" window for logs
echo.
echo   IMPORTANT: Keep the streamer window open!
echo   You can minimize this window safely.
echo ===================================================
echo.
echo Press any key to stop the system and close...
pause > nul

echo.
echo Shutting down Synapse...
taskkill /FI "WINDOWTITLE eq Synapse Data Streamer*" /T /F > nul 2>&1
echo System stopped.
timeout /t 2 > nul
