import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelOrder, getOrderById, getOrders, returnOrder } from '../services/shop';

function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingOrderId, setSubmittingOrderId] = useState(null);
    const reviewTargetRef = useRef(null);

    useEffect(() => {
        fetchOrders();

        const handleOrdersUpdated = () => {
            fetchOrders();
        };

        window.addEventListener('orders-updated', handleOrdersUpdated);
        return () => window.removeEventListener('orders-updated', handleOrdersUpdated);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getOrders();
            setOrders(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the tai don hang');
        } finally {
            setLoading(false);
        }
    };

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
            setError(err.response?.data?.message || 'Khong the tai chi tiet don hang');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Ban co chac muon huy don hang nay?')) return;

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

            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the huy don hang');
        } finally {
            setSubmittingOrderId(null);
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!window.confirm('Ban co chac muon hoan hang nay vi san pham bi loi?')) return;

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

            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the hoan hang');
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
            <h2 className="mb-4">Don hang cua toi</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <p>Dang tai don hang...</p>
            ) : orders.length === 0 ? (
                <div className="alert alert-info">Ban chua co don hang nao.</div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {orders.map((order) => {
                        const productSubtotal = (order.orderItems || []).reduce(
                            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
                            0
                        );

                        return (
                        <div key={order.id} className="border rounded p-4 bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 className="mb-1">Don hang #{order.id}</h5>
                                    <p className="text-muted mb-0">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold text-danger">
                                        {Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND
                                    </div>
                                    <small className="text-muted">
                                        {order.status} / {order.paymentStatus || 'pending'}
                                    </small>
                                </div>
                            </div>

                            <p className="mb-3">
                                <strong>Dia chi giao hang:</strong> {order.shippingAddress || '-'}
                            </p>

                            <div className="d-flex flex-column gap-2">
                                {(order.orderItems || []).map((item) => (
                                    <div key={item.id} className="d-flex justify-content-between border-top pt-2">
                                        <span>{item.product?.name || `San pham #${item.productId}`} x {item.quantity}</span>
                                        <strong>
                                            {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('vi-VN')} VND
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="border-top mt-3 pt-3">
                                <div className="d-flex justify-content-between text-muted mb-1">
                                    <span>Tam tinh san pham</span>
                                    <span>{productSubtotal.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Tong don hang</span>
                                    <span className="text-danger">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND</span>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mt-3 flex-wrap">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleViewDetail(order.id)}
                                    disabled={detailLoading && String(selectedOrder?.id) !== String(order.id)}
                                >
                                    Xem chi tiet
                                </button>
                                {canReviewOrder(order) && (
                                    <button
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => handleOpenReview(order)}
                                    >
                                        Danh gia san pham
                                    </button>
                                )}
                                {canReturnOrder(order) && (
                                    <button
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => handleReturnOrder(order.id)}
                                        disabled={submittingOrderId === order.id}
                                    >
                                        {submittingOrderId === order.id ? 'Dang xu ly...' : 'Hoan hang'}
                                    </button>
                                )}
                                {canCancelOrder(order) && (
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleCancelOrder(order.id)}
                                        disabled={submittingOrderId === order.id}
                                    >
                                        {submittingOrderId === order.id ? 'Dang huy...' : 'Huy don'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )})}
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
                                    <h4 className="mb-1">Chi tiet don hang #{selectedOrder.id}</h4>
                                    <div className="text-muted">
                                        {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedOrder(null)}>
                                    Dong
                                </button>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted mb-1">Trang thai don hang</div>
                                        <div className="fw-bold">{selectedOrder.status}</div>
                                        <div className="small text-muted mt-3 mb-1">Thanh toan</div>
                                        <div>{selectedOrder.paymentStatus || 'pending'}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="border rounded p-3 h-100">
                                        <div className="small text-muted mb-1">Dia chi giao hang</div>
                                        <div>{selectedOrder.shippingAddress || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded p-3 mb-4">
                                <h5 className="mb-3">San pham</h5>
                                <div className="d-flex flex-column gap-3">
                                    {(selectedOrder.orderItems || []).map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="d-flex justify-content-between align-items-start gap-3 border-bottom pb-2"
                                            ref={canReviewOrder(selectedOrder) && index === 0 ? reviewTargetRef : null}
                                        >
                                            <div>
                                                <div className="fw-semibold">{item.product?.name || `San pham #${item.productId}`}</div>
                                                <div className="text-muted small">
                                                    So luong: {item.quantity} | Don gia: {Number(item.price || 0).toLocaleString('vi-VN')} VND
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
                                                        Danh gia
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Tong thanh toan</div>
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
                                        {submittingOrderId === selectedOrder.id ? 'Dang huy...' : 'Huy don hang'}
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
                                        {submittingOrderId === selectedOrder.id ? 'Dang xu ly...' : 'Hoan hang'}
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
