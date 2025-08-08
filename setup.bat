@echo off
echo ========================================
echo Face Recognition Attendance System Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version

REM Check if Python is installed
echo.
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)
echo Python found:
python --version

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd developer
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!

REM Create start script
echo.
echo Creating start script...
cd ..
echo @echo off > start.bat
echo echo Starting Face Recognition Attendance System... >> start.bat
echo echo. >> start.bat
echo echo Starting backend server... >> start.bat
echo start "Backend Server" cmd /k "cd developer\backend ^& python main.py" >> start.bat
echo echo. >> start.bat
echo echo Waiting for backend to start... >> start.bat
echo timeout /t 5 /nobreak ^>nul >> start.bat
echo echo. >> start.bat
echo echo Starting frontend development server... >> start.bat
echo start "Frontend Server" cmd /k "cd developer ^& npm run dev" >> start.bat
echo echo. >> start.bat
echo echo Both servers are starting... >> start.bat
echo echo Frontend will be available at: http://localhost:5173 >> start.bat
echo echo Backend will be available at: http://localhost:8000 >> start.bat
echo echo. >> start.bat
echo pause >> start.bat

REM Create stop script
echo Creating stop script...
echo @echo off > stop.bat
echo echo Stopping Face Recognition Attendance System... >> stop.bat
echo echo. >> stop.bat
echo taskkill /f /im node.exe 2^>nul >> stop.bat
echo taskkill /f /im python.exe 2^>nul >> stop.bat
echo echo All servers stopped. >> stop.bat
echo pause >> stop.bat

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the application:
echo   - Run: start.bat
echo.
echo To stop the application:
echo   - Run: stop.bat
echo.
echo The application will be available at:
echo   - Frontend: http://localhost:5173
echo   - Backend: http://localhost:8000
echo.
pause 