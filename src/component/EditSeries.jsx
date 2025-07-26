import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TopMessage({ message, type, onClose }) {
    React.useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 1800);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;
    return (
        <div className={`top-message top-message-${type}`}>{message}</div>
    );
}

const EditSeries = () => {
    const [seriesList, setSeriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');
    const [expandedSeries, setExpandedSeries] = useState(new Set());
    const navigate = useNavigate();

    // 获取所有系列详情
    const fetchSeriesList = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:7001/series/allWithDetail');
            const data = await res.json();
            if (data.code === 200) {
                setSeriesList(data.data || []);
            } else {
                setError(data.message || '获取系列失败');
            }
        } catch (err) {
            setError('网络错误，无法获取系列');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeriesList();
    }, []);

    // 切换系列展开状态
    const toggleSeriesExpansion = (seriesId) => {
        const newExpanded = new Set(expandedSeries);
        if (newExpanded.has(seriesId)) {
            newExpanded.delete(seriesId);
        } else {
            newExpanded.add(seriesId);
        }
        setExpandedSeries(newExpanded);
    };

    // 删除款式
    const deleteStyle = async (styleId, seriesId) => {
        try {
            const res = await fetch(`http://localhost:7001/series/style/delete/${styleId}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                // 更新本地状态
                setSeriesList(prevList => {
                    const newList = prevList.map(series => {
                        if (series.id === seriesId) {
                            const newStyles = series.styles.filter(style => style.id !== styleId);
                            // 如果没有款式了，标记系列为待删除
                            if (newStyles.length === 0) {
                                return { ...series, styles: newStyles, toDelete: true };
                            }
                            return { ...series, styles: newStyles, styleCount: newStyles.length };
                        }
                        return series;
                    });

                    // 过滤掉待删除的系列
                    return newList.filter(series => !series.toDelete);
                });

                setMsgType('success');
                setMsg('款式删除成功');
            } else {
                throw new Error('删除失败');
            }
        } catch (err) {
            setMsgType('error');
            setMsg('删除款式失败');
        }
    };

    // 删除系列
    const deleteSeries = async (seriesId) => {
        try {
            const res = await fetch(`http://localhost:7001/series/delete/${seriesId}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                // 更新本地状态
                setSeriesList(prevList => prevList.filter(series => series.id !== seriesId));
                setMsgType('success');
                setMsg('系列删除成功');
            } else {
                throw new Error('删除失败');
            }
        } catch (err) {
            setMsgType('error');
            setMsg('删除系列失败');
        }
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

    return (
        <>
            <TopMessage message={msg} type={msgType} onClose={() => setMsg('')} />
            <div className="fullscreen-gradient-bg" style={{ padding: '20px', height: 'auto', overflow: 'auto' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                    {/* 返回主界面按钮 */}
                    <div style={{ marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/mainpage')}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #1890ff',
                                borderRadius: '5px',
                                background: 'white',
                                color: '#1890ff',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            返回主界面
                        </button>
                    </div>

                    <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#692748' }}>系列管理</h1>

                    {seriesList.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px', padding: '40px' }}>
                            暂无系列数据
                        </div>
                    ) : (
                        <div className="series-management-list">
                            {seriesList.map(series => (
                                <div key={series.id} className="series-management-item">
                                    {/* 系列头部 */}
                                    <div className="series-header-row">
                                        <div className="series-info">
                                            <div className="series-cover-small">
                                                <img src={`http://localhost:7001/${series.cover}`} alt={series.name} />
                                            </div>
                                            <div className="series-details">
                                                <h3 className="series-name">{series.name}</h3>
                                                <p className="series-description">{series.description}</p>
                                                <span className="series-count">款式数量: {series.styleCount}</span>
                                            </div>
                                        </div>
                                        <div className="series-actions">
                                            <button
                                                className="expand-button"
                                                onClick={() => toggleSeriesExpansion(series.id)}
                                            >
                                                {expandedSeries.has(series.id) ? '收起' : '展开'}
                                            </button>
                                            <button
                                                className="delete-series-button"
                                                onClick={() => {
                                                    if (window.confirm(`确定要删除系列"${series.name}"吗？这将同时删除所有相关款式。`)) {
                                                        deleteSeries(series.id);
                                                    }
                                                }}
                                            >
                                                删除系列
                                            </button>
                                        </div>
                                    </div>

                                    {/* 展开的款式列表 */}
                                    {expandedSeries.has(series.id) && (
                                        <div className="styles-list">
                                            {series.styles && series.styles.length > 0 ? (
                                                <div className="styles-grid">
                                                    {series.styles.map(style => (
                                                        <div key={style.id} className="style-management-card">
                                                            <div className="style-image-container">
                                                                <img src={`http://localhost:7001/${style.cover}`} alt={style.name} />
                                                                {style.isHidden && <div className="hidden-badge">隐藏款</div>}
                                                            </div>
                                                            <div className="style-info">
                                                                <div className="style-name">{style.name}</div>
                                                                <div className="style-description">{style.description}</div>
                                                                <button
                                                                    className="delete-style-button"
                                                                    onClick={() => {
                                                                        if (window.confirm(`确定要删除款式"${style.name}"吗？`)) {
                                                                            deleteStyle(style.id, series.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    删除款式
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                                    该系列暂无款式
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditSeries;
