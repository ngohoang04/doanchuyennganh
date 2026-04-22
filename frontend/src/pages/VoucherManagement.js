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
            setError(err.response?.data?.message || 'Không thể tải danh sách voucher');
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
            setError(err.response?.data?.message || 'Không thể lưu voucher');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa voucher này?')) return;
        try {
            await deleteVoucher(id);
            fetchVouchers();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa voucher');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <div>
                    <h2>Ma giam gia</h2>
                    <p>{user?.role === 'admin' ? 'Quản lý voucher hệ thống' : 'Quản lý voucher của shop'}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-ticket-perforated"></i> Tạo voucher
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Tên</th>
                            <th>Loại</th>
                            <th>Giá trị</th>
                            <th>Đơn tối thiểu</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((voucher) => (
                            <tr key={voucher.id}>
                                <td><strong>{voucher.code}</strong></td>
                                <td>{voucher.name}</td>
                                <td>{voucher.discountType === 'percent' ? 'Phần trăm' : 'Tiền mặt'}</td>
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
                                <td>{voucher.isActive ? 'Đang bật' : 'Đã tắt'}</td>
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
                            <h5>{selectedVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Mã voucher</label>
                                    <input className="form-control" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Tên voucher</label>
                                    <input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label>Mô tả</label>
                                <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Loại giảm</label>
                                    <select className="form-control" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
                                        <option value="fixed">Giảm tiền</option>
                                        <option value="percent">Giảm phần trăm</option>
                                    </select>
                                </div>
                                <div className="form-group mb-3">
                                    <label>Giá trị giảm</label>
                                    <input type="number" className="form-control" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Đơn tối thiểu</label>
                                    <input type="number" className="form-control" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Giảm tối đa</label>
                                    <input type="number" className="form-control" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Giảm phí ship</label>
                                    <input type="number" className="form-control" value={formData.shippingDiscount} onChange={(e) => setFormData({ ...formData, shippingDiscount: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Trạng thái</label>
                                    <select className="form-control" value={String(formData.isActive)} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}>
                                        <option value="true">Đang bật</option>
                                        <option value="false">Đã tắt</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Bắt đầu</label>
                                    <input type="datetime-local" className="form-control" value={formData.startsAt} onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Kết thúc</label>
                                    <input type="datetime-local" className="form-control" value={formData.endsAt} onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VoucherManagement;
