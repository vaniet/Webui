import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './OrderDetails.css';

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

const OrderDetails = () => {
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const { user } = useUser();

    // 获取订单列表
    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('请先登录');
                setLoading(false);
                return;
            }

            const res = await fetch('http://localhost:7001/purchase/my-purchases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401) {
                setError('登录已过期，请重新登录');
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (data.code === 200) {
                // 获取订单ID列表
                const purchaseIds = data.data.purchaseIds || [];

                // 为每个订单ID获取详细信息
                const orderPromises = purchaseIds.map(async (orderId) => {
                    try {
                        const detailRes = await fetch(`http://localhost:7001/purchase/${orderId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (detailRes.ok) {
                            const detailData = await detailRes.json();
                            if (detailData.code === 200) {
                                return detailData.data;
                            }
                        }
                        return null;
                    } catch (err) {
                        console.error(`获取订单 ${orderId} 详情失败:`, err);
                        return null;
                    }
                });

                const orderDetails = await Promise.all(orderPromises);
                const validOrders = orderDetails.filter(order => order !== null);
                setOrders(validOrders);
            } else {
                setError(data.message || '获取订单信息失败');
            }
        } catch (err) {
            setError('网络错误，无法获取订单信息');
        } finally {
            setLoading(false);
        }
    };

    // 获取订单详情
    const fetchOrderDetail = async (orderId) => {
        setDetailLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMsgType('error');
                setMsg('请先登录');
                return;
            }

            const res = await fetch(`http://localhost:7001/purchase/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 401) {
                setMsgType('error');
                setMsg('登录已过期，请重新登录');
                return;
            }

            const data = await res.json();
            if (data.code === 200) {
                setOrderDetail(data.data);
            } else {
                setMsgType('error');
                setMsg(data.message || '获取订单详情失败');
            }
        } catch (err) {
            setMsgType('error');
            setMsg('网络错误，无法获取订单详情');
        } finally {
            setDetailLoading(false);
        }
    };

    // 打开详情弹窗
    const openDetailModal = async (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
        await fetchOrderDetail(order.id);
    };

    // 关闭详情弹窗
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedOrder(null);
        setOrderDetail(null);
    };

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

    // 获取状态显示名称
    const getStatusDisplayName = (status) => {
        const statusMap = {
            'pending': '待发货',
            'shipped': '已发货',
            'delivered': '已收货',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    };

    // 获取状态颜色
    const getStatusColor = (status) => {
        const colorMap = {
            'pending': '#ffb600',
            'shipped': '#1890ff',
            'delivered': '#52c41a',
            'cancelled': '#ff4d4f'
        };
        return colorMap[status] || '#666';
    };

    // 筛选订单
    const filteredOrders = orders.filter(order => {
        if (selectedStatus === 'all') return true;
        return order.shippingStatus === selectedStatus;
    });

    // 计算各状态订单数量
    const statusCounts = {
        all: orders.length,
        pending: orders.filter(order => order.shippingStatus === 'pending').length,
        shipped: orders.filter(order => order.shippingStatus === 'shipped').length,
        delivered: orders.filter(order => order.shippingStatus === 'delivered').length,
        cancelled: orders.filter(order => order.shippingStatus === 'cancelled').length
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="order-details-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">加载中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-details-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <div className="error-text">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <TopMessage message={msg} type={msgType} onClose={() => setMsg('')} />
            <div className="fullscreen-gradient-bg" style={{ padding: '20px', paddingTop: '80px', height: 'auto', overflow: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto 80px auto', background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#692748' }}>我的订单</h1>

                    {/* 状态筛选 */}
                    <div className="status-filter">
                        {[
                            { key: 'all', label: '全部' },
                            { key: 'pending', label: '待发货' },
                            { key: 'shipped', label: '已发货' },
                            { key: 'delivered', label: '已收货' },
                            { key: 'cancelled', label: '已取消' }
                        ].map(status => (
                            <button
                                key={status.key}
                                className={`status-filter-btn ${selectedStatus === status.key ? 'active' : ''}`}
                                onClick={() => setSelectedStatus(status.key)}
                            >
                                {status.label} ({statusCounts[status.key]})
                            </button>
                        ))}
                    </div>

                    {/* 订单列表 */}
                    <div className="orders-container">
                        {filteredOrders.length === 0 ? (
                            <div className="no-orders">
                                <div className="no-orders-icon">📦</div>
                                <div className="no-orders-text">暂无订单</div>
                            </div>
                        ) : (
                            <div className="orders-grid">
                                {filteredOrders.map(order => (
                                    <div key={order.id} className="order-card" onClick={() => openDetailModal(order)}>
                                        <div className="order-header">
                                            <div className="order-id">订单 #{order.id}</div>
                                            <div
                                                className="order-status"
                                                style={{ color: getStatusColor(order.shippingStatus) }}
                                            >
                                                {getStatusDisplayName(order.shippingStatus)}
                                            </div>
                                        </div>
                                        <div className="order-content">
                                            <div className="order-images">
                                                <div className="order-style-image">
                                                    <img
                                                        src={`http://localhost:7001/${order.styleCover}`}
                                                        alt={order.styleName}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="fallback-image" style={{ display: 'none' }}>
                                                        {order.styleName?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="order-info">
                                                <div className="style-name">{order.styleName}</div>
                                                {order.isHidden && <div className="hidden-badge">隐藏款</div>}
                                                <div className="purchase-time">购买时间: {formatDate(order.purchasedAt)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 订单详情弹窗 */}
            {showDetailModal && (
                <div className="detail-modal-overlay" onClick={closeDetailModal}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-modal-header">
                            <h3 className="detail-modal-title">订单详情</h3>
                            <button className="close-detail-btn" onClick={closeDetailModal}>×</button>
                        </div>
                        <div className="detail-modal-content">
                            {detailLoading ? (
                                <div className="detail-loading">
                                    <div className="loading-spinner"></div>
                                    <div>加载中...</div>
                                </div>
                            ) : orderDetail ? (
                                <div className="order-detail-content">
                                    {/* 商品信息（上） */}
                                    <div className="detail-section">
                                        <h4 className="detail-section-title">商品信息</h4>
                                        <div className="product-detail">
                                            <div className="product-images">
                                                <div className="product-style-image">
                                                    <img
                                                        src={`http://localhost:7001/${orderDetail.styleCover}`}
                                                        alt={orderDetail.styleName}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="fallback-image" style={{ display: 'none' }}>
                                                        {orderDetail.styleName?.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="product-info">
                                                <div className="product-series-name">{orderDetail.seriesName}</div>
                                                <div className="product-style-name">{orderDetail.styleName}</div>
                                                {orderDetail.isHidden && <div className="hidden-badge">隐藏款</div>}
                                                {orderDetail.style?.description && (
                                                    <div className="product-description">{orderDetail.style.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* 订单信息（下） */}
                                    <div className="detail-section">
                                        <h4 className="detail-section-title">订单信息</h4>
                                        <div className="detail-info-grid">
                                            <div className="detail-info-item">
                                                <span className="detail-label">订单编号:</span>
                                                <span className="detail-value">#{orderDetail.id}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">购买时间:</span>
                                                <span className="detail-value">{formatDate(orderDetail.purchasedAt)}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">订单状态:</span>
                                                <span
                                                    className="detail-value status-badge"
                                                    style={{ color: getStatusColor(orderDetail.shippingStatus) }}
                                                >
                                                    {getStatusDisplayName(orderDetail.shippingStatus)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 物流信息 */}
                                    {orderDetail.shippingStatus !== 'pending' && (
                                        <div className="detail-section">
                                            <h4 className="detail-section-title">物流信息</h4>
                                            <div className="detail-info-grid">
                                                {orderDetail.shippedAt && (
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">发货时间:</span>
                                                        <span className="detail-value">{formatDate(orderDetail.shippedAt)}</span>
                                                    </div>
                                                )}
                                                {orderDetail.deliveredAt && (
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">收货时间:</span>
                                                        <span className="detail-value">{formatDate(orderDetail.deliveredAt)}</span>
                                                    </div>
                                                )}
                                                {orderDetail.trackingNumber && (
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">快递单号:</span>
                                                        <span className="detail-value">{orderDetail.trackingNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* 收货信息 */}
                                    {(orderDetail.shippingAddress || orderDetail.receiverName || orderDetail.receiverPhone) && (
                                        <div className="detail-section">
                                            <h4 className="detail-section-title">收货信息</h4>
                                            <div className="detail-info-grid">
                                                {orderDetail.receiverName && (
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">收货人:</span>
                                                        <span className="detail-value">{orderDetail.receiverName}</span>
                                                    </div>
                                                )}
                                                {orderDetail.receiverPhone && (
                                                    <div className="detail-info-item">
                                                        <span className="detail-label">联系电话:</span>
                                                        <span className="detail-value">{orderDetail.receiverPhone}</span>
                                                    </div>
                                                )}
                                                {orderDetail.shippingAddress && (
                                                    <div className="detail-info-item full-width">
                                                        <span className="detail-label">收货地址:</span>
                                                        <span className="detail-value">{orderDetail.shippingAddress}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="detail-error">获取订单详情失败</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderDetails; 