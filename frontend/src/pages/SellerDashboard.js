import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/Api';
import { useAuth } from '../context/AuthContext';
import './admin.css';

function SellerDashboard() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, ordersRes] = await Promise.all([
                api.get('/products/seller/mine'),
                api.get('/orders/seller/mine')
            ]);
            setProducts(productsRes.data || []);
            setOrders(ordersRes.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const handleOrdersUpdated = () => {
            fetchData();
        };

        window.addEventListener('orders-updated', handleOrdersUpdated);
        return () => window.removeEventListener('orders-updated', handleOrdersUpdated);
    }, []);

    const revenue = useMemo(
        () =>
            orders.reduce(
                (sum, order) =>
                    String(order.status || '').toLowerCase() === 'completed'
                        ? sum +
                          (order.orderItems || []).reduce(
                              (sub, item) => sub + Number(item.price || 0) * Number(item.quantity || 0),
                              0
                          )
                        : sum,
                0
            ),
        [orders]
    );

    const totalStock = useMemo(
        () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
        [products]
    );

    const stats = [
        { title: 'Sản phẩm', value: products.length, icon: 'bi-box' },
        { title: 'Đơn hàng', value: orders.length, icon: 'bi-bag-check' },
        { title: 'Doanh thu tạm tính', value: `${revenue.toLocaleString('vi-VN')} VND`, icon: 'bi-cash-stack' },
        { title: 'Tồn kho', value: totalStock, icon: 'bi-archive' }
    ];

    if (loading) {
        return <div className="admin-loading"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <div>
                    <h2>Kênh người bán</h2>
                    <p>{user?.shopName || user?.lastName || user?.firstName || user?.email}</p>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat) => (
                    <div key={stat.title} className="stat-card">
                        <div className="stat-icon">
                            <i className={`bi ${stat.icon}`}></i>
                        </div>
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SellerDashboard;
