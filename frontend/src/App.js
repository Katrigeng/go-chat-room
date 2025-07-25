import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, message } from 'antd';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatRoom from './components/Chat/ChatRoom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import authService from './services/authService';
import './styles/App.css';

const { Content } = Layout;

function AppContent() {
    const { user, login, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const userData = await authService.getProfile();
                    login(userData.user, token);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [login]);

    if (loading) {
        return (
            <Layout className="app-layout">
                <Content className="app-content loading-content">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>加载中...</p>
                    </div>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout className="app-layout">
            <Content className="app-content">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            user ? <Navigate to="/chat" replace /> : <Login />
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            user ? <Navigate to="/chat" replace /> : <Register />
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            user ? (
                                <WebSocketProvider>
                                    <ChatRoom />
                                </WebSocketProvider>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <Navigate to={user ? "/chat" : "/login"} replace />
                        }
                    />
                </Routes>
            </Content>
        </Layout>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
