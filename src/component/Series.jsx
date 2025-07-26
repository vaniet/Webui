import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Series() {
    const { id } = useParams();
    const [series, setSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchSeries() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`http://localhost:7001/series/${id}`);
                const data = await res.json();
                if (data.code === 200 && data.data) {
                    setSeries(data.data);
                } else {
                    setError(data.message || '获取系列详情失败');
                }
            } catch (err) {
                setError('网络错误，无法获取系列详情');
            } finally {
                setLoading(false);
            }
        }
        fetchSeries();
    }, [id]);

    if (loading) return (
        <div className="series-detail-container">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">加载中...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="series-detail-container">
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{error}</div>
            </div>
        </div>
    );

    if (!series) return null;

    const imageUrl = `http://localhost:7001/${series.cover}`;

    return (
        <>
            <div className="fullscreen-gradient-bg" style={{ padding: '20px', height: 'auto', overflow: 'auto' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '32px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                    {/* 系列头部信息 */}
                    <div className="series-header">
                        <div className="series-title">{series.name}</div>
                        <div className="series-subtitle">{series.description}</div>
                    </div>

                    {/* 系列封面 */}
                    <div className="series-cover-container">
                        <img src={imageUrl} alt={series.name} className="series-cover-image" />
                    </div>

                    {/* 系列细节 */}
                    {series.detail && (
                        <div className="series-detail-section">
                            <h3 className="section-title">系列详情</h3>
                            <div className="series-detail-text">{series.detail}</div>
                        </div>
                    )}

                    {/* 系列款式 */}
                    {series.styles && series.styles.length > 0 && (
                        <div className="series-styles-section">
                            <h3 className="section-title">系列款式</h3>
                            <div className="series-styles-grid">
                                {series.styles.map(style => (
                                    <div key={style.id} className={`style-card ${style.isHidden ? 'hidden-style' : ''}`}>
                                        <div className="style-image-container">
                                            <img src={`http://localhost:7001/${style.cover}`} alt={style.name} className="style-image" />
                                            {style.isHidden && <div className="hidden-badge">隐藏款</div>}
                                        </div>
                                        <div className="style-info">
                                            <div className="style-name">{style.name}</div>
                                            <div className="style-description">{style.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 抽取按钮 */}
                    <div className="series-action-section">
                        <button className="draw-button">
                            <span className="draw-text">开始抽取</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
} 