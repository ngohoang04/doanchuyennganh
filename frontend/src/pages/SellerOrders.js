import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/seller/mine');
            setOrders(response.data || []);
        } catch (err) {
            setError('Khong the tai don hang cua seller');
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.put(`/orders/seller/${orderId}/status`, { status });
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the cap nhat trang thai');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Don ban hang</h2>
                <p>Tong cong: {orders.length} don</p>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex flex-column gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 className="mb-1">Don #{order.id}</h5>
                                <p className="mb-0 text-muted">
                                    Khach: {order.user?.lastName || order.user?.firstName || order.user?.email || `#${order.userId}`}
                                </p>
                            </div>
                            <div className="text-end">
                                <strong>{order.status}</strong>
                                <div className="text-muted">{Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND</div>
                            </div>
                        </div>

                        <p><strong>Dia chi:</strong> {order.shippingAddress || '-'}</p>

                        <div className="d-flex flex-column gap-2 mb-3">
                            {(order.orderItems || []).map((item) => (
                                <div key={item.id} className="d-flex justify-content-between border-top pt-2">
                                    <span>{item.product?.name || `San pham #${item.productId}`} x {item.quantity}</span>
                                    <span>{Number(item.price || 0).toLocaleString('vi-VN')} VND</span>
                                </div>
                            ))}
                        </div>

                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => handleStatusChange(order.id, 'confirmed')}>
                                Xac nhan
                            </button>
                            <button className="btn btn-outline-warning btn-sm" onClick={() => handleStatusChange(order.id, 'shipping')}>
                                Dang giao
                            </button>
                            <button className="btn btn-outline-success btn-sm" onClick={() => handleStatusChange(order.id, 'completed')}>
                                Hoan thanh
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SellerOrders;
