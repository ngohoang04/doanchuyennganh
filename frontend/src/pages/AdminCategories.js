import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

const EMPTY_FORM = {
    name: '',
    image: ''
};

const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh'));
        reader.readAsDataURL(file);
    });

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data || []);
            setError('');
        } catch (err) {
            setError('Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setSelectedCategory(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name || '',
            image: category.image || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
        setFormData(EMPTY_FORM);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const image = await readFileAsDataUrl(file);
            setFormData((prev) => ({ ...prev, image }));
            setError('');
        } catch (err) {
            setError(err.message || 'Không thể đọc tệp hình ảnh');
        } finally {
            e.target.value = '';
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: '' }));
    };

    const handleSave = async () => {
        const payload = {
            name: formData.name.trim(),
            image: formData.image.trim()
        };

        if (!payload.name) {
            setError('Tên danh mục không được để trống');
            return;
        }

        try {
            if (selectedCategory) {
                await api.put(`/categories/${selectedCategory.id}`, payload);
            } else {
                await api.post('/categories', payload);
            }

            closeModal();
            await fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu danh mục');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;

        try {
            await api.delete(`/categories/${id}`);
            await fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa danh mục');
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <div>
                    <h2>Quản lý danh mục</h2>
                    <p>Tạo mới hoặc cập nhật tên và ảnh đại diện cho từng danh mục bằng cách chọn ảnh từ thư mục trên máy.</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-circle"></i> Thêm danh mục
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh</th>
                            <th>Tên danh mục</th>
                            <th>Ngày cập nhật</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <tr key={category.id}>
                                    <td>#{category.id}</td>
                                    <td>
                                        <img
                                            src={category.image || `https://picsum.photos/seed/category-${category.id}/80/80`}
                                            alt={category.name}
                                            className="product-thumbnail"
                                        />
                                    </td>
                                    <td>{category.name}</td>
                                    <td className="text-muted">
                                        {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-edit" onClick={() => openEdit(category)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-delete" onClick={() => handleDelete(category.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Chưa có danh mục nào</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>{selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h5>
                            <button className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label>Tên danh mục *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ví dụ: Điện thoại"
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>Ảnh danh mục</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <small className="text-muted mt-2 d-block">
                                    Chọn ảnh trực tiếp từ thư mục trên máy. Ảnh sẽ được lưu cùng danh mục.
                                </small>
                            </div>

                            {formData.image && (
                                <div className="form-group">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="mb-0">Xem trước</label>
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveImage}>
                                            Xóa ảnh
                                        </button>
                                    </div>
                                    <img
                                        src={formData.image.trim()}
                                        alt={formData.name || 'Danh mục'}
                                        style={{
                                            width: '100%',
                                            maxHeight: '220px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategories;
