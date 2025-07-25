-- 创建数据库
CREATE DATABASE IF NOT EXISTS chatroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE chatroom;

-- 创建用户表（GORM会自动创建，这里仅作参考）
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                     created_at DATETIME(3) NULL,
    updated_at DATETIME(3) NULL,
    deleted_at DATETIME(3) NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline',
    last_seen DATETIME(3) NULL,
    INDEX idx_users_deleted_at (deleted_at),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
    );

-- 创建消息表（GORM会自动创建，这里仅作参考）
CREATE TABLE IF NOT EXISTS messages (
                                        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                        created_at DATETIME(3) NULL,
    updated_at DATETIME(3) NULL,
    deleted_at DATETIME(3) NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    INDEX idx_messages_deleted_at (deleted_at),
    INDEX idx_messages_user_id (user_id),
    INDEX idx_messages_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
