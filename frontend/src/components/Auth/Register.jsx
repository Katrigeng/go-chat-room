import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import './Auth.css';

const { Title, Text } = Typography;

function Register() {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await authService.register({
                username: values.username,
                email: values.email,
                password: values.password,
                nickname: values.nickname,
            });

            login(result.user, result.token);
            message.success('注册成功！');
            navigate('/chat');
        } catch (error) {
            message.error(error.message || '注册失败');
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
                            创建账户
                        </Title>
                        <Text type="secondary" className="auth-subtitle">
                            加入现代化聊天室社区
                        </Text>
                    </div>

                    <Form
                        name="register"
                        className="auth-form"
                        size="large"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: '请输入用户名!' },
                                { min: 3, max: 20, message: '用户名长度为3-20个字符!' },
                                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="用户名"
                                className="auth-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: '请输入邮箱!' },
                                { type: 'email', message: '请输入有效的邮箱地址!' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="邮箱地址"
                                className="auth-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="nickname"
                            rules={[
                                { required: true, message: '请输入昵称!' },
                                { min: 2, max: 50, message: '昵称长度为2-50个字符!' },
                            ]}
                        >
                            <Input
                                prefix={<EditOutlined />}
                                placeholder="昵称"
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

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: '请确认密码!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次输入的密码不一致!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="确认密码"
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
                                {loading ? '注册中...' : '注册'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider plain>
                        <Text type="secondary">或者</Text>
                    </Divider>

                    <div className="auth-footer">
                        <Text type="secondary">
                            已有账户？{' '}
                            <Link to="/login" className="auth-link">
                                立即登录
                            </Link>
                        </Text>
                    </div>
                </Card>

                <div className="auth-features">
                    <div className="feature-item">
                        <div className="feature-icon">🚀</div>
                        <div className="feature-text">快速注册</div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🔒</div>
                        <div className="feature-text">安全可靠</div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🌟</div>
                        <div className="feature-text">功能丰富</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
