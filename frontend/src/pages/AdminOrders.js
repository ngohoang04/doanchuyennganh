import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function AdminOrders() {
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
            const response = await api.get('/orders');
            setOrders(response.data || []);
        } catch (err) {
            setError('Khong the tai danh sach don hang');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Quan ly don hang</h2>
                <p>Tong cong: {orders.length} don hang</p>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khach hang</th>
                            <th>Dia chi</th>
                            <th>Trang thai</th>
                            <th>Tong tien</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>#{order.userId}</td>
                                <td>{order.shippingAddress || '-'}</td>
                                <td>{order.status}</td>
                                <td>{Number(order.totalAmount || 0).toLocaleString('vi-VN')} VND</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminOrders;
