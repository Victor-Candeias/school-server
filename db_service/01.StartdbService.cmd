@echo off

Echo start db_service

pushd "%~dp0"

REM Ativa o ambiente virtual
call .venv\Scripts\activate.bat

timeout /t 3 /nobreak >nul

REM Executa o main.py com Python
python .\main.py

pause
