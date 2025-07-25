package handlers

import (
	"github.com/Katrigeng/go-chat-room/models"
	"github.com/Katrigeng/go-chat-room/services"
	"github.com/Katrigeng/go-chat-room/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var ChatHub = services.NewHub()

func init() {
	go ChatHub.Run()
}

func WebSocketHandler(c *gin.Context) {
	// 从查询参数获取token（WebSocket连接时无法使用Header）
	tokenString := c.Query("token")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Token required",
		})
		return
	}

	// 验证token
	claims, err := utils.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})
		return
	}

	// 获取用户信息
	var user models.User
	if err := utils.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not found",
		})
		return
	}

	// 升级HTTP连接为WebSocket连接
	conn, err := services.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// 创建客户端
	client := &services.Client{
		ID:   uuid.New().String(),
		User: &user,
		Conn: conn,
		Send: make(chan []byte, 256),
		Hub:  ChatHub,
	}

	// 注册客户端
	ChatHub.Register <- client

	// 启动读写协程
	go client.WritePump()
	go client.ReadPump()
}

func GetOnlineUsersHandler(c *gin.Context) {
	users := ChatHub.GetOnlineUsers()
	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"count": len(users),
	})
}

func GetMessagesWithPagination(c *gin.Context) {
	// 获取分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	var messages []models.Message
	var total int64

	// 计算总数
	utils.DB.Model(&models.Message{}).Count(&total)

	// 获取分页消息
	if err := utils.DB.Preload("User").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch messages",
		})
		return
	}

	// 转换为响应格式并反转顺序
	messageResponses := make([]models.MessageResponse, len(messages))
	for i, msg := range messages {
		messageResponses[len(messages)-1-i] = models.MessageResponse{
			ID:        msg.ID,
			CreatedAt: msg.CreatedAt,
			Content:   msg.Content,
			Type:      msg.Type,
			User: models.UserInfo{
				ID:       msg.User.ID,
				Username: msg.User.Username,
				Nickname: msg.User.Nickname,
				Avatar:   msg.User.Avatar,
			},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"messages":    messageResponses,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}
