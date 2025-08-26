@echo off

pushd "%~dp0"

REM Start db connection
start db_service\01.StartdbService.cmd

timeout /t 2 /nobreak >nul

REM Start auth connection
start auth\02.StartAuth.cmd

timeout /t 2 /nobreak >nul

REM Start school connection
start school\03.StartSchool.cmd

timeout /t 2 /nobreak >nul