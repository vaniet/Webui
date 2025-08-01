import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
    const [seriesList, setSeriesList] = useState([]);
    const [filteredSeriesList, setFilteredSeriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSeries() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('http://localhost:7001/series/all');
                const data = await res.json();
                if (data.code === 200) {
                    const series = data.data || [];
                    setSeriesList(series);
                    setFilteredSeriesList(series);
                } else {
                    setError(data.message || '获取系列失败');
                }
            } catch (err) {
                setError('网络错误，无法获取系列');
            } finally {
                setLoading(false);
            }
        }
        fetchSeries();
    }, []);

    // 本地搜索过滤功能
    const handleSearch = (value) => {
        setSearchTerm(value);

        if (!value.trim()) {
            setFilteredSeriesList(seriesList);
            return;
        }

        // 本地过滤系列
        const filtered = seriesList.filter(series =>
            series.name.toLowerCase().includes(value.toLowerCase()) ||
            series.description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSeriesList(filtered);
    };

    // 键盘事件处理
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && searchTerm) {
            clearSearch();
        }
    };

    // 清空搜索
    const clearSearch = () => {
        setSearchTerm('');
        setFilteredSeriesList(seriesList);
    };

    return (
        <div className="main-page-container" style={{ paddingTop: '20px' }}>
            <h1 style={{ color: '#692748', marginBottom: 32 }}>在售系列</h1>

            {/* 搜索框 */}
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    position: 'relative',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    <input
                        type="text"
                        placeholder="搜索系列名称..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 60px',
                            paddingRight: searchTerm ? '44px' : '16px',
                            border: '2px solid #e8e8e8',
                            borderRadius: '25px',
                            fontSize: '16px',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#692748';
                            e.target.style.boxShadow = '0 0 0 3px rgba(105, 39, 72, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e8e8e8';
                            e.target.style.boxShadow = 'none';
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                fontSize: '18px',
                                color: '#999',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f0f0f0';
                                e.target.style.color = '#666';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#999';
                            }}
                        >
                            ✕
                        </button>
                    )}
                    <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#999',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        搜索 |
                    </div>
                </div>
            </div>

            {loading && <div>加载中...</div>}
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

            {/* 搜索状态提示 */}
            {!loading && !error && searchTerm && (
                <div style={{
                    textAlign: 'center',
                    marginBottom: 16,
                    color: '#666',
                    fontSize: '14px'
                }}>
                    找到 {filteredSeriesList.length} 个系列
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {filteredSeriesList.length > 0 ? (
                    filteredSeriesList.map(series => {
                        const imageUrl = `http://localhost:7001/${series.cover}`;
                        return (
                            <div
                                key={series.id}
                                className="series-card"
                                onClick={() => navigate(`/series/${series.id}`)}
                            >
                                <div className="series-card-image">
                                    <img src={imageUrl} alt={series.name} />
                                </div>
                                <div className="series-card-content">
                                    <div className="series-card-title">{series.name}</div>
                                    <div className="series-card-description">{series.description}</div>
                                </div>
                            </div>
                        );
                    })
                ) : !loading && !error && searchTerm ? (
                    <div style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#999'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>未找到相关系列</div>
                        <div style={{ fontSize: '14px', color: '#ccc' }}>
                            尝试使用其他关键词搜索
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}