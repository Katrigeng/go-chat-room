import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import App from './App';
import './styles/index.css';

dayjs.locale('zh-cn');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ConfigProvider
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: '#667eea',
                    borderRadius: 8,
                    fontSize: 14,
                },
                components: {
                    Layout: {
                        bodyBg: 'transparent',
                        headerBg: 'rgba(255, 255, 255, 0.95)',
                    },
                    Card: {
                        colorBgContainer: 'rgba(255, 255, 255, 0.95)',
                    },
                },
            }}
        >
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ConfigProvider>
    </React.StrictMode>
);
