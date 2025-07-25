import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import './Auth.css';

const { Title, Text } = Typography;

function Login() {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await authService.login({
                username: values.username,
                password: values.password,
            });

            login(result.user, result.token);
            message.success('登录成功！');
            navigate('/chat');
        } catch (error) {
            message.error(error.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <Card className="auth-card" bordered={false}>
                    <div className="auth-header">
                        <Title level={2} className="auth-title">
                            欢迎回来
                        </Title>
                        <Text type="secondary" className="auth-subtitle">
                            登录到现代化聊天室
                        </Text>
                    </div>

                    <Form
                        name="login"
                        className="auth-form"
                        size="large"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: '请输入用户名!' },
                                { min: 3, message: '用户名至少3个字符!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="用户名"
                                className="auth-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: '请输入密码!' },
                                { min: 6, message: '密码至少6个字符!' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="密码"
                                className="auth-input"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="auth-button"
                                block
                            >
                                {loading ? '登录中...' : '登录'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider plain>
                        <Text type="secondary">或者</Text>
                    </Divider>

                    <div className="auth-footer">
                        <Text type="secondary">
                            还没有账户？{' '}
                            <Link to="/register" className="auth-link">
                                立即注册
                            </Link>
                        </Text>
                    </div>
                </Card>

                <div className="auth-features">
                    <div className="feature-item">
                        <div className="feature-icon">💬</div>
                        <div className="feature-text">实时聊天</div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">👥</div>
                        <div className="feature-text">在线用户</div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">📱</div>
                        <div className="feature-text">响应式设计</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
