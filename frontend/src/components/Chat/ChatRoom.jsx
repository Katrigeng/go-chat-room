import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, message } from 'antd';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import UserProfile from './UserProfile';
import { useWebSocket } from '../../contexts/WebSocketContext';
import messageService from '../../services/messageService';
import './ChatRoom.css';

const { Content, Sider } = Layout;

function ChatRoom() {
    const { messages, connected, onlineUsers } = useWebSocket();
    const [loading, setLoading] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // 加载历史消息
    useEffect(() => {
        const loadMessages = async () => {
            if (messages.length > 0) return; // 已有消息则不重复加载

            setLoading(true);
            try {
                const result = await messageService.getMessages();
                // 这里可以将历史消息设置到WebSocket context中
                // 由于WebSocket context主要处理实时消息，历史消息可以在这里单独处理
            } catch (error) {
                message.error('加载历史消息失败');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [messages.length]);

    return (
        <Layout className="chatroom-layout">
            <ChatHeader
                connected={connected}
                onProfileClick={() => setShowProfile(true)}
                collapsed={collapsed}
                onCollapse={setCollapsed}
            />

            <Layout className="chatroom-content">
                <Content className="chat-main">
                    <div className="chat-container">
                        <Card
                            className="chat-card"
                            bodyStyle={{ padding: 0, height: '100%' }}
                        >
                            <div className="chat-area">
                                <MessageList
                                    messages={messages}
                                    loading={loading}
                                />
                                <MessageInput />
                            </div>
                        </Card>
                    </div>
                </Content>

                <Sider
                    width={280}
                    collapsed={collapsed}
                    collapsedWidth={0}
                    className="chat-sidebar"
                    breakpoint="lg"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                >
                    <OnlineUsers users={onlineUsers} />
                </Sider>
            </Layout>

            <UserProfile
                visible={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </Layout>
    );
}

export default ChatRoom;
