import React, { useState, useEffect } from 'react';
import api from '../services/Api';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalStock: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');

            const [usersRes, productsRes, ordersRes] = await Promise.all([
                api.get('/users').catch(err => ({ data: [] })),
                api.get('/products').catch(err => ({ data: [] })),
                api.get('/orders').catch(err => ({ data: [] }))
            ]);

            const totalRevenue = (ordersRes.data || []).reduce((sum, order) => {
                return String(order.status || '').toLowerCase() === 'completed'
                    ? sum + Number(order.totalAmount || 0)
                    : sum;
            }, 0);
            const totalStock = (productsRes.data || []).reduce(
                (sum, product) => sum + Number(product.stock || 0),
                0
            );

            setStats({
                totalUsers: usersRes.data?.length || 0,
                totalProducts: productsRes.data?.length || 0,
                totalOrders: ordersRes.data?.length || 0,
                totalRevenue,
                totalStock
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Có lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        const handleOrdersUpdated = () => {
            fetchStats();
        };

        window.addEventListener('orders-updated', handleOrdersUpdated);
        return () => window.removeEventListener('orders-updated', handleOrdersUpdated);
    }, []);

    const StatCard = ({ icon, title, value, color }) => (
        <div className="stat-card" style={{ borderLeftColor: color }}>
            <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
                <i className={`bi ${icon}`} style={{ color }}></i>
            </div>
            <div className="stat-content">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Dashboard</h2>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="stats-grid">
                    <StatCard
                        icon="bi-people"
                        title="Người dùng"
                        value={stats.totalUsers}
                        color="#667eea"
                    />
                    <StatCard
                        icon="bi-box"
                        title="Sản phẩm"
                        value={stats.totalProducts}
                        color="#764ba2"
                    />
                    <StatCard
                        icon="bi-bag-check"
                        title="Đơn hàng"
                        value={stats.totalOrders}
                        color="#fa9b15"
                    />
                    <StatCard
                        icon="bi-coin"
                        title="Doanh thu"
                        value={new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            maximumFractionDigits: 0
                        }).format(stats.totalRevenue)}
                        color="#14a314"
                    />
                    <StatCard
                        icon="bi-archive"
                        title="Tong ton kho"
                        value={stats.totalStock}
                        color="#0d6efd"
                    />
                </div>
            )}

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                }

                .stat-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
                }

                .stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    flex-shrink: 0;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-title {
                    margin: 0;
                    color: #999;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .stat-value {
                    margin: 8px 0 0;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #333;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
