import React, { useState, useEffect } from 'react';
import './PlayerShowDetail.css';

const PlayerShowDetail = ({ isOpen, onClose, showcaseId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showcase, setShowcase] = useState(null);

    useEffect(() => {
        if (isOpen && showcaseId) {
            fetchShowcaseDetail();
        }
    }, [isOpen, showcaseId]);

    const fetchShowcaseDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:7001/player-shows/${showcaseId}`);
            const data = await res.json();

            if (data.code === 200) {
                setShowcase(data.data);
            } else {
                setError(data.message || '获取玩家秀详情失败');
            }
        } catch (err) {
            setError('网络错误，无法获取玩家秀详情');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString();
        }
    };



    if (!isOpen) return null;

    return (
        <>
            {/* 遮罩层 */}
            <div
                className="modal-overlay"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                {/* 弹窗内容 */}
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}
                >
                    {/* 关闭按钮 */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: 'white',
                            zIndex: 1001,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1'
                        }}
                    >
                        ×
                    </button>

                    {loading && (
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid #e8e8e8',
                                borderTop: '4px solid #692748',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 16px'
                            }}></div>
                            加载中...
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: '#ff4d4f',
                            fontSize: '16px'
                        }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && showcase && (
                        <div>
                            {/* 用户信息 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '24px 24px 16px 24px',
                                borderBottom: '1px solid #f0f0f0'
                            }}>
                                <img
                                    src={`http://localhost:7001/${showcase.user.avatar}`}
                                    alt={showcase.user.username}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        marginRight: '12px'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/48x48/692748/ffffff?text=U';
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                                        {showcase.user.username}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#999', marginTop: '2px' }}>
                                        {formatTime(showcase.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* 系列信息 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px 24px',
                                background: '#f8f9fa',
                                margin: '0 24px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#666'
                            }}>
                                <img
                                    src={`http://localhost:7001/${showcase.series.cover}`}
                                    alt={showcase.series.name}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        marginRight: '8px',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/24x24/692748/ffffff?text=S';
                                    }}
                                />
                                {showcase.series.name}
                            </div>

                            {/* 标题 */}
                            <div style={{
                                padding: '20px 24px 16px 24px',
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#333',
                                lineHeight: '1.4'
                            }}>
                                {showcase.title}
                            </div>

                            {/* 内容 */}
                            {showcase.content && (
                                <div style={{
                                    padding: '0 24px 20px 24px',
                                    fontSize: '16px',
                                    color: '#666',
                                    lineHeight: '1.6'
                                }}>
                                    {showcase.content}
                                </div>
                            )}

                            {/* 图片展示 */}
                            {showcase.images && showcase.images.length > 0 && (
                                <div style={{ padding: '0 24px 24px 24px' }}>
                                    {/* 图片网格 */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        {showcase.images.map((image, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    aspectRatio: '4/3',
                                                    background: '#f8f9fa'
                                                }}
                                            >
                                                <img
                                                    src={`http://localhost:7001/${image}`}
                                                    alt={`图片 ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default PlayerShowDetail; 