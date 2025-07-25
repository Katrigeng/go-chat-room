import React, { useState } from 'react';
import { Modal, Form, Input, Button, Avatar, Upload, message, Space, Divider } from 'antd';
import { EditOutlined, CameraOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import './UserProfile.css';

function UserProfile({ visible, onClose }) {
    const { user, updateUser } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    React.useEffect(() => {
        if (visible && user) {
            form.setFieldsValue({
                nickname: user.nickname,
                email: user.email,
            });
        }
    }, [visible, user, form]);

    const handleSave = async (values) => {
        setLoading(true);
        try {
            const result = await authService.updateProfile({
                nickname: values.nickname,
                avatar: user.avatar, // 暂时保持现有头像
            });

            updateUser(result.user);
            message.success('个人资料更新成功');
            setEditing(false);
        } catch (error) {
            message.error(error.message || '更新失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setEditing(false);
        onClose();
    };

    const handleAvatarChange = ({ file, fileList }) => {
        // 这里可以实现头像上传逻辑
        message.info('头像上传功能待实现');
    };

    if (!user) return null;

    return (
        <Modal
            title="个人资料"
            open={visible}
            onCancel={handleCancel}
            width={480}
            footer={editing ? [
                <Button key="cancel" onClick={() => setEditing(false)}>
                    取消
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()}
                >
                    保存
                </Button>
            ] : [
                <Button key="edit" type="primary" onClick={() => setEditing(true)}>
                    编辑资料
                </Button>
            ]}
            className="user-profile-modal"
        >
            <div className="profile-content">
                <div className="profile-header">
                    <div className="avatar-section">
                        <Avatar
                            src={user.avatar}
                            size={80}
                            className="profile-avatar"
                        >
                            {user.nickname?.[0] || user.username?.[0]}
                        </Avatar>

                        {editing && (
                            <Upload
                                showUploadList={false}
                                onChange={handleAvatarChange}
                                className="avatar-upload"
                            >
                                <Button
                                    type="text"
                                    icon={<CameraOutlined />}
                                    className="avatar-upload-button"
                                    size="small"
                                >
                                    更换头像
                                </Button>
                            </Upload>
                        )}
                    </div>

                    <div className="profile-info">
                        <h3 className="profile-name">
                            {user.nickname || user.username}
                        </h3>
                        <p className="profile-username">@{user.username}</p>
                    </div>
                </div>

                <Divider />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    disabled={!editing}
                    className="profile-form"
                >
                    <Form.Item
                        name="nickname"
                        label="昵称"
                        rules={[
                            { required: true, message: '请输入昵称' },
                            { min: 2, max: 50, message: '昵称长度为2-50个字符' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="请输入昵称"
                            disabled={!editing}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                    >
                        <Input
                            prefix={<MailOutlined />}
                            disabled={true}
                            placeholder="邮箱地址"
                        />
                    </Form.Item>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <div className="stat-label">用户名</div>
                            <div className="stat-value">{user.username}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">注册时间</div>
                            <div className="stat-value">
                                {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}

export default UserProfile;
