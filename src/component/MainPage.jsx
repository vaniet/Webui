import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
    const [seriesList, setSeriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSeries() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('http://localhost:7001/series/all');
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
        }
        fetchSeries();
    }, []);

    return (
        <div className="main-page-container" style={{ paddingTop: '20px' }}>
            <h1 style={{ color: '#692748', marginBottom: 32 }}>在售系列</h1>
            {loading && <div>加载中...</div>}
            {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                {seriesList.map(series => {
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
                })}
            </div>
        </div>
    );
}