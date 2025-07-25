import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { message } from 'antd';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

const initialState = {
    socket: null,
    connected: false,
    onlineUsers: [],
    messages: [],
    typingUsers: [],
};

function websocketReducer(state, action) {
    switch (action.type) {
        case 'SET_SOCKET':
            return { ...state, socket: action.payload };
        case 'SET_CONNECTED':
            return { ...state, connected: action.payload };
        case 'SET_ONLINE_USERS':
            return { ...state, onlineUsers: action.payload };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            };
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload };
        case 'ADD_TYPING_USER':
            const typingUsers = state.typingUsers.filter(u => u.id !== action.payload.id);
            return {
                ...state,
                typingUsers: [...typingUsers, action.payload]
            };
        case 'REMOVE_TYPING_USER':
            return {
                ...state,
                typingUsers: state.typingUsers.filter(u => u.id !== action.payload.id)
            };
        case 'CLEAR_TYPING_USERS':
            return { ...state, typingUsers: [] };
        default:
            return state;
    }
}

export function WebSocketProvider({ children }) {
    const [state, dispatch] = useReducer(websocketReducer, initialState);
    const { user, token, logout } = useAuth();

    const connectWebSocket = useCallback(() => {
        if (!token || !user) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:8080';

        const wsUrl = `${protocol}//${host}/api/v1/ws?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket connected');
            dispatch({ type: 'SET_CONNECTED', payload: true });
            message.success('连接成功');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            dispatch({ type: 'SET_CONNECTED', payload: false });

            // 重连逻辑
            setTimeout(() => {
                if (token && user) {
                    connectWebSocket();
                }
            }, 3000);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            message.error('连接失败');
        };

        dispatch({ type: 'SET_SOCKET', payload: socket });

        return socket;
    }, [token, user]);

    const handleWebSocketMessage = useCallback((data) => {
        switch (data.type) {
            case 'new_message':
                dispatch({ type: 'ADD_MESSAGE', payload: data.message });
                break;
            case 'user_online':
                dispatch({ type: 'SET_ONLINE_USERS', payload: data.users || [] });
                message.info(`${data.user?.nickname || data.user?.username} 上线了`);
                break;
            case 'user_offline':
                dispatch({ type: 'SET_ONLINE_USERS', payload: data.users || [] });
                message.info(`${data.user?.nickname || data.user?.username} 离线了`);
                break;
            case 'typing':
                if (data.user?.id !== user?.id) {
                    dispatch({ type: 'ADD_TYPING_USER', payload: data.user });
                    // 5秒后自动清除打字状态
                    setTimeout(() => {
                        dispatch({ type: 'REMOVE_TYPING_USER', payload: data.user });
                    }, 5000);
                }
                break;
            case 'stop_typing':
                dispatch({ type: 'REMOVE_TYPING_USER', payload: data.user });
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }, [user]);

    const sendMessage = useCallback((content) => {
        if (state.socket && state.connected) {
            const message = {
                type: 'chat_message',
                content: content,
            };
            state.socket.send(JSON.stringify(message));
        }
    }, [state.socket, state.connected]);

    const sendTyping = useCallback((isTyping) => {
        if (state.socket && state.connected) {
            const message = {
                type: isTyping ? 'typing' : 'stop_typing',
            };
            state.socket.send(JSON.stringify(message));
        }
    }, [state.socket, state.connected]);

    useEffect(() => {
        let socket = null;

        if (token && user) {
            socket = connectWebSocket();
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [token, user, connectWebSocket]);

    const value = {
        ...state,
        sendMessage,
        sendTyping,
        connectWebSocket,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
