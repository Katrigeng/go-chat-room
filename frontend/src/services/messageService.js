import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1'
    : 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const messageService = {
    // 获取历史消息
    getMessages: async () => {
        try {
            const response = await api.get('/messages');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '获取消息失败');
        }
    },

    // 分页获取消息
    getMessagesWithPagination: async (page = 1, limit = 20) => {
        try {
            const response = await api.get(`/messages/paginated?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '获取消息失败');
        }
    },

    // 获取在线用户
    getOnlineUsers: async () => {
        try {
            const response = await api.get('/users/online');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '获取在线用户失败');
        }
    },
};

export default messageService;
