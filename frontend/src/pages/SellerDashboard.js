import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/Api';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh'));
        reader.readAsDataURL(file);
    });

function SellerDashboard() {
    const { user, updateUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingQr, setSavingQr] = useState(false);
    const [qrMessage, setQrMessage] = useState('');
    const [sellerPaymentForm, setSellerPaymentForm] = useState({
        bankAccount: user?.bankAccount || '',
        bankQrImage: user?.bankQrImage || ''
    });

    useEffect(() => {
        setSellerPaymentForm({
            bankAccount: user?.bankAccount || '',
            bankQrImage: user?.bankQrImage || ''
        });
    }, [user]);

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

    const completedOrders = useMemo(
        () => orders.filter((order) => String(order.status || '').toLowerCase() === 'completed').length,
        [orders]
    );

    const stats = [
        { title: 'Sản phẩm', value: products.length, icon: 'bi-box' },
        { title: 'Đơn hàng', value: orders.length, icon: 'bi-bag-check' },
        { title: 'Đơn hoàn tất', value: completedOrders, icon: 'bi-patch-check' },
        { title: 'Doanh thu tạm tính', value: `${revenue.toLocaleString('vi-VN')} VND`, icon: 'bi-cash-stack' },
        { title: 'Tồn kho', value: totalStock, icon: 'bi-archive' }
    ];

    const handleBankAccountChange = (e) => {
        setSellerPaymentForm((prev) => ({
            ...prev,
            bankAccount: e.target.value
        }));
        setQrMessage('');
    };

    const handleQrImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const image = await readFileAsDataUrl(file);
            setSellerPaymentForm((prev) => ({
                ...prev,
                bankQrImage: image
            }));
            setQrMessage('');
        } finally {
            e.target.value = '';
        }
    };

    const handleSaveQr = async () => {
        try {
            setSavingQr(true);
            await updateUser(user.id, {
                bankAccount: sellerPaymentForm.bankAccount,
                bankQrImage: sellerPaymentForm.bankQrImage
            });
            setQrMessage('Đã cập nhật QR thanh toán cho shop.');
        } catch (error) {
            setQrMessage('Chưa lưu được QR, vui lòng thử lại.');
        } finally {
            setSavingQr(false);
        }
    };

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

            <div className="border rounded p-4 bg-white mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                        <h4 className="mb-1">QR thanh toán của shop</h4>
                        <p className="text-muted mb-0">Khách hàng sẽ dùng ảnh QR này khi chọn chuyển khoản ngân hàng.</p>
                    </div>
                </div>

                <div className="row g-4 align-items-start">
                    <div className="col-lg-7">
                        <div className="mb-3">
                            <label className="form-label">Thông tin tài khoản ngân hàng</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ví dụ: 123456789 - VCB - Nguyen Van A"
                                value={sellerPaymentForm.bankAccount}
                                onChange={handleBankAccountChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Tải ảnh QR từ máy tính</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleQrImageChange}
                            />
                        </div>
                        {qrMessage && <div className="text-muted small">{qrMessage}</div>}
                        <button className="btn btn-primary mt-2" onClick={handleSaveQr} disabled={savingQr}>
                            {savingQr ? 'Đang lưu...' : 'Lưu QR thanh toán'}
                        </button>
                    </div>

                    <div className="col-lg-5">
                        <div className="border rounded p-3 bg-light h-100">
                            <div className="fw-semibold mb-2">Xem trước</div>
                            {sellerPaymentForm.bankQrImage ? (
                                <img
                                    src={sellerPaymentForm.bankQrImage}
                                    alt="QR shop"
                                    style={{
                                        width: '100%',
                                        maxHeight: 260,
                                        objectFit: 'contain',
                                        background: '#fff',
                                        borderRadius: 12,
                                        border: '1px solid #e0e0e0',
                                        padding: 8
                                    }}
                                />
                            ) : (
                                <div className="text-muted">Chưa có ảnh QR nào được tải lên.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;
