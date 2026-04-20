import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteCartItem, getCart, updateCartItem } from '../services/shop';

function CartPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await getCart(user.id);
            setCart(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the tai gio hang');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, quantity) => {
        try {
            await updateCartItem(itemId, quantity);
            await fetchCart();
        } catch (err) {
            window.alert(err.response?.data?.message || 'Khong the cap nhat so luong');
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await deleteCartItem(itemId);
            await fetchCart();
        } catch (err) {
            window.alert(err.response?.data?.message || 'Khong the xoa san pham');
        }
    };

    const items = cart?.items || [];
    const total = items.reduce(
        (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
        0
    );

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gio hang</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/products')}>
                    Tiep tuc mua hang
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <p>Dang tai gio hang...</p>
            ) : items.length === 0 ? (
                <div className="alert alert-info">Gio hang cua ban dang trong.</div>
            ) : (
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="d-flex flex-column gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="border rounded p-3 bg-white">
                                    <div className="row align-items-center">
                                        <div className="col-md-2">
                                            <img
                                                src={item.product?.image || 'https://via.placeholder.com/160x120?text=TechShop'}
                                                alt={item.product?.name}
                                                className="img-fluid rounded"
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <h5 className="mb-1">{item.product?.name}</h5>
                                            <p className="mb-0 text-muted">
                                                {Number(item.product?.price || 0).toLocaleString('vi-VN')} VND
                                            </p>
                                        </div>
                                        <div className="col-md-3">
                                            <input
                                                type="number"
                                                min="1"
                                                className="form-control"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="col-md-2 text-danger fw-bold">
                                            {(Number(item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')} VND
                                        </div>
                                        <div className="col-md-1 text-end">
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
                                                X
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="border rounded p-4 bg-white">
                            <h4>Thanh toan</h4>
                            <p className="text-muted">
                                Kiem tra dia chi nhan hang, voucher, van chuyen va thanh toan o buoc tiep theo.
                            </p>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Tong tien</span>
                                <strong>{total.toLocaleString('vi-VN')} VND</strong>
                            </div>
                            <button className="btn btn-primary w-100" onClick={() => navigate('/checkout')}>
                                Tiep tuc thanh toan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;
