import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useEffect } from 'react';

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
    const [orderStats, setOrderStats] = useState(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [orderError, setOrderError] = useState('');
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

    // 获取订单统计信息
    useEffect(() => {
        const fetchOrderStats = async () => {
            setOrderLoading(true);
            setOrderError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setOrderError('请先登录');
                    setOrderLoading(false);
                    return;
                }
                const res = await fetch('http://localhost:7001/purchase/stats/my', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (res.status === 401) {
                    setOrderError('登录已过期，请重新登录');
                    setOrderLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.code === 200) {
                    setOrderStats(data.data);
                } else {
                    setOrderError(data.message || '获取订单信息失败');
                }
            } catch (err) {
                setOrderError('网络错误，无法获取订单信息');
            } finally {
                setOrderLoading(false);
            }
        };
        fetchOrderStats();
    }, []);

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
                <div style={{ maxWidth: '800px', margin: '0 auto 80px auto', background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>


                    <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#692748' }}>个人信息</h1>

                    {user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* 头像、基本信息和时间信息合并卡片 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '24px',
                                padding: '24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                color: 'white',
                                flexWrap: 'wrap',
                                alignItems: 'stretch'
                            }}>
                                {/* 头像 */}
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    {user.avatar ? (
                                        <img
                                            src={`http://localhost:7001/${user.avatar}`}
                                            alt="头像"
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                {/* 基本信息（左侧） */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                                    <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>{user.username}</h2>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        marginBottom: '8px',
                                        width: 'fit-content'
                                    }}>
                                        {getRoleDisplayName(user.role)}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                        <div style={{ color: '#fff', fontSize: '14px' }}>用户ID: <span style={{ color: '#fff', fontWeight: '500' }}>{user.userId}</span></div>
                                        <div style={{ color: '#fff', fontSize: '14px' }}>手机号码: <span style={{ color: '#fff', fontWeight: '500' }}>{user.phone || '未设置'}</span></div>
                                    </div>
                                </div>
                                {/* 时间信息（右侧红框区域） */}
                                <div style={{
                                    minWidth: '180px',
                                    maxWidth: '220px',
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    padding: '18px 20px',
                                    marginLeft: 'auto',
                                    boxSizing: 'border-box',
                                    border: '1.5px solid rgba(255,255,255,0.18)'
                                }}>
                                    <div style={{ color: '#fff', fontSize: '14px', marginBottom: '10px' }}>注册时间: <span style={{ color: '#fff', fontWeight: '500', fontSize: '13px' }}>{formatDate(user.createdAt)}</span></div>
                                    <div style={{ color: '#fff', fontSize: '14px', marginBottom: '10px' }}>最后更新: <span style={{ color: '#fff', fontWeight: '500', fontSize: '13px' }}>{formatDate(user.updatedAt)}</span></div>

                                </div>
                            </div>
                            {/* 订单统计信息卡片 */}
                            <div
                                style={{
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    background: '#fafafa',
                                    minHeight: '120px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                    boxShadow: '0 2px 8px rgba(255,182,0,0.05)'
                                }}
                                onClick={() => navigate('/orders')}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,182,0,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,182,0,0.05)'}
                            >
                                <h3 style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', borderBottom: '2px solid #ffb600', paddingBottom: '8px' }}>
                                    订单统计
                                </h3>
                                {orderLoading ? (
                                    <div style={{ color: '#999' }}>加载中...</div>
                                ) : orderError ? (
                                    <div style={{ color: 'red' }}>{orderError}</div>
                                ) : orderStats ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '15px' }}>
                                        <div>全部订单：<span style={{ color: '#ffb600', fontWeight: 'bold' }}>{orderStats.total}</span></div>
                                        <div>待发货：<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{orderStats.pending}</span></div>
                                        <div>已发货：<span style={{ color: '#52c41a', fontWeight: 'bold' }}>{orderStats.shipped}</span></div>
                                        <div>已收货：<span style={{ color: '#764ba2', fontWeight: 'bold' }}>{orderStats.delivered}</span></div>
                                    </div>
                                ) : (
                                    <div style={{ color: '#999' }}>暂无订单数据</div>
                                )}
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
