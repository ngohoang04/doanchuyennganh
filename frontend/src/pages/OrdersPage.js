import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/shop';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
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
                    {orders.map((order) => (
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
                                        <strong>{Number(item.price || 0).toLocaleString('vi-VN')} VND</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
