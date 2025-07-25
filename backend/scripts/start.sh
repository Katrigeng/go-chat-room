#!/bin/bash

# 设置环境变量
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=chatroom
export JWT_SECRET=your-super-secret-jwt-key-here
export PORT=8080

# 启动应用
echo "Starting chat app backend..."
go run main.go
