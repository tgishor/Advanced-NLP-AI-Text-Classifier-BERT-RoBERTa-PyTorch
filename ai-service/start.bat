@echo off
cls
echo ============================================================
echo  AI Sales Deck Generator - Starting AI Service
echo ============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "app.py" (
    echo ❌ app.py not found!
    echo Please run this script from the ai-service directory
    pause
    exit /b 1
)

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo 🐍 Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo ⚠️  Virtual environment not found
    echo Using system Python
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  No .env file found
    echo Using environment defaults
    echo 💡 Create .env file for custom configuration
    echo.
)

REM Install requirements if needed
echo 📦 Checking dependencies...
pip install -r requirements.txt --quiet

echo.
echo 🚀 Starting AI Service...
echo ⏰ First run may take 10-30 minutes to download models
echo 💡 Models will be cached for faster future startups
echo.
echo Press Ctrl+C to stop the service
echo ============================================================
echo.

REM Start the application
python app.py

REM Keep window open if there was an error
if errorlevel 1 (
    echo.
    echo ❌ Service exited with an error
    pause
) 