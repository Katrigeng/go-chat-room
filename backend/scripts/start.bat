@echo off

REM 设置环境变量
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=your_password
set DB_NAME=chatroom
set JWT_SECRET=your-super-secret-jwt-key-here
set PORT=8080

REM 启动应用
echo Starting chat app backend...
go run main.go
