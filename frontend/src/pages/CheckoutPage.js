import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkout, getAvailableVouchers, getCart } from '../services/shop';

const SHIPPING_OPTIONS = [
    { id: 'standard', label: 'Giao hàng tiêu chuẩn', fee: 30000, eta: '3-5 ngày' },
    { id: 'fast', label: 'Giao hàng nhanh', fee: 50000, eta: '1-2 ngày' },
    { id: 'express', label: 'Hỏa tốc', fee: 80000, eta: 'Trong ngày' }
];

const PAYMENT_OPTIONS = [
    { id: 'cod', label: 'Thanh toán khi nhận hàng' },
    { id: 'bank', label: 'Chuyển khoản ngân hàng qua QR' }
];

const BANK_NAME_MAP = {
    VCB: 'vietcombank',
    VIETCOMBANK: 'vietcombank',
    BIDV: 'bidv',
    AGRIBANK: 'agribank',
    VIETINBANK: 'vietinbank',
    TECHCOMBANK: 'techcombank',
    MBBANK: 'mbbank',
    MB: 'mbbank',
    ACB: 'acb',
    TPBANK: 'tpbank',
    SACOMBANK: 'sacombank',
    HDBANK: 'hdbank',
    OCB: 'ocb',
    VIB: 'vib',
    MSB: 'msb',
    SHB: 'shb',
    EXIMBANK: 'eximbank'
};

const parseBankAccount = (value = '') => {
    const normalized = String(value || '').trim();
    if (!normalized) return null;

    const segments = normalized
        .split(/[-,|]/)
        .map((segment) => segment.trim())
        .filter(Boolean);

    if (segments.length < 3) {
        return null;
    }

    const accountNumber = segments[0].replace(/\s+/g, '');
    const bankKey = segments[1].replace(/\s+/g, '').toUpperCase();
    const accountName = segments.slice(2).join(' ');
    const bankCode = BANK_NAME_MAP[bankKey];

    if (!accountNumber || !bankCode || !accountName) {
        return null;
    }

    return {
        accountNumber,
        bankCode,
        accountName,
        rawBank: segments[1]
    };
};

const buildVietQrUrl = ({ bankCode, accountNumber, accountName, amount, addInfo }) => (
    `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${encodeURIComponent(amount)}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`
);

const buildSellerPaymentGroups = (items = []) => {
    const grouped = new Map();

    items.forEach((item) => {
        const seller = item.product?.seller;
        const sellerId = seller?.id || `unknown-${item.id}`;
        const amount = Number(item.product?.price || 0) * Number(item.quantity || 0);

        if (!grouped.has(sellerId)) {
            grouped.set(sellerId, {
                sellerId,
                seller,
                items: [],
                subtotal: 0
            });
        }

        const current = grouped.get(sellerId);
        current.items.push(item);
        current.subtotal += amount;
    });

    return Array.from(grouped.values()).map((group) => ({
        ...group,
        sellerLabel:
            group.seller?.shopName ||
            [group.seller?.firstName, group.seller?.lastName].filter(Boolean).join(' ') ||
            `Shop #${group.sellerId}`
    }));
};

const allocateGroupPayableAmounts = (groups = [], shippingFee = 0, discount = 0, subtotal = 0) => {
    if (!groups.length) return [];
    if (subtotal <= 0) {
        return groups.map((group) => ({ ...group, payableAmount: 0 }));
    }

    let remaining = Math.max(subtotal + shippingFee - discount, 0);

    return groups.map((group, index) => {
        if (index === groups.length - 1) {
            return { ...group, payableAmount: Math.max(remaining, 0) };
        }

        const ratio = Number(group.subtotal || 0) / Number(subtotal || 1);
        const rawAmount = Number(group.subtotal || 0) + shippingFee * ratio - discount * ratio;
        const payableAmount = Math.max(Math.round(rawAmount), 0);
        remaining -= payableAmount;
        return { ...group, payableAmount };
    });
};

