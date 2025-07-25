import React, { useRef, useEffect, useState } from 'react';
import { List, Avatar, Typography, Spin, Empty, Tag } from 'antd';
import { LoadingOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import './MessageList.css';

const { Text } = Typography;

function MessageList({ messages, loading }) {
    const { user } = useAuth();
    const { typingUsers } = useWebSocket();
    const messagesEndRef = useRef(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const listRef = useRef(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        if (messagesEndRef.current && !isScrolledUp) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 处理滚动事件
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setIsScrolledUp(!isAtBottom);
    };

    // 格式化消息时间
    const formatMessageTime = (timestamp) => {
        const now = dayjs();
        const messageTime = dayjs(timestamp);

        if (now.diff(messageTime, 'day') === 0) {
            return messageTime.format('HH:mm');
        } else if (now.diff(messageTime, 'day') === 1) {
            return `昨天 ${messageTime.format('HH:mm')}`;
        } else if (now.diff(messageTime, 'day') < 7) {
            return messageTime.format('dddd HH:mm');
        } else {
            return messageTime.format('MM-DD HH:mm');
        }
    };

    // 渲染消息项
    const renderMessage = (message) => {
        const isOwnMessage = message.user.id === user?.id;

        return (
            <div
                key={message.id}
                className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
            >
                {!isOwnMessage && (
                    <Avatar
                        src={message.user.avatar}
                        size={36}
                        className="message-avatar"
                    >
                        {message.user.nickname?.[0] || message.user.username?.[0]}
                    </Avatar>
                )}

                <div className="message-content">
                    {!isOwnMessage && (
                        <div className="message-header">
                            <Text strong className="message-username">
                                {message.user.nickname || message.user.username}
                            </Text>
                            <Text type="secondary" className="message-time">
                                {formatMessageTime(message.created_at)}
                            </Text>
                        </div>
                    )}

                    <div className={`message-bubble ${isOwnMessage ? 'own-bubble' : 'other-bubble'}`}>
                        <Text className="message-text">{message.content}</Text>
                        {isOwnMessage && (
                            <div className="message-time-own">
                                {formatMessageTime(message.created_at)}
                            </div>
                        )}
                    </div>
                </div>

                {isOwnMessage && (
                    <Avatar
                        src={message.user.avatar}
                        size={36}
                        className="message-avatar own-avatar"
                    >
                        {message.user.nickname?.[0] || message.user.username?.[0]}
                    </Avatar>
                )}
            </div>
        );
    };

    // 渲染打字指示器
    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        return (
            <div className="typing-indicator">
                <div className="typing-users">
                    {typingUsers.map(user => (
                        <Tag key={user.id} icon={<EditOutlined />} className="typing-tag">
                            {user.nickname || user.username} 正在输入...
                        </Tag>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="message-list-loading">
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                    tip="加载消息中..."
                />
            </div>
        );
    }

    return (
        <div className="message-list-container">
            <div
                className="message-list"
                ref={listRef}
                onScroll={handleScroll}
            >
                {messages.length === 0 ? (
                    <Empty
                        description="暂无消息"
                        className="message-empty"
                        imageStyle={{ height: 60 }}
                    />
                ) : (
                    <>
                        <div className="messages-container">
                            {messages.map(renderMessage)}
                        </div>
                        {renderTypingIndicator()}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {isScrolledUp && messages.length > 0 && (
                <div className="scroll-to-bottom" onClick={scrollToBottom}>
                    <div className="scroll-button">
                        ↓ 回到底部
                    </div>
                </div>
            )}
        </div>
    );
}

export default MessageList;
