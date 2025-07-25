package services

import (
	"encoding/json"
	"github.com/Katrigeng/go-chat-room/models"
	"github.com/Katrigeng/go-chat-room/utils"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	ID    string
	User  *models.User
	Conn  *websocket.Conn
	Send  chan []byte
	Hub   *Hub
	mutex sync.Mutex
}

type Hub struct {
	Clients    map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan []byte
	mutex      sync.RWMutex
}

type WSMessage struct {
	Type      string                  `json:"type"`
	Content   string                  `json:"content,omitempty"`
	User      *models.UserInfo        `json:"user,omitempty"`
	Data      map[string]interface{}  `json:"data,omitempty"`
	Message   *models.MessageResponse `json:"message,omitempty"`
	Timestamp string                  `json:"timestamp,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan []byte),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mutex.Lock()
			h.Clients[client] = true
			h.mutex.Unlock()

			// 更新用户在线状态
			client.User.Status = "online"
			utils.DB.Save(client.User)

			// 广播用户上线
			h.broadcastUserStatus(client.User, "user_online")
			log.Printf("User %s connected", client.User.Username)

		case client := <-h.Unregister:
			h.mutex.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)

				// 更新用户离线状态
				client.User.Status = "offline"
				utils.DB.Save(client.User)
			}
			h.mutex.Unlock()

			// 广播用户离线
			h.broadcastUserStatus(client.User, "user_offline")
			log.Printf("User %s disconnected", client.User.Username)

		case message := <-h.Broadcast:
			h.mutex.RLock()
			for client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					delete(h.Clients, client)
					close(client.Send)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) broadcastUserStatus(user *models.User, msgType string) {
	userInfo := &models.UserInfo{
		ID:       user.ID,
		Username: user.Username,
		Nickname: user.Nickname,
		Avatar:   user.Avatar,
	}

	message := WSMessage{
		Type: msgType,
		User: userInfo,
		Data: map[string]interface{}{
			"status": user.Status,
		},
	}

	data, _ := json.Marshal(message)
	h.Broadcast <- data
}

func (h *Hub) GetOnlineUsers() []*models.UserInfo {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	users := make([]*models.UserInfo, 0, len(h.Clients))
	for client := range h.Clients {
		users = append(users, &models.UserInfo{
			ID:       client.User.ID,
			Username: client.User.Username,
			Nickname: client.User.Nickname,
			Avatar:   client.User.Avatar,
		})
	}
	return users
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512)

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var wsMsg WSMessage
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			log.Printf("JSON unmarshal error: %v", err)
			continue
		}

		switch wsMsg.Type {
		case "chat_message":
			c.handleChatMessage(wsMsg.Content)
		case "typing":
			c.handleTyping(true)
		case "stop_typing":
			c.handleTyping(false)
		}
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.mutex.Lock()
			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			c.mutex.Unlock()

			if err != nil {
				log.Printf("WriteMessage error: %v", err)
				return
			}
		}
	}
}

func (c *Client) handleChatMessage(content string) {
	if content == "" {
		return
	}

	// 保存消息到数据库
	message := &models.Message{
		UserID:  c.User.ID,
		Content: content,
		Type:    "text",
	}

	if err := utils.DB.Create(message).Error; err != nil {
		log.Printf("Failed to save message: %v", err)
		return
	}

	// 预加载用户信息
	utils.DB.Preload("User").First(message, message.ID)

	// 构造响应消息
	msgResponse := &models.MessageResponse{
		ID:        message.ID,
		CreatedAt: message.CreatedAt,
		Content:   message.Content,
		Type:      message.Type,
		User: models.UserInfo{
			ID:       message.User.ID,
			Username: message.User.Username,
			Nickname: message.User.Nickname,
			Avatar:   message.User.Avatar,
		},
	}

	// 广播消息
	wsMsg := WSMessage{
		Type:    "new_message",
		Message: msgResponse,
	}

	data, _ := json.Marshal(wsMsg)
	c.Hub.Broadcast <- data
}

func (c *Client) handleTyping(isTyping bool) {
	msgType := "stop_typing"
	if isTyping {
		msgType = "typing"
	}

	userInfo := &models.UserInfo{
		ID:       c.User.ID,
		Username: c.User.Username,
		Nickname: c.User.Nickname,
		Avatar:   c.User.Avatar,
	}

	message := WSMessage{
		Type: msgType,
		User: userInfo,
	}

	data, _ := json.Marshal(message)
	c.Hub.Broadcast <- data
}
