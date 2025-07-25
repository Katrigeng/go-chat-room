package handlers

import (
	"github.com/Katrigeng/go-chat-room/models"
	"github.com/Katrigeng/go-chat-room/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not found in context",
		})
		return
	}

	user := userInterface.(*models.User)
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func UpdateProfile(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not found in context",
		})
		return
	}

	user := userInterface.(*models.User)

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// 更新用户信息
	user.Nickname = req.Nickname
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if err := utils.DB.Save(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

func GetMessages(c *gin.Context) {
	var messages []models.Message

	// 获取最近的消息，按时间倒序
	if err := utils.DB.Preload("User").
		Order("created_at DESC").
		Limit(50).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch messages",
		})
		return
	}

	// 转换为响应格式并反转顺序（最老的在前）
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
		"messages": messageResponses,
		"count":    len(messageResponses),
	})
}

func GetOnlineUsers(c *gin.Context) {
	// 这个会在websocket handler中实现
	c.JSON(http.StatusOK, gin.H{
		"users": []models.UserInfo{},
		"count": 0,
	})
}
