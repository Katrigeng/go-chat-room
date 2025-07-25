# 现代化聊天室应用 - 后端

基于 Go + Gin + WebSocket + MySQL 构建的高性能聊天室后端服务。

## 功能特性

- 🔐 用户注册与登录认证
- 💬 实时消息发送与接收
- 📜 历史消息查看与分页
- 👥 在线用户状态显示
- 🔒 JWT Token 认证
- 🌐 WebSocket 实时通信
- 📱 RESTful API 设计

## 技术栈

- **后端框架**: Gin (Go)
- **实时通信**: Gorilla WebSocket
- **数据库**: MySQL + GORM
- **认证**: JWT
- **部署**: Docker + Docker Compose

## 快速开始

### 环境要求

- Go 1.21+
- MySQL 8.0+
- Git

### 安装依赖

```bash
go mod download
