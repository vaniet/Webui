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
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [shippingForm, setShippingForm] = useState({
        trackingNumber: '',
        shippedAt: new Date().toISOString().slice(0, 16) // 当前时间，格式为 YYYY-MM-DDTHH:mm
    });
    const [shippingLoading, setShippingLoading] = useState(false);
    const [deliveryLoading, setDeliveryLoading] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
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

    // 显示确认弹窗
    const showConfirm = (action, message) => {
        setConfirmAction(() => action);
        setConfirmMessage(message);
        setShowConfirmModal(true);
    };

    // 确认操作
    const handleConfirm = async () => {
        if (confirmAction && typeof confirmAction === 'function') {
            await confirmAction();
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmMessage('');
    };

    // 取消确认
    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmMessage('');
    };

    // 选择/取消选择订单
    const toggleOrderSelection = (orderId) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
        if (selectedOrders.size === orders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map(order => order.id)));
        }
    };

    // 打开发货弹窗
    const openShippingModal = () => {
        setShowShippingModal(true);
    };

    // 关闭发货弹窗
    const closeShippingModal = () => {
        setShowShippingModal(false);
        setShippingForm({
            trackingNumber: '',
            shippedAt: new Date().toISOString().slice(0, 16)
        });
    };

    // 处理发货表单变化
    const handleShippingFormChange = (field, value) => {
        setShippingForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 批量发货
    const batchShipping = async () => {
        if (selectedOrders.size === 0) {
            setMsgType('error');
            setMsg('请先选择要发货的订单');
            return;
        }

        setShippingLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMsgType('error');
                setMsg('请先登录');
                return;
            }

            const requestBody = {
                ids: Array.from(selectedOrders)
            };

            // 只有当用户填写了运单号时才添加到请求体
            if (shippingForm.trackingNumber.trim()) {
                requestBody.trackingNumber = shippingForm.trackingNumber.trim();
            }

            // 只有当用户修改了发货时间时才添加到请求体
            if (shippingForm.shippedAt) {
                requestBody.shippedAt = new Date(shippingForm.shippedAt).toISOString();
            }

            const res = await fetch('http://localhost:7001/purchase/batch-shipping', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (res.status === 401) {
                setMsgType('error');
                setMsg('登录已过期，请重新登录');
                return;
            }

            const data = await res.json();
            if (data.code === 200) {
                const { success, failed, errors } = data.data;
                let message = `批量发货完成：成功${success}个，失败${failed}个`;

                if (failed > 0 && errors && errors.length > 0) {
                    message += `\n失败原因：${errors.join('; ')}`;
                }

                setMsgType(success > 0 ? 'success' : 'error');
                setMsg(message);

                if (success > 0) {
                    closeShippingModal();
                    setSelectedOrders(new Set());
                    fetchOrders(); // 刷新订单列表
                }
            } else {
                setMsgType('error');
                setMsg(data.message || '批量发货失败');
            }
        } catch (err) {
            setMsgType('error');
            setMsg('网络错误，批量发货失败');
        } finally {
            setShippingLoading(false);
        }
    };

    // 批量收货
    const batchConfirmDelivery = async () => {
        if (selectedOrders.size === 0) {
            setMsgType('error');
            setMsg('请先选择要确认收货的订单');
            return;
        }

        setDeliveryLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMsgType('error');
                setMsg('请先登录');
                return;
            }

            const promises = Array.from(selectedOrders).map(async (orderId) => {
                try {
                    const res = await fetch(`http://localhost:7001/purchase/confirm-delivery/${orderId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (res.status === 401) {
                        throw new Error('登录已过期');
                    }

                    const data = await res.json();
                    if (data.code === 200) {
                        return { orderId, success: true };
                    } else {
                        return { orderId, success: false, error: data.message };
                    }
                } catch (err) {
                    return { orderId, success: false, error: err.message };
                }
            });

            const results = await Promise.all(promises);
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                setMsgType('success');
                setMsg(`成功确认收货 ${successCount} 个订单${failCount > 0 ? `，${failCount} 个失败` : ''}`);
                setSelectedOrders(new Set());
                fetchOrders(); // 刷新订单列表
            } else {
                setMsgType('error');
                setMsg('确认收货失败');
            }
        } catch (err) {
            setMsgType('error');
            setMsg('网络错误，确认收货失败');
        } finally {
            setDeliveryLoading(false);
        }
    };







    // 获取状态显示名称
    const getStatusDisplayName = (status) => {
        const statusMap = {
            'pending': '待发货',
            'shipped': '已发货',
            'delivered': '已收货'
        };
        return statusMap[status] || status;
    };

    // 获取状态颜色
    const getStatusColor = (status) => {
        const colorMap = {
            'pending': '#faad14',
            'shipped': '#1890ff',
            'delivered': '#52c41a'
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
        { key: 'delivered', label: '已收货' }
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
                                // 切换到其他状态时清空选中的订单
                                if (filter.key !== 'pending' && filter.key !== 'shipped') {
                                    setSelectedOrders(new Set());
                                }
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

                {/* 批量操作 - 在待发货和已发货状态下显示 */}
                {((selectedStatus === 'pending' || selectedStatus === 'shipped') && orders.length > 0) && (
                    <div className="manage-batch-actions">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="manage-select-all">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.size === orders.length && orders.length > 0}
                                    onChange={toggleSelectAll}
                                    id="select-all"
                                />
                                <label htmlFor="select-all">全选</label>
                            </div>
                            <span className="manage-selection-count">
                                已选择 {selectedOrders.size} 个订单
                            </span>
                        </div>
                        {selectedOrders.size > 0 && (
                            <div className="manage-batch-buttons">
                                {selectedStatus === 'pending' && (
                                    <button className="manage-batch-shipping-btn" onClick={openShippingModal}>
                                        批量发货 ({selectedOrders.size})
                                    </button>
                                )}
                                {selectedStatus === 'shipped' && (
                                    <button
                                        className="manage-batch-delivery-btn"
                                        onClick={batchConfirmDelivery}
                                        disabled={deliveryLoading}
                                    >
                                        {deliveryLoading ? '确认中...' : `批量收货 (${selectedOrders.size})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

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
                                <div key={order.id} className={`manage-order-card ${selectedOrders.has(order.id) ? 'selected' : ''}`}>
                                    <div className="manage-order-header">
                                        {(selectedStatus === 'pending' || selectedStatus === 'shipped') && (
                                            <div className="manage-order-selection">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.has(order.id)}
                                                    onChange={() => toggleOrderSelection(order.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        )}
                                        <div className="manage-order-id">订单号: {order.id}</div>
                                        <div className="manage-order-status" style={{ color: getStatusColor(order.shippingStatus) }}>
                                            {getStatusDisplayName(order.shippingStatus)}
                                        </div>
                                    </div>
                                    <div className="manage-order-content">
                                        <div className="manage-order-left">
                                            <div className="manage-order-images">
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

                                        {/* 已发货订单的额外信息 - 右侧显示 */}
                                        {order.shippingStatus === 'shipped' && (
                                            <div className="manage-shipping-info-right">
                                                {order.receiverName && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收件人:</span>
                                                        <span className="manage-shipping-value">{order.receiverName}</span>
                                                    </div>
                                                )}
                                                {order.receiverPhone && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收货手机:</span>
                                                        <span className="manage-shipping-value">{order.receiverPhone}</span>
                                                    </div>
                                                )}
                                                {order.shippingAddress && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收货地址:</span>
                                                        <span className="manage-shipping-value">{order.shippingAddress}</span>
                                                    </div>
                                                )}
                                                {order.trackingNumber && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">运单号:</span>
                                                        <span className="manage-shipping-value">{order.trackingNumber}</span>
                                                    </div>
                                                )}
                                                {order.shippedAt && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">发货时间:</span>
                                                        <span className="manage-shipping-value">{formatDate(order.shippedAt)}</span>
                                                    </div>
                                                )}
                                                {/* 如果没有任何物流信息，显示提示 */}
                                                {!order.receiverName && !order.receiverPhone && !order.shippingAddress && !order.trackingNumber && !order.shippedAt && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-value" style={{ color: '#999', fontStyle: 'italic' }}>
                                                            暂无物流信息
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 已收货订单的额外信息 - 右侧显示 */}
                                        {order.shippingStatus === 'delivered' && (
                                            <div className="manage-shipping-info-right" style={{ borderLeftColor: '#52c41a' }}>
                                                {order.receiverName && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收件人:</span>
                                                        <span className="manage-shipping-value">{order.receiverName}</span>
                                                    </div>
                                                )}
                                                {order.receiverPhone && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收货手机:</span>
                                                        <span className="manage-shipping-value">{order.receiverPhone}</span>
                                                    </div>
                                                )}
                                                {order.shippingAddress && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收货地址:</span>
                                                        <span className="manage-shipping-value">{order.shippingAddress}</span>
                                                    </div>
                                                )}
                                                {order.trackingNumber && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">运单号:</span>
                                                        <span className="manage-shipping-value">{order.trackingNumber}</span>
                                                    </div>
                                                )}
                                                {order.shippedAt && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">发货时间:</span>
                                                        <span className="manage-shipping-value">{formatDate(order.shippedAt)}</span>
                                                    </div>
                                                )}
                                                {order.deliveredAt && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-label">收货时间:</span>
                                                        <span className="manage-shipping-value">{formatDate(order.deliveredAt)}</span>
                                                    </div>
                                                )}
                                                {/* 如果没有任何物流信息，显示提示 */}
                                                {!order.receiverName && !order.receiverPhone && !order.shippingAddress && !order.trackingNumber && !order.shippedAt && !order.deliveredAt && (
                                                    <div className="manage-shipping-item">
                                                        <span className="manage-shipping-value" style={{ color: '#999', fontStyle: 'italic' }}>
                                                            暂无物流信息
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

            {/* 批量发货弹窗 */}
            {showShippingModal && (
                <div className="manage-shipping-modal-overlay" onClick={closeShippingModal}>
                    <div className="manage-shipping-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="manage-shipping-modal-title">批量发货</h3>
                        <div className="manage-shipping-form-group">
                            <label htmlFor="trackingNumber">运单号 (可选):</label>
                            <input
                                type="text"
                                id="trackingNumber"
                                value={shippingForm.trackingNumber}
                                onChange={(e) => handleShippingFormChange('trackingNumber', e.target.value)}
                                placeholder="请输入运单号"
                            />
                        </div>
                        <div className="manage-shipping-form-group">
                            <label htmlFor="shippedAt">发货时间:</label>
                            <input
                                type="datetime-local"
                                id="shippedAt"
                                value={shippingForm.shippedAt}
                                onChange={(e) => handleShippingFormChange('shippedAt', e.target.value)}
                            />
                        </div>
                        <div className="manage-shipping-modal-actions">
                            <button
                                className="manage-shipping-modal-btn manage-shipping-modal-yes"
                                onClick={batchShipping}
                                disabled={shippingLoading}
                            >
                                {shippingLoading ? '发货中...' : '确认发货'}
                            </button>
                            <button
                                className="manage-shipping-modal-btn manage-shipping-modal-no"
                                onClick={closeShippingModal}
                                disabled={shippingLoading}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 确认弹窗 */}
            {showConfirmModal && (
                <div className="confirm-modal-overlay" onClick={handleCancelConfirm}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="confirm-modal-title">确认操作</h3>
                        <p className="confirm-modal-message">{confirmMessage}</p>
                        <div className="confirm-modal-actions">
                            <button className="confirm-modal-btn confirm-modal-yes" onClick={handleConfirm}>是</button>
                            <button className="confirm-modal-btn confirm-modal-no" onClick={handleCancelConfirm}>否</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageOrders; 