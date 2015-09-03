if not exist "%~dp0\data\db" mkdir "%~dp0\data\db"
mongod.exe --dbpath "%~dp0\data\db"
pause