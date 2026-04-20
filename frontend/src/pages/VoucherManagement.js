import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createVoucher, deleteVoucher, getManageVouchers, updateVoucher } from '../services/shop';
import './admin.css';

const emptyForm = {
    code: '',
    name: '',
    description: '',
    discountType: 'fixed',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    shippingDiscount: '',
    isActive: true,
    startsAt: '',
    endsAt: ''
};

function VoucherManagement() {
    const { user } = useAuth();
    const [vouchers, setVouchers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await getManageVouchers();
            setVouchers(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the tai danh sach voucher');
        }
    };

    const openCreate = () => {
        setSelectedVoucher(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEdit = (voucher) => {
        setSelectedVoucher(voucher);
        setFormData({
            code: voucher.code || '',
            name: voucher.name || '',
            description: voucher.description || '',
            discountType: voucher.discountType || 'fixed',
            discountValue: voucher.discountValue || '',
            minOrderValue: voucher.minOrderValue || '',
            maxDiscount: voucher.maxDiscount || '',
            shippingDiscount: voucher.shippingDiscount || '',
            isActive: voucher.isActive !== false,
            startsAt: voucher.startsAt ? voucher.startsAt.slice(0, 16) : '',
            endsAt: voucher.endsAt ? voucher.endsAt.slice(0, 16) : ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                discountValue: Number(formData.discountValue || 0),
                minOrderValue: Number(formData.minOrderValue || 0),
                maxDiscount: formData.maxDiscount === '' ? '' : Number(formData.maxDiscount),
                shippingDiscount: Number(formData.shippingDiscount || 0)
            };

            if (selectedVoucher) {
                await updateVoucher(selectedVoucher.id, payload);
            } else {
                await createVoucher(payload);
            }

            setShowModal(false);
            fetchVouchers();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the luu voucher');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ban chac chan muon xoa voucher nay?')) return;
        try {
            await deleteVoucher(id);
            fetchVouchers();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the xoa voucher');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <div>
                    <h2>Ma giam gia</h2>
                    <p>{user?.role === 'admin' ? 'Quan ly voucher he thong' : 'Quan ly voucher cua shop'}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-ticket-perforated"></i> Tao voucher
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Ten</th>
                            <th>Loai</th>
                            <th>Gia tri</th>
                            <th>Don toi thieu</th>
                            <th>Trang thai</th>
                            <th>Hanh dong</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td><strong>{voucher.code}</strong></td>
                                <td>{voucher.name}</td>
                                <td>{voucher.discountType === 'percent' ? 'Phan tram' : 'Tien mat'}</td>
                                <td>
                                    {voucher.discountType === 'percent'
                                        ? `${Number(voucher.discountValue || 0)}%`
                                        : `${Number(voucher.discountValue || 0).toLocaleString('vi-VN')} VND`}
                                    {Number(voucher.shippingDiscount || 0) > 0 && (
                                        <div className="small text-muted">
                                            + ship {Number(voucher.shippingDiscount || 0).toLocaleString('vi-VN')} VND
                                        </div>
                                    )}
                                </td>
                                <td>{Number(voucher.minOrderValue || 0).toLocaleString('vi-VN')} VND</td>
                                <td>{voucher.isActive ? 'Dang bat' : 'Da tat'}</td>
                                <td>
                                    <button className="btn btn-sm btn-edit" onClick={() => openEdit(voucher)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(voucher.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>{selectedVoucher ? 'Chinh sua voucher' : 'Tao voucher moi'}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Ma voucher</label>
                                    <input className="form-control" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Ten voucher</label>
                                    <input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label>Mo ta</label>
                                <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Loai giam</label>
                                    <select className="form-control" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
                                        <option value="fixed">Giam tien</option>
                                        <option value="percent">Giam phan tram</option>
                                    </select>
                                </div>
                                <div className="form-group mb-3">
                                    <label>Gia tri giam</label>
                                    <input type="number" className="form-control" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Don toi thieu</label>
                                    <input type="number" className="form-control" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Giam toi da</label>
                                    <input type="number" className="form-control" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Giam phi ship</label>
                                    <input type="number" className="form-control" value={formData.shippingDiscount} onChange={(e) => setFormData({ ...formData, shippingDiscount: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Trang thai</label>
                                    <select className="form-control" value={String(formData.isActive)} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}>
                                        <option value="true">Dang bat</option>
                                        <option value="false">Da tat</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Bat dau</label>
                                    <input type="datetime-local" className="form-control" value={formData.startsAt} onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Ket thuc</label>
                                    <input type="datetime-local" className="form-control" value={formData.endsAt} onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Huy</button>
                            <button className="btn btn-primary" onClick={handleSave}>Luu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VoucherManagement;
