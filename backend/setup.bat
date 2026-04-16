@echo off
echo ===========================================
echo    Flipkart Clone - Backend Setup
echo ===========================================
echo.

echo [1/4] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing dependencies...
pip install -r requirements.txt

echo [3/4] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example - Please update with your credentials
)

echo [4/4] Done! 
echo.
echo To run the backend:
echo   1. Make sure PostgreSQL is running
echo   2. Create database: createdb flipkart_db
echo   3. Activate venv: venv\Scripts\activate
echo   4. Seed database: python -m app.seed
echo   5. Start server: uvicorn app.main:app --reload
echo.
pause
