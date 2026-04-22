import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

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
            const response = await api.get('/orders/seller/mine');
            setOrders(response.data || []);
        } catch (err) {
            setError('Không thể tải đơn hàng của shop');
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.put(`/orders/seller/${orderId}/status`, { status });
            window.dispatchEvent(new CustomEvent('orders-updated', { detail: { id: orderId, status } }));
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Đơn bán hàng</h2>
                <p>Tổng cộng: {orders.length} đơn</p>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}

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
                                <h5 className="mb-1">Đơn #{order.id}</h5>
                                <p className="mb-0 text-muted">
                                    Khách: {order.user?.lastName || order.user?.firstName || order.user?.email || `#${order.userId}`}
                                </p>
                            </div>
                            <div className="text-end">
                                <strong>{order.status}</strong>
                                <div className="text-muted">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND</div>
                            </div>
                        </div>

                        <p><strong>Địa chỉ:</strong> {order.shippingAddress || '-'}</p>

                        <div className="d-flex flex-column gap-2 mb-3">
                            {(order.orderItems || []).map((item) => (
                                <div key={item.id} className="d-flex justify-content-between border-top pt-2">
                                    <span>{item.product?.name || `Sản phẩm #${item.productId}`} x {item.quantity}</span>
                                    <span>
                                        {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-top mt-3 pt-3 mb-3">
                            <div className="d-flex justify-content-between text-muted mb-1">
                                <span>Tạm tính sản phẩm</span>
                                <span>{productSubtotal.toLocaleString('vi-VN')} VND</span>
                            </div>
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Tổng đơn hàng</span>
                                <span>{Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND</span>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => handleStatusChange(order.id, 'confirmed')}>
                                Xác nhận
                            </button>
                            <button className="btn btn-outline-warning btn-sm" onClick={() => handleStatusChange(order.id, 'shipping')}>
                                Đang giao
                            </button>
                            <button className="btn btn-outline-success btn-sm" onClick={() => handleStatusChange(order.id, 'completed')}>
                                Hoàn thành
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleStatusChange(order.id, 'returned')}>
                                Hoàn hàng
                            </button>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
}

export default SellerOrders;
