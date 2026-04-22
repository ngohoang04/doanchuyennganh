import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelOrder, getOrderById, getOrders, returnOrder } from '../services/shop';

const ORDER_GROUPS = [
    { key: 'pending', label: 'Chờ xác nhận', statuses: ['pending', 'confirmed'] },
    { key: 'shipping', label: 'Đang giao', statuses: ['shipping'] },
    { key: 'completed', label: 'Đã giao', statuses: ['completed'] },
    { key: 'cancelled', label: 'Đã hủy', statuses: ['cancelled'] },
    { key: 'returned', label: 'Đã hoàn', statuses: ['returned'] }
];

const getOrderGroupKey = (order) => {
    const status = String(order?.status || '').toLowerCase();
    const match = ORDER_GROUPS.find((group) => group.statuses.includes(status));
    return match?.key || 'pending';
};

const getOrderStatusLabel = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'pending') return 'Chờ xác nhận';
    if (normalized === 'confirmed') return 'Đã xác nhận';
    if (normalized === 'shipping') return 'Đang giao';
    if (normalized === 'completed') return 'Đã giao';
    if (normalized === 'cancelled') return 'Đã hủy';
    if (normalized === 'returned') return 'Đã hoàn';
    return status || 'Không xác định';
};

const getPaymentStatusLabel = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'pending') return 'Chờ thanh toán';
    if (normalized === 'awaiting_transfer') return 'Chờ chuyển khoản';
    if (normalized === 'paid') return 'Đã thanh toán';
    if (normalized === 'cancelled') return 'Đã hủy';
    if (normalized === 'returned') return 'Đã hoàn tiền';
    return status || 'Không xác định';
};

