import React from 'react';
import { Card, List, Avatar, Typography, Badge, Empty } from 'antd';
import { UserOutlined, CrownOutlined } from '@ant-designed/icons';
import { useAuth } from '../../contexts/AuthContext';
import './OnlineUsers.css';

const { Title, Text } = Typography;

function OnlineUsers({ users = [] }) {
    const { user: currentUser } = useAuth();

    // 排序用户列表：当前用户在前，然后按昵称排序
    const sortedUsers = React.useMemo(() => {
        return [...users].sort((a, b) => {
            if (a.id === currentUser?.id) return -1;
            if (b.id === currentUser?.id) return 1;
            return (a.nickname || a.username).localeCompare(b.nickname || b.username);
        });
    }, [users, currentUser]);

    const renderUser = (user) => {
        const isCurrentUser = user.id === currentUser?.id;
        const displayName = user.nickname || user.username;

        return (
            <List.Item className={`user-item ${isCurrentUser ? 'current-user' : ''}`}>
                <List.Item.Meta
                    avatar={
                        <Badge
                            status="success"
                            offset={[-2, 32]}
                        >
                            <Avatar
                                src={user.avatar}
                                size={40}
                                className="user-avatar"
                            >
                                {displayName[0]?.toUpperCase()}
                            </Avatar>
                        </Badge>
                    }
                    title={
                        <div className="user-info">
                            <Text className="user-name" strong={isCurrentUser}>
                                {displayName}
                                {isCurrentUser && (
                                    <CrownOutlined className="current-user-icon" />
                                )}
                            </Text>
                            {isCurrentUser && (
                                <Text type="secondary" className="user-label">
                                    (我)
                                </Text>
                            )}
                        </div>
                    }
                    description={
                        <Text type="secondary" className="user-status">
                            在线
                        </Text>
                    }
                />
            </List.Item>
        );
    };

    return (
        <Card
            className="online-users-card"
            title={
                <div className="users-header">
                    <Title level={5} className="users-title">
                        <UserOutlined /> 在线用户
                    </Title>
                    <Badge
                        count={users.length}
                        className="users-count"
                        style={{ backgroundColor: '#52c41a' }}
                    />
                </div>
            }
            bodyStyle={{ padding: 0 }}
        >
            <div className="users-list-container">
                {users.length === 0 ? (
                    <Empty
                        description="暂无在线用户"
                        className="users-empty"
                        imageStyle={{ height: 60 }}
                    />
                ) : (
                    <List
                        className="users-list"
                        dataSource={sortedUsers}
                        renderItem={renderUser}
                        split={false}
                    />
                )}
            </div>
        </Card>
    );
}

export default OnlineUsers;
