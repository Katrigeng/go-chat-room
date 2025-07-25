import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api/v1'
    : 'http://localhost:8080/api/v1';

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器 - 添加授权头
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

// 响应拦截器 - 处理错误
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const authService = {
    // 用户注册
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '注册失败');
        }
    },

    // 用户登录
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '登录失败');
        }
    },

    // 获取用户信息
    getProfile: async () => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '获取用户信息失败');
        }
    },

    // 更新用户信息
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/user/profile', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || '更新用户信息失败');
        }
    },

    // 用户登出
    logout: async () => {
        try {
            await api.post('/user/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
        }
    },
};

export default authService;
