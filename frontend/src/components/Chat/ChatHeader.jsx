import React from 'react';
import { Layout, Typography, Space, Button, Badge, Tooltip } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    TeamOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    WifiOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

function ChatHeader({ connected, onProfileClick, collapsed, onCollapse }) {
    const { user, logout } = useAuth();
    const { onlineUsers } = useWebSocket();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <Header className="chat-header">
            <div className="chat-header-content">
                <div className="chat-header-left">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => onCollapse(!collapsed)}
                        className="sidebar-toggle"
                    />

                    <div className="chat-title">
                        <Title level={4} className="header-title">
                            现代化聊天室
                        </Title>
                        <div className="connection-status">
                            <Badge
                                status={connected ? 'success' : 'error'}
                                text={connected ? '已连接' : '连接中...'}
                            />
                        </div>
                    </div>
                </div>

                <div className="chat-header-right">
                    <Space size="middle">
                        <Tooltip title="在线用户">
                            <Button
                                type="text"
                                icon={<TeamOutlined />}
                                className="header-button"
                            >
                                <span className="online-count">{onlineUsers.length}</span>
                            </Button>
                        </Tooltip>

                        <Tooltip title="连接状态">
                            <Button
                                type="text"
                                icon={<WifiOutlined />}
                                className={`header-button ${connected ? 'connected' : 'disconnected'}`}
                            />
                        </Tooltip>

                        <Tooltip title="个人资料">
                            <Button
                                type="text"
                                icon={<UserOutlined />}
                                onClick={onProfileClick}
                                className="header-button"
                            >
                                {user?.nickname || user?.username}
                            </Button>
                        </Tooltip>

                        <Tooltip title="退出登录">
                            <Button
                                type="text"
                                icon={<LogoutOutlined />}
                                onClick={handleLogout}
                                className="header-button logout-button"
                            />
                        </Tooltip>
                    </Space>
                </div>
            </div>
        </Header>
    );
}

export default ChatHeader;
