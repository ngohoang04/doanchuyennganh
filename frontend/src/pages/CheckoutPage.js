import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkout, getAvailableVouchers, getCart } from '../services/shop';

const SHIPPING_OPTIONS = [
    { id: 'standard', label: 'Giao hang tieu chuan', fee: 30000, eta: '3-5 ngay' },
    { id: 'fast', label: 'Giao hang nhanh', fee: 50000, eta: '1-2 ngay' },
    { id: 'express', label: 'Hoa toc', fee: 80000, eta: 'Trong ngay' }
];

const PAYMENT_OPTIONS = [
    { id: 'cod', label: 'Thanh toan khi nhan hang' },
    { id: 'bank', label: 'Chuyen khoan ngan hang qua QR shop' },
    { id: 'wallet', label: 'Vi dien tu' }
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

    return Array.from(grouped.values()).map((group) => {
        const bankInfo = parseBankAccount(group.seller?.bankAccount);
        const sellerLabel =
            group.seller?.shopName ||
            [group.seller?.firstName, group.seller?.lastName].filter(Boolean).join(' ') ||
            `Shop #${group.sellerId}`;

        return {
            ...group,
            sellerLabel,
            bankInfo,
            qrUrl: bankInfo
                ? buildVietQrUrl({
                    ...bankInfo,
                    amount: Math.round(group.subtotal),
                    addInfo: `Thanh toan ${sellerLabel}`
                })
                : ''
        };
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
            setError(err.response?.data?.message || 'Khong the tai du lieu thanh toan');
        } finally {
            setLoading(false);
        }
    };

    const items = useMemo(() => cart?.items || [], [cart]);
    const sellerPaymentGroups = useMemo(() => buildSellerPaymentGroups(items), [items]);
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
        0
    );

    const shipping = SHIPPING_OPTIONS.find((option) => option.id === formData.shippingMethod) || SHIPPING_OPTIONS[0];
    const payment = PAYMENT_OPTIONS.find((option) => option.id === formData.paymentMethod) || PAYMENT_OPTIONS[0];

    const discount = useMemo(() => {
        return calculateVoucherDiscount(appliedVoucher, subtotal, shipping.fee);
    }, [appliedVoucher, shipping.fee, subtotal]);

    const total = Math.max(subtotal + shipping.fee - discount, 0);

    const handleApplyVoucher = () => {
        const normalized = voucherCode.trim().toUpperCase();
        const voucher = availableVouchers.find((item) => item.code === normalized);

        if (!voucher) {
            setAppliedVoucher(null);
            setError('Ma voucher khong hop le');
            return;
        }

        setAppliedVoucher(voucher);
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.recipientName.trim() || !formData.phone.trim() || !formData.address.trim()) {
            setError('Vui long nhap day du thong tin nhan hang');
            return;
        }

        try {
            setSubmitting(true);
            const shippingAddress = [
                `Nguoi nhan: ${formData.recipientName}`,
                `So dien thoai: ${formData.phone}`,
                `Dia chi: ${formData.address}`,
                `Van chuyen: ${shipping.label}`,
                `Thanh toan: ${payment.label}`,
                appliedVoucher ? `Voucher: ${appliedVoucher.name}` : null
            ].filter(Boolean).join(' | ');

            await checkout({
                shippingAddress,
                shippingFee: shipping.fee,
                shippingMethod: shipping.label,
                paymentMethod: payment.label,
                voucherCode: appliedVoucher?.code || ''
            });
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the dat hang');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container py-5">Dang tai trang thanh toan...</div>;
    }

    if (!items.length) {
        return (
            <div className="container py-5">
                <div className="alert alert-info">Gio hang cua ban dang trong.</div>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Mua hang ngay</button>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2>Thanh toan</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/cart')}>
                    Quay lai gio hang
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="border rounded p-4 bg-white mb-4">
                        <h4 className="mb-3">Dia chi nhan hang</h4>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nguoi nhan</label>
                                <input
                                    className="form-control"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">So dien thoai</label>
                                <input
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Dia chi giao hang</label>
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
                        <h4 className="mb-3">San pham dat mua</h4>
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
                                        <div className="text-muted small">So luong: {item.quantity}</div>
                                        <div className="text-muted small">Don gia: {Number(item.product?.price || 0).toLocaleString('vi-VN')} VND</div>
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
                                placeholder="Nhap ma voucher"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                            />
                            <button className="btn btn-outline-primary" onClick={handleApplyVoucher}>
                                Ap dung
                            </button>
                        </div>
                        <div className="mt-3 small text-muted">
                            {availableVouchers.length > 0
                                ? `Voucher kha dung: ${availableVouchers.map((item) => item.code).join(', ')}`
                                : 'Chua co voucher phu hop'}
                        </div>
                        {appliedVoucher && (
                            <div className="alert alert-success mt-3 mb-0">
                                Da ap dung: {appliedVoucher.name}
                            </div>
                        )}
                    </div>

                    <div className="border rounded p-4 bg-white mb-4">
                        <h4 className="mb-3">Phuong thuc van chuyen</h4>
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
                        <h4 className="mb-3">Phuong thuc thanh toan</h4>
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
                            <h4 className="mb-3">Ma QR chuyen khoan theo shop</h4>
                            <div className="alert alert-info">
                                Neu gio hang co nhieu shop, ban can chuyen khoan tung shop theo ma QR ben duoi truoc khi dat hang.
                            </div>
                            <div className="d-flex flex-column gap-4">
                                {sellerPaymentGroups.map((group) => (
                                    <div key={group.sellerId} className="border rounded p-3">
                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                                            <div>
                                                <div className="fw-bold">{group.sellerLabel}</div>
                                                <div className="text-muted small">
                                                    Tong tien san pham cua shop: {group.subtotal.toLocaleString('vi-VN')} VND
                                                </div>
                                            </div>
                                            <div className="text-danger fw-bold">
                                                {group.subtotal.toLocaleString('vi-VN')} VND
                                            </div>
                                        </div>

                                        {group.bankInfo ? (
                                            <div className="row g-3 align-items-center">
                                                <div className="col-md-4">
                                                    <img
                                                        src={group.qrUrl}
                                                        alt={`QR ${group.sellerLabel}`}
                                                        className="img-fluid border rounded"
                                                    />
                                                </div>
                                                <div className="col-md-8">
                                                    <div><strong>Ngan hang:</strong> {group.bankInfo.rawBank}</div>
                                                    <div><strong>So tai khoan:</strong> {group.bankInfo.accountNumber}</div>
                                                    <div><strong>Chu tai khoan:</strong> {group.bankInfo.accountName}</div>
                                                    <div className="text-muted small mt-2">
                                                        Thong tin shop dang ky: {group.seller?.bankAccount}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="alert alert-warning mb-0">
                                                Shop nay chua cau hinh tai khoan ngan hang dung dinh dang `So tai khoan - Ma ngan hang - Ten chu tai khoan`, nen chua tao duoc QR.
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
                        <h4 className="mb-3">Tong thanh toan</h4>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Tam tinh</span>
                            <strong>{subtotal.toLocaleString('vi-VN')} VND</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Phi van chuyen</span>
                            <strong>{shipping.fee.toLocaleString('vi-VN')} VND</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span>Giam gia</span>
                            <strong className="text-success">- {discount.toLocaleString('vi-VN')} VND</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fs-5 fw-bold">So tien phai thanh toan</span>
                            <span className="fs-4 fw-bold text-danger">{total.toLocaleString('vi-VN')} VND</span>
                        </div>
                        <button className="btn btn-primary w-100 btn-lg" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Dang dat hang...' : 'Dat hang'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
