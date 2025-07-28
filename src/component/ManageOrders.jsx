import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import './ManageOrders.css';

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

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const { user } = useUser();
    const navigate = useNavigate();

    // 检查用户权限
    useEffect(() => {
        if (!user || user.role !== 'manager') {
            setError('权限不足，只有管理员可以访问此页面');
            return;
        }
        fetchOrders();
    }, [user, selectedStatus, currentPage]);

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

            let url = `http://localhost:7001/purchase/all?page=${currentPage}&limit=10`;
            if (selectedStatus !== 'all') {
                url += `&shippingStatus=${selectedStatus}`;
            }

            const res = await fetch(url, {
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
                const purchaseIds = data.data.purchaseIds || [];
                const total = data.data.total || 0;
                setTotalOrders(total);
                setTotalPages(Math.ceil(total / 10));

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
            setMsg('网络错误，获取订单详情失败');
        } finally {
            setDetailLoading(false);
        }
    };

    // 打开详情弹窗
    const openDetailModal = async (order) => {
        setShowDetailModal(true);
        await fetchOrderDetail(order.id);
    };

    // 关闭详情弹窗
    const closeDetailModal = () => {
        setShowDetailModal(false);
        setOrderDetail(null);
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
            'pending': '#faad14',
            'shipped': '#1890ff',
            'delivered': '#52c41a',
            'cancelled': '#ff4d4f'
        };
        return colorMap[status] || '#666';
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

    // 状态筛选按钮
    const statusFilters = [
        { key: 'all', label: '全部' },
        { key: 'pending', label: '待发货' },
        { key: 'shipped', label: '已发货' },
        { key: 'delivered', label: '已收货' },
        { key: 'cancelled', label: '已取消' }
    ];

    if (!user || user.role !== 'manager') {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{error || '权限不足，只有管理员可以访问此页面'}</div>
            </div>
        );
    }

    return (
        <>
            <TopMessage message={msg} type={msgType} onClose={() => setMsg('')} />
            <div className="manage-orders-container">
                <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#692748', fontSize: '28px', fontWeight: '600' }}>
                    订单管理
                </h1>

                {/* 状态筛选 */}
                <div className="manage-status-filter">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.key}
                            className={`manage-status-filter-btn ${selectedStatus === filter.key ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedStatus(filter.key);
                                setCurrentPage(1);
                            }}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* 订单统计 */}
                <div style={{ textAlign: 'center', marginBottom: '24px', color: '#666' }}>
                    共 {totalOrders} 个订单
                </div>

                {/* 订单列表 */}
                <div className="manage-orders-container">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">加载中...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <div className="error-text">{error}</div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="manage-no-orders">
                            <div className="manage-no-orders-icon">📦</div>
                            <div className="manage-no-orders-text">暂无订单</div>
                        </div>
                    ) : (
                        <div className="manage-orders-grid">
                            {orders.map(order => (
                                <div key={order.id} className="manage-order-card" onClick={() => openDetailModal(order)}>
                                    <div className="manage-order-header">
                                        <div className="manage-order-id">订单号: {order.id}</div>
                                        <div className="manage-order-status" style={{ color: getStatusColor(order.shippingStatus) }}>
                                            {getStatusDisplayName(order.shippingStatus)}
                                        </div>
                                    </div>
                                    <div className="manage-order-content">
                                        <div className="manage-order-images">
                                            <div className="manage-series-image">
                                                <img src={`http://localhost:7001/${order.seriesCover}`} alt={order.seriesName} />
                                            </div>
                                            <div className="manage-style-image">
                                                <img src={`http://localhost:7001/${order.styleCover}`} alt={order.styleName} />
                                            </div>
                                        </div>
                                        <div className="manage-order-info">
                                            <div className="manage-series-name">{order.seriesName}</div>
                                            <div className="manage-style-name">{order.styleName}</div>
                                            {order.isHidden && <div className="manage-hidden-badge">隐藏款</div>}
                                            <div className="manage-purchase-time">购买时间: {formatDate(order.createdAt)}</div>
                                            <div className="manage-user-id">用户ID: {order.userId}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                    <div className="manage-pagination">
                        <button
                            className="manage-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            上一页
                        </button>
                        <span className="manage-pagination-info">
                            第 {currentPage} 页，共 {totalPages} 页
                        </span>
                        <button
                            className="manage-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            下一页
                        </button>
                    </div>
                )}
            </div>

            {/* 详情弹窗 */}
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
                                    <div className="loading-text">加载中...</div>
                                </div>
                            ) : orderDetail ? (
                                <div className="order-detail-content">
                                    {/* 订单基本信息 */}
                                    <div className="detail-section">
                                        <h4 className="detail-section-title">订单信息</h4>
                                        <div className="detail-info-grid">
                                            <div className="detail-info-item">
                                                <span className="detail-label">订单号:</span>
                                                <span className="detail-value">{orderDetail.id}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">用户ID:</span>
                                                <span className="detail-value">{orderDetail.userId}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">购买时间:</span>
                                                <span className="detail-value">{formatDate(orderDetail.createdAt)}</span>
                                            </div>
                                            <div className="detail-info-item">
                                                <span className="detail-label">订单状态:</span>
                                                <span className="status-badge" style={{ color: getStatusColor(orderDetail.shippingStatus) }}>
                                                    {getStatusDisplayName(orderDetail.shippingStatus)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 商品信息 */}
                                    <div className="detail-section">
                                        <h4 className="detail-section-title">商品信息</h4>
                                        <div className="product-detail">
                                            <div className="product-images">
                                                <div className="product-series-image">
                                                    <img src={`http://localhost:7001/${orderDetail.seriesCover}`} alt={orderDetail.seriesName} />
                                                </div>
                                                <div className="product-style-image">
                                                    <img src={`http://localhost:7001/${orderDetail.styleCover}`} alt={orderDetail.styleName} />
                                                </div>
                                            </div>
                                            <div className="product-info">
                                                <div className="product-series-name">{orderDetail.seriesName}</div>
                                                <div className="product-style-name">{orderDetail.styleName}</div>
                                                <div className="product-description">{orderDetail.styleDescription}</div>
                                                {orderDetail.isHidden && <div className="detail-hidden-badge">隐藏款</div>}
                                            </div>
                                        </div>
                                    </div>

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

                                    {/* 物流信息 */}
                                    {orderDetail.shippingStatus !== 'pending' && orderDetail.shippingStatus !== 'cancelled' && (
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

export default ManageOrders; 