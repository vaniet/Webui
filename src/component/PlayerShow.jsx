import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlayerShow.css';

export default function PlayerShow() {
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchShowcases();
    }, [currentPage]);

    const fetchShowcases = async () => {
        setLoading(true);
        setError('');
        try {
            const url = `http://localhost:7001/player-shows/list?page=${currentPage}&limit=10&orderBy=createdAt&orderDirection=DESC`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.code === 200) {
                setShowcases(data.data.list || []);
                setTotal(data.data.total || 0);
            } else {
                setError(data.message || '获取玩家秀失败');
            }
        } catch (err) {
            setError('网络错误，无法获取玩家秀');
        } finally {
            setLoading(false);
        }
    };

    const handleShareClick = () => {
        // 这里可以跳转到分享页面或打开分享弹窗
        console.log('分享我的收获');
    };

    const handleCardClick = (showcaseId) => {
        // 这里可以跳转到玩家秀详情页面
        console.log('查看玩家秀详情:', showcaseId);
    };

    return (
        <div className="player-show-container">
            <div className="player-show-content">
                <div className="player-show-header">
                    <h1 className="player-show-title">🎉 玩家秀</h1>
                    <div className="player-show-subtitle">
                        分享你的盲盒收获，展示你的收藏成果
                    </div>
                </div>

                {loading && (
                    <div className="player-show-loading">
                        <div className="player-show-spinner"></div>
                        加载中...
                    </div>
                )}

                {error && (
                    <div className="player-show-error">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="player-show-grid">
                        {showcases.map(showcase => (
                            <div
                                key={showcase.id}
                                className="player-show-card"
                                onClick={() => handleCardClick(showcase.id)}
                            >
                                {/* 用户信息 */}
                                <div className="player-show-user">
                                    <img
                                        src={`http://localhost:7001/${showcase.user.avatar}`}
                                        alt={showcase.user.username}
                                        className="player-show-avatar"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/48x48/692748/ffffff?text=U';
                                        }}
                                    />
                                    <div className="player-show-user-info">
                                        <div className="player-show-username">
                                            {showcase.user.username}
                                        </div>
                                    </div>
                                </div>

                                {/* 标题 */}
                                <div className="player-show-title-text">
                                    {showcase.title}
                                </div>

                                {/* 图片展示 */}
                                <div className="player-show-image-container">
                                    {showcase.firstImage ? (
                                        <img
                                            src={`http://localhost:7001/${showcase.firstImage}`}
                                            alt={showcase.title}
                                            className="player-show-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="player-show-image-placeholder"
                                        style={{ display: showcase.firstImage ? 'none' : 'flex' }}
                                    >
                                        暂无图片
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="player-show-actions">
                                    <button
                                        className="player-show-share-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShareClick();
                                        }}
                                    >
                                        <span>🎁</span>
                                        分享我的收获
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && showcases.length === 0 && (
                    <div className="player-show-empty">
                        <div className="player-show-empty-icon">🎁</div>
                        <div className="player-show-empty-title">还没有玩家秀</div>
                        <div className="player-show-empty-subtitle">
                            成为第一个分享的玩家吧！
                        </div>
                    </div>
                )}

                {/* 分页信息 */}
                {!loading && !error && total > 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '32px',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        共 {total} 条玩家秀
                    </div>
                )}
            </div>
        </div>
    );
}