function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingOrderId, setSubmittingOrderId] = useState(null);
    const [activeGroup, setActiveGroup] = useState('pending');
    const reviewTargetRef = useRef(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getOrders();
            const nextOrders = response.data || [];
            setOrders(nextOrders);
            setError('');

            if (nextOrders.length > 0) {
                const groupsWithData = ORDER_GROUPS.filter((group) =>
                    nextOrders.some((order) => group.statuses.includes(String(order.status || '').toLowerCase()))
                );
                setActiveGroup((currentGroup) => (
                    groupsWithData.length > 0 && !groupsWithData.some((group) => group.key === currentGroup)
                        ? groupsWithData[0].key
                        : currentGroup
                ));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();

        const handleOrdersUpdated = () => {
            fetchOrders();
        };

        window.addEventListener('orders-updated', handleOrdersUpdated);
        return () => window.removeEventListener('orders-updated', handleOrdersUpdated);
    }, [fetchOrders]);

    const groupedOrders = useMemo(() => {
        const result = ORDER_GROUPS.reduce((acc, group) => {
            acc[group.key] = orders.filter((order) => getOrderGroupKey(order) === group.key);
            return acc;
        }, {});
        return result;
    }, [orders]);

    const visibleOrders = groupedOrders[activeGroup] || [];

    const canCancelOrder = (order) => ['pending', 'confirmed'].includes(String(order?.status || '').toLowerCase());
    const canReviewOrder = (order) => String(order?.status || '').toLowerCase() === 'completed';
    const canReturnOrder = (order) => String(order?.status || '').toLowerCase() === 'completed';

    const handleViewDetail = async (orderId) => {
        try {
            setDetailLoading(true);
            const response = await getOrderById(orderId);
            setSelectedOrder(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

        try {
            setSubmittingOrderId(orderId);
            const response = await cancelOrder(orderId);
            const updatedOrder = response.data;

            setOrders((prev) => prev.map((order) => (
                String(order.id) === String(orderId) ? updatedOrder : order
            )));

            if (String(selectedOrder?.id) === String(orderId)) {
                setSelectedOrder(updatedOrder);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể hủy đơn hàng');
        } finally {
            setSubmittingOrderId(null);
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn hoàn hàng này vì sản phẩm bị lỗi?')) return;

        try {
            setSubmittingOrderId(orderId);
            const response = await returnOrder(orderId);
            const updatedOrder = response.data;

            setOrders((prev) => prev.map((order) => (
                String(order.id) === String(orderId) ? updatedOrder : order
            )));

            if (String(selectedOrder?.id) === String(orderId)) {
                setSelectedOrder(updatedOrder);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể hoàn hàng');
        } finally {
            setSubmittingOrderId(null);
        }
    };

    const openReviewForItem = (item, orderId) => {
        if (!item?.productId) return;
        navigate(`/product/${item.productId}`, {
            state: {
                product: item.product,
                focusReview: true,
                fromOrderId: orderId
            }
        });
    };

    const handleOpenReview = (order) => {
        const orderItems = order?.orderItems || [];
        if (!orderItems.length) return;

        if (orderItems.length === 1) {
            openReviewForItem(orderItems[0], order.id);
            return;
        }

        setSelectedOrder(order);
        requestAnimationFrame(() => {
            reviewTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4">Đơn Hàng Của Tôi</h2>

            <div className="d-flex flex-wrap gap-2 mb-4">
                {ORDER_GROUPS.map((group) => (
                    <button
                        key={group.key}
                        type="button"
                        className={`btn ${activeGroup === group.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setActiveGroup(group.key)}
                    >
                        {group.label} ({groupedOrders[group.key]?.length || 0})
                    </button>
                ))}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <p>Đang tải đơn hàng...</p>
            ) : orders.length === 0 ? (
                <div className="alert alert-info">Bạn chưa có đơn hàng nào.</div>
            ) : visibleOrders.length === 0 ? (
                <div className="alert alert-secondary">Chưa có đơn hàng trong mục này.</div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {visibleOrders.map((order) => {
                        const productSubtotal = (order.orderItems || []).reduce(
                            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
                            0
                        );

                        return (
                            <div key={order.id} className="border rounded p-4 bg-white">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 className="mb-1">Đơn hàng #{order.id}</h5>
                                        <p className="text-muted mb-0">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-danger">
                                            {Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND
                                        </div>
                                        <small className="text-muted">
                                            {getOrderStatusLabel(order.status)} / {getPaymentStatusLabel(order.paymentStatus)}
                                        </small>
                                    </div>
                                </div>

                                <p className="mb-3">
                                    <strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || '-'}
                                </p>

                                <div className="d-flex flex-column gap-2">
                                    {(order.orderItems || []).map((item) => (
                                        <div key={item.id} className="d-flex justify-content-between border-top pt-2">
                                            <span>{item.product?.name || `Sản phẩm #${item.productId}`} x {item.quantity}</span>
                                            <strong>
                                                {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('vi-VN')} VND
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-top mt-3 pt-3">
                                    <div className="d-flex justify-content-between text-muted mb-1">
                                        <span>Tạm tính sản phẩm</span>
                                        <span>{productSubtotal.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>Tổng đơn hàng</span>
                                        <span className="text-danger">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND</span>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-3 flex-wrap">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleViewDetail(order.id)}
                                        disabled={detailLoading && String(selectedOrder?.id) !== String(order.id)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {canReviewOrder(order) && (
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => handleOpenReview(order)}
                                        >
                                            Đánh giá sản phẩm
                                        </button>
                                    )}
                                    {canReturnOrder(order) && (
                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => handleReturnOrder(order.id)}
                                            disabled={submittingOrderId === order.id}
                                        >
                                            {submittingOrderId === order.id ? 'Đang xử lý...' : 'Hoàn hàng'}
                                        </button>
                                    )}
                                    {canCancelOrder(order) && (
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleCancelOrder(order.id)}
                                            disabled={submittingOrderId === order.id}
                                        >
                                            {submittingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedOrder && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 1050 }}
                    onClick={() => setSelectedOrder(null)}
                >
                    <div className="container h-100 d-flex align-items-center justify-content-center py-4">
                        <div
                            className="bg-white rounded shadow p-4 w-100"
                            style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
                                <div>
                                    <h4 className="mb-1">Chi tiết đơn hàng #{selectedOrder.id}</h4>
                                    <div className="text-muted">
                                        {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOrder(null)}>
                                    Đóng
                                </button>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted mb-1">Trạng thái đơn hàng</div>
                                        <div className="fw-bold">{getOrderStatusLabel(selectedOrder.status)}</div>
                                        <div className="small text-muted mt-3 mb-1">Thanh toán</div>
                                        <div>{getPaymentStatusLabel(selectedOrder.paymentStatus)}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted mb-1">Địa chỉ giao hàng</div>
                                        <div>{selectedOrder.shippingAddress || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded p-3 mb-4">
                                <h5 className="mb-3">Sản phẩm</h5>
                                <div className="d-flex flex-column gap-3">
                                    {(selectedOrder.orderItems || []).map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="d-flex justify-content-between align-items-start gap-3 border-bottom pb-2"
                                            ref={canReviewOrder(selectedOrder) && index === 0 ? reviewTargetRef : null}
                                        >
                                            <div>
                                                <div className="fw-semibold">{item.product?.name || `Sản phẩm #${item.productId}`}</div>
                                                <div className="text-muted small">
                                                    Số lượng: {item.quantity} | Đơn giá: {Number(item.price || 0).toLocaleString('vi-VN')} VND
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-danger">
                                                    {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('vi-VN')} VND
                                                </div>
                                                {canReviewOrder(selectedOrder) && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-success btn-sm mt-2"
                                                        onClick={() => openReviewForItem(item, selectedOrder.id)}
                                                    >
                                                        Đánh giá
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Tổng thanh toán</div>
                                <div className="fs-5 fw-bold text-danger">
                                    {Number(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')} VND
                                </div>
                            </div>

                            {canCancelOrder(selectedOrder) && (
                                <div className="mt-4">
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                        disabled={submittingOrderId === selectedOrder.id}
                                    >
                                        {submittingOrderId === selectedOrder.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                    </button>
                                </div>
                            )}

                            {canReturnOrder(selectedOrder) && (
                                <div className="mt-4">
                                    <button
                                        className="btn btn-outline-warning"
                                        onClick={() => handleReturnOrder(selectedOrder.id)}
                                        disabled={submittingOrderId === selectedOrder.id}
                                    >
                                        {submittingOrderId === selectedOrder.id ? 'Đang xử lý...' : 'Hoàn hàng'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
