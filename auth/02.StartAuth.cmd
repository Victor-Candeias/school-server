@echo off

Echo start auth

REM Ativa o ambiente virtual
call C:\_MyWork\Git\school\server\auth\venv\Scripts\activate.bat

timeout /t 3 /nobreak >nul

REM Executa o main.py com Python
python C:\_MyWork\Git\school\server\auth\main.py

pause
