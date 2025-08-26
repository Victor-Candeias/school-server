@echo off

Echo start school

REM Ativa o ambiente virtual
call C:\_MyWork\Git\school\server\school\.venv\Scripts\activate.bat

timeout /t 3 /nobreak >nul

REM Executa o main.py com Python
python C:\_MyWork\Git\school\server\school\main.py

pause
