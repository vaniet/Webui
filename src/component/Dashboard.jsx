import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function TopMessage({ message, type, onClose }) {
    React.useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;
    return (
        <div className={`top-message top-message-${type}`}>{message}</div>
    );
}

const Dashboard = () => {
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');
    const navigate = useNavigate();
    const { user, loading, error, logout, refreshUser } = useUser();



    // 格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return '未知';
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 获取角色显示名称
    const getRoleDisplayName = (role) => {
        const roleMap = {
            'customer': '普通用户',
            'manager': '管理员'
        };
        return roleMap[role] || role;
    };

    if (loading) return (
        <div className="main-container">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">加载中...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="main-container">
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{error}</div>
            </div>
        </div>
    );

    if (!user) return null;

    return (
        <>
            <TopMessage message={msg} type={msgType} onClose={() => setMsg('')} />
            <div className="fullscreen-gradient-bg" style={{ padding: '20px', paddingTop: '80px', height: 'auto', overflow: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginBottom: '20px' }}>


                    <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#692748' }}>个人信息</h1>

                    {user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* 头像和基本信息 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                padding: '24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                color: 'white'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '32px',
                                    fontWeight: 'bold'
                                }}>
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="头像"
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>{user.username}</h2>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '20px',
                                        fontSize: '14px'
                                    }}>
                                        {getRoleDisplayName(user.role)}
                                    </div>
                                </div>
                            </div>

                            {/* 详细信息 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                {/* 基本信息卡片 */}
                                <div style={{
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    background: '#fafafa'
                                }}>
                                    <h3 style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>
                                        基本信息
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>用户ID:</span>
                                            <span style={{ color: '#333', fontWeight: '500' }}>{user.userId}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>用户名:</span>
                                            <span style={{ color: '#333', fontWeight: '500' }}>{user.username}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>用户角色:</span>
                                            <span style={{
                                                color: '#1890ff',
                                                fontWeight: '500',
                                                padding: '2px 8px',
                                                background: '#e6f7ff',
                                                borderRadius: '4px'
                                            }}>
                                                {getRoleDisplayName(user.role)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>手机号码:</span>
                                            <span style={{ color: '#333', fontWeight: '500' }}>
                                                {user.phone || '未设置'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 时间信息卡片 */}
                                <div style={{
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    background: '#fafafa'
                                }}>
                                    <h3 style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', borderBottom: '2px solid #52c41a', paddingBottom: '8px' }}>
                                        时间信息
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>注册时间:</span>
                                            <span style={{ color: '#333', fontWeight: '500', fontSize: '13px' }}>
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>最后更新:</span>
                                            <span style={{ color: '#333', fontWeight: '500', fontSize: '13px' }}>
                                                {formatDate(user.updatedAt)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#666', fontSize: '14px' }}>账号状态:</span>
                                            <span style={{
                                                color: '#52c41a',
                                                fontWeight: '500',
                                                padding: '2px 8px',
                                                background: '#f6ffed',
                                                borderRadius: '4px'
                                            }}>
                                                正常
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 操作按钮 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '16px',
                                paddingTop: '20px',
                                borderTop: '1px solid #e8e8e8'
                            }}>
                                <button
                                    onClick={() => {
                                        setMsgType('info');
                                        setMsg('功能开发中...');
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #1890ff',
                                        borderRadius: '6px',
                                        background: 'white',
                                        color: '#1890ff',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    编辑信息
                                </button>
                                <button
                                    onClick={() => {
                                        setMsgType('info');
                                        setMsg('功能开发中...');
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #52c41a',
                                        borderRadius: '6px',
                                        background: 'white',
                                        color: '#52c41a',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    修改密码
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('确定要退出登录吗？')) {
                                            logout();
                                            setMsgType('success');
                                            setMsg('退出登录成功');
                                            setTimeout(() => navigate('/login'), 1500);
                                        }
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #ff4d4f',
                                        borderRadius: '6px',
                                        background: 'white',
                                        color: '#ff4d4f',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    退出登录
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px', padding: '40px' }}>
                            暂无用户信息
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
