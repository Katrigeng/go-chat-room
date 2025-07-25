package routes

import (
	"github.com/Katrigeng/go-chat-room/handlers"
	"github.com/Katrigeng/go-chat-room/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	// 设置Gin模式
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()

	// 添加中间件
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware())

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Chat app backend is running",
		})
	})

	// API路由组
	api := router.Group("/api/v1")
	{
		// 公开路由（不需要认证）
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		// 需要认证的路由
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// 用户相关路由
			user := protected.Group("/user")
			{
				user.GET("/profile", handlers.GetProfile)
				user.PUT("/profile", handlers.UpdateProfile)
				user.POST("/logout", handlers.Logout)
			}

			// 消息相关路由
			messages := protected.Group("/messages")
			{
				messages.GET("/", handlers.GetMessages)
				messages.GET("/paginated", handlers.GetMessagesWithPagination)
			}

			// 用户状态相关路由
			users := protected.Group("/users")
			{
				users.GET("/online", handlers.GetOnlineUsersHandler)
			}

			// WebSocket连接
			protected.GET("/ws", handlers.WebSocketHandler)
		}
	}

	// 404处理
	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Route not found",
		})
	})

	return router
}
