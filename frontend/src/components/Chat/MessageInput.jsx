import React, { useState, useRef, useCallback } from 'react';
import { Input, Button, Space, Tooltip, message } from 'antd';
import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { useWebSocket } from '../../contexts/WebSocketContext';
import './MessageInput.css';

const { TextArea } = Input;

function MessageInput() {
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const { sendMessage, sendTyping, connected } = useWebSocket();
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // 发送消息
    const handleSendMessage = useCallback(() => {
        const content = messageText.trim();
        if (!content) {
            message.warning('请输入消息内容');
            return;
        }

        if (!connected) {
            message.error('连接已断开，无法发送消息');
            return;
        }

        try {
            sendMessage(content);
            setMessageText('');

            // 停止打字状态
            if (isTyping) {
                sendTyping(false);
                setIsTyping(false);
            }

            // 清除打字超时
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            // 聚焦输入框
            if (inputRef.current) {
                inputRef.current.focus();
            }
        } catch (error) {
            message.error('发送消息失败');
        }
    }, [messageText, connected, sendMessage, sendTyping, isTyping]);

    // 处理输入变化
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setMessageText(value);

        if (!connected) return;

        // 处理打字状态
        if (value.trim() && !isTyping) {
            setIsTyping(true);
            sendTyping(true);
        }

        // 重置打字超时
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                sendTyping(false);
            }
        }, 2000);
    }, [connected, isTyping, sendTyping]);

    // 处理键盘事件
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // 组件卸载时清理
    React.useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTyping) {
                sendTyping(false);
            }
        };
    }, [isTyping, sendTyping]);

    const isDisabled = !connected;

    return (
        <div className="message-input-container">
            <div className="message-input-wrapper">
                <div className="input-section">
                    <TextArea
                        ref={inputRef}
                        value={messageText}
                        onChange={handleInputChange}
                        onPressEnter={handleKeyPress}
                        placeholder={connected ? "输入消息... (Shift+Enter 换行)" : "连接已断开"}
                        disabled={isDisabled}
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        className="message-textarea"
                        maxLength={1000}
                    />
                </div>

                <div className="action-section">
                    <Space>
                        <Tooltip title="表情">
                            <Button
                                type="text"
                                icon={<SmileOutlined />}
                                disabled={isDisabled}
                                className="action-button emoji-button"
                            />
                        </Tooltip>

                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            disabled={isDisabled || !messageText.trim()}
                            className="send-button"
                        >
                            发送
                        </Button>
                    </Space>
                </div>
            </div>

            <div className="input-footer">
                <div className="connection-info">
                    {connected ? (
                        <span className="status-connected">● 已连接</span>
                    ) : (
                        <span className="status-disconnected">● 连接中...</span>
                    )}
                </div>

                <div className="char-count">
                    {messageText.length}/1000
                </div>
            </div>
        </div>
    );
}

export default MessageInput;
