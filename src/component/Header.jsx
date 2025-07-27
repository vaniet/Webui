import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 不需要显示Header的页面
    const hideHeaderPages = ['/', '/login', '/register'];
    const shouldHideHeader = hideHeaderPages.includes(location.pathname);

    if (shouldHideHeader) {
        return null;
    }

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
            {/* 左侧 - 首页按钮 */}
            <div>
                <button
                    onClick={() => navigate('/mainpage')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#1890ff',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(24, 144, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                    }}
                >
                    <span style={{ fontSize: '18px' }}>🏠</span>
                    首页
                </button>
            </div>

            {/* 右侧 - 个人信息按钮 */}
            <div>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#52c41a',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(82, 196, 26, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                    }}
                >
                    <span style={{ fontSize: '18px' }}>👤</span>
                    个人信息
                </button>
            </div>
        </header>
    );
};

export default Header; 