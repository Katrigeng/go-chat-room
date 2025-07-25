package main

import (
	"github.com/Katrigeng/go-chat-room/config"
	"github.com/Katrigeng/go-chat-room/routes"
	"github.com/Katrigeng/go-chat-room/utils"
	"log"
	"net/http"
	"time"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 初始化JWT
	utils.InitJWT(cfg.JWTSecret)

	// 初始化数据库
	if err := utils.InitDatabase(cfg); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// 设置路由
	router := routes.SetupRoutes()

	// 创建HTTP服务器
	server := &http.Server{
		Addr:           ":" + cfg.Port,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	log.Printf("🚀 Chat app backend server starting on port %s", cfg.Port)
	log.Printf("📊 Health check: http://localhost:%s/health", cfg.Port)
	log.Printf("🔌 WebSocket endpoint: ws://localhost:%s/api/v1/ws", cfg.Port)

	// 启动服务器
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal("Failed to start server:", err)
	}
}