const calculateVoucherDiscount = (voucher, subtotal, shippingFee) => {
    if (!voucher) return 0;

    let discountAmount = 0;

    if (voucher.discountType === 'fixed') {
        discountAmount += Number(voucher.discountValue || 0);
    }

    if (voucher.discountType === 'percent') {
        discountAmount += subtotal * (Number(voucher.discountValue || 0) / 100);
    }

    if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
    }

    if (voucher.shippingDiscount) {
        discountAmount += Math.min(Number(voucher.shippingDiscount), Number(shippingFee || 0));
    }

    return Math.max(discountAmount, 0);
};

function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [createdBankOrder, setCreatedBankOrder] = useState(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [formData, setFormData] = useState({
        recipientName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '',
        phone: user?.phone || '',
        address: '',
        shippingMethod: SHIPPING_OPTIONS[0].id,
        paymentMethod: PAYMENT_OPTIONS[0].id
    });

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
            const items = response.data?.items || [];
            const nextSubtotal = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0);
            const voucherResponse = await getAvailableVouchers(nextSubtotal);
            setAvailableVouchers(voucherResponse.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const items = useMemo(() => cart?.items || [], [cart]);
    const rawSellerPaymentGroups = useMemo(() => buildSellerPaymentGroups(items), [items]);
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
        0
    );

    const shipping = SHIPPING_OPTIONS.find((option) => option.id === formData.shippingMethod) || SHIPPING_OPTIONS[0];
    const payment = PAYMENT_OPTIONS.find((option) => option.id === formData.paymentMethod) || PAYMENT_OPTIONS[0];

    const discount = useMemo(
        () => calculateVoucherDiscount(appliedVoucher, subtotal, shipping.fee),
        [appliedVoucher, shipping.fee, subtotal]
    );

    const total = Math.max(subtotal + shipping.fee - discount, 0);
    const sellerPaymentGroups = useMemo(
        () => allocateGroupPayableAmounts(rawSellerPaymentGroups, shipping.fee, discount, subtotal),
        [rawSellerPaymentGroups, shipping.fee, discount, subtotal]
    );
    const invalidBankGroups = sellerPaymentGroups.filter((group) => !parseBankAccount(group.seller?.bankAccount));
    const ownProductGroups = sellerPaymentGroups.filter((group) => String(group.seller?.id) === String(user?.id));

    const handleApplyVoucher = () => {
        const normalized = voucherCode.trim().toUpperCase();
        const voucher = availableVouchers.find((item) => item.code === normalized);

        if (!voucher) {
            setAppliedVoucher(null);
            setError('Mã voucher không hợp lệ');
            return;
        }

        setAppliedVoucher(voucher);
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.recipientName.trim() || !formData.phone.trim() || !formData.address.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin nhận hàng');
            return;
        }

        if (ownProductGroups.length > 0) {
            setError('Bạn không thể thanh toán đơn hàng có sản phẩm của chính shop mình.');
            return;
        }

        if (formData.paymentMethod === 'bank' && invalidBankGroups.length > 0) {
            setError('Một hoặc nhiều shop chưa khai báo đúng thông tin tài khoản ngân hàng để tạo QR động.');
            return;
        }

        try {
            setSubmitting(true);
            const checkoutSellerGroups = sellerPaymentGroups.map((group) => ({
                ...group,
                bankInfo: parseBankAccount(group.seller?.bankAccount)
            }));
            const shippingAddress = [
                `Người nhận: ${formData.recipientName}`,
                `Số điện thoại: ${formData.phone}`,
                `Địa chỉ: ${formData.address}`,
                `Vận chuyển: ${shipping.label}`,
                `Thanh toán: ${payment.label}`,
                appliedVoucher ? `Voucher: ${appliedVoucher.name}` : null
            ].filter(Boolean).join(' | ');

            const response = await checkout({
                shippingAddress,
                shippingFee: shipping.fee,
                shippingMethod: shipping.label,
                paymentMethod: payment.label,
                paymentMethodCode: payment.id,
                voucherCode: appliedVoucher?.code || ''
            });

            if (formData.paymentMethod === 'bank') {
                const order = response.data;
                const qrGroups = checkoutSellerGroups.map((group) => ({
                    ...group,
                    orderCode: `DH${order.id}-SHOP${group.sellerId}`,
                    qrUrl: buildVietQrUrl({
                        ...group.bankInfo,
                        amount: Math.round(group.payableAmount),
                        addInfo: `DH${order.id}-SHOP${group.sellerId}`
                    })
                }));
                setCreatedBankOrder({ order, qrGroups });
                setError('');
                return;
            }

            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể đặt hàng');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container py-5">Đang tải trang thanh toán...</div>;
    }

    if (!items.length) {
        return (
            <div className="container py-5">
                <div className="alert alert-info">Giỏ hàng của bạn đang trống.</div>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Mua hàng ngay</button>
            </div>
        );
    }

    if (createdBankOrder) {
        return (
            <div className="container py-5">
                <div className="border rounded p-4 bg-white mb-4">
                    <h2 className="mb-2">Đơn hàng #{createdBankOrder.order.id} đã được tạo</h2>
                    <p className="text-muted mb-3">
                        Quét QR bên dưới. Ứng dụng ngân hàng sẽ tự điền đúng số tiền phải trả và mã đơn hàng.
                    </p>
                    <div className="alert alert-info">
                        Trạng thái hiện tại: chờ chuyển khoản. Nội dung chuyển khoản đã gắn sẵn theo mã đơn.
                    </div>
                </div>

                <div className="d-flex flex-column gap-4">
                    {createdBankOrder.qrGroups.map((group) => (
                        <div key={`${group.sellerId}-${group.orderCode}`} className="border rounded p-4 bg-white">
                            <div className="row g-4 align-items-center">
                                <div className="col-md-4">
                                    <img
                                        src={group.qrUrl}
                                        alt={`QR ${group.sellerLabel}`}
                                        className="img-fluid border rounded p-2 bg-white"
                                        style={{ maxHeight: 260, objectFit: 'contain' }}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <h4 className="mb-3">{group.sellerLabel}</h4>
                                    <div><strong>Số tiền:</strong> {Number(group.payableAmount || 0).toLocaleString('vi-VN')} VND</div>
                                    <div><strong>Mã đơn trong nội dung chuyển khoản:</strong> {group.orderCode}</div>
                                    <div><strong>Tài khoản ngân hàng:</strong> {group.seller?.bankAccount}</div>
                                    <div className="text-muted small mt-2">
                                        Khi quét QR, ngân hàng sẽ tự điền số tiền và nội dung chuyển khoản theo mã đơn này.
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="d-flex gap-3 flex-wrap mt-4">
                    <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                        Xem đơn hàng của tôi
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => navigate('/products')}>
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2>Thanh Toán</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/cart')}>
                    Quay lại giỏ hàng
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {ownProductGroups.length > 0 && (
                <div className="alert alert-warning">
                    Đơn hàng đang có sản phẩm của chính shop bạn. Hãy quay lại giỏ hàng để xóa trước khi thanh toán.
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="border rounded p-4 bg-white mb-4">
                        <h4 className="mb-3">Địa chỉ nhận hàng</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Người nhận</label>
                                <input
                                    className="form-control"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Số điện thoại</label>
                                <input
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Địa chỉ giao hàng</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded p-4 bg-white mb-4">
                        <h4 className="mb-3">Sản phẩm đặt mua</h4>
                        <div className="d-flex flex-column gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="d-flex gap-3 align-items-center border rounded p-3">
                                    <img
                                        src={item.product?.image || 'https://via.placeholder.com/120x90?text=TechShop'}
                                        alt={item.product?.name}
                                        style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 10 }}
                                    />
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{item.product?.name}</h6>
                                        <div className="text-muted small">Số lượng: {item.quantity}</div>
                                        <div className="text-muted small">Đơn giá: {Number(item.product?.price || 0).toLocaleString('vi-VN')} VND</div>
                                    </div>
                                    <strong className="text-danger">
                                        {(Number(item.product?.price || 0) * Number(item.quantity || 0)).toLocaleString('vi-VN')} VND
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border rounded p-4 bg-white mb-4">
                        <h4 className="mb-3">Voucher</h4>
                        <div className="d-flex gap-2 flex-wrap">
                            <input
                                className="form-control"
                                style={{ maxWidth: 320 }}
                                placeholder="Nhập mã voucher"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                            />
                            <button className="btn btn-outline-primary" onClick={handleApplyVoucher}>
                                Áp dụng
                            </button>
                        </div>
                        <div className="mt-3 small text-muted">
                            {availableVouchers.length > 0
                                ? `Voucher khả dụng: ${availableVouchers.map((item) => item.code).join(', ')}`
                                : 'Chưa có voucher phù hợp'}
                        </div>
                        {appliedVoucher && (
                            <div className="alert alert-success mt-3 mb-0">
                                Đã áp dụng: {appliedVoucher.name}
                            </div>
                        )}
                    </div>

                    <div className="border rounded p-4 bg-white mb-4">
                        <h4 className="mb-3">Phương thức vận chuyển</h4>
                        <div className="d-flex flex-column gap-3">
                            {SHIPPING_OPTIONS.map((option) => (
                                <label key={option.id} className="border rounded p-3 d-flex justify-content-between align-items-center">
                                    <span>
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            className="form-check-input me-2"
                                            checked={formData.shippingMethod === option.id}
                                            onChange={() => setFormData({ ...formData, shippingMethod: option.id })}
                                        />
                                        {option.label}
                                        <small className="text-muted d-block ms-4">{option.eta}</small>
                                    </span>
                                    <strong>{option.fee.toLocaleString('vi-VN')} VND</strong>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border rounded p-4 bg-white">
                        <h4 className="mb-3">Phương thức thanh toán</h4>
                        <div className="d-flex flex-column gap-3">
                            {PAYMENT_OPTIONS.map((option) => (
                                <label key={option.id} className="border rounded p-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        className="form-check-input me-2"
                                        checked={formData.paymentMethod === option.id}
                                        onChange={() => setFormData({ ...formData, paymentMethod: option.id })}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {formData.paymentMethod === 'bank' && (
                        <div className="border rounded p-4 bg-white mt-4">
                            <h4 className="mb-3">QR sẽ được tạo tự động sau khi tạo đơn</h4>
                            <div className="alert alert-info">
                                Sau khi bấm nút thanh toán, hệ thống sẽ sinh QR động cho từng shop với sẵn số tiền phải trả và mã đơn hàng.
                            </div>
                            <div className="d-flex flex-column gap-4">
                                {sellerPaymentGroups.map((group) => (
                                    <div key={group.sellerId} className="border rounded p-3">
                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                                            <div>
                                                <div className="fw-bold">{group.sellerLabel}</div>
                                                <div className="text-muted small">
                                                    Số tiền shop cần nhận: {Number(group.payableAmount || 0).toLocaleString('vi-VN')} VND
                                                </div>
                                            </div>
                                            <div className="text-danger fw-bold">
                                                {Number(group.payableAmount || 0).toLocaleString('vi-VN')} VND
                                            </div>
                                        </div>
                                        {!parseBankAccount(group.seller?.bankAccount) && (
                                            <div className="alert alert-warning mt-3 mb-0">
                                                Shop này chưa khai báo đúng tài khoản ngân hàng nên chưa thể tạo QR động.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="border rounded p-4 bg-white position-sticky" style={{ top: 100 }}>
                        <h4 className="mb-3">Tổng thanh toán</h4>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Tạm tính</span>
                            <strong>{subtotal.toLocaleString('vi-VN')} VND</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Phí vận chuyển</span>
                            <strong>{shipping.fee.toLocaleString('vi-VN')} VND</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span>Giảm giá</span>
                            <strong className="text-success">- {discount.toLocaleString('vi-VN')} VND</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fs-5 fw-bold">Số tiền phải thanh toán</span>
                            <span className="fs-4 fw-bold text-danger">{total.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <button className="btn btn-primary w-100 btn-lg" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang tạo đơn...' : formData.paymentMethod === 'bank' ? 'Tạo đơn và sinh QR thanh toán' : 'Đặt hàng'}
                        </button>
                        {formData.paymentMethod === 'bank' && (
                            <div className="text-muted small mt-3">
                                QR sau khi tạo sẽ tự điền số tiền và nội dung chuyển khoản theo mã đơn hàng.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
