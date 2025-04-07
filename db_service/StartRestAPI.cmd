@Echo off

pushd "%~dp0"

Start StartEnv.cmd

timeout /t 5 /nobreak >nul

Start StartServer.cmd