import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        images: [],
        categoryId: '',
        stock: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();

        const handleOrdersUpdated = () => {
            fetchProducts();
        };

        window.addEventListener('orders-updated', handleOrdersUpdated);
        return () => window.removeEventListener('orders-updated', handleOrdersUpdated);
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/seller/mine');
            setProducts(response.data || []);
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data || []);
        } catch (err) {
            setCategories([]);
        }
    };

    const openCreate = () => {
        setSelectedProduct(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            images: [],
            categoryId: '',
            stock: ''
        });
        setShowModal(true);
    };

    const openEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            images: Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : (product.image ? [product.image] : []),
            categoryId: product.categoryId,
            stock: product.stock || 0
        });
        setShowModal(true);
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        Promise.all(
            files.map(
                (file) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
            )
        )
            .then((images) => {
                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...images]
                }));
            })
            .catch(() => {
                setError('Không thể đọc tệp hình ảnh');
            });
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, imageIndex) => imageIndex !== index)
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                image: formData.images[0] || '',
                categoryId: Number(formData.categoryId),
                price: Number(formData.price),
                stock: Number(formData.stock || 0)
            };

            if (selectedProduct) {
                await api.put(`/products/${selectedProduct.id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            setShowModal(false);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lưu sản phẩm');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <div>
                    <h2>Sản phẩm của tôi</h2>
                    <p>Tổng cộng: {products.length} sản phẩm</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-circle"></i> Thêm sản phẩm
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh</th>
                            <th>Tên</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>#{product.id}</td>
                                <td><img src={product.image || 'https://via.placeholder.com/50'} alt={product.name} className="product-thumbnail" /></td>
                                <td>{product.name}</td>
                                <td>{product.category?.name || '-'}</td>
                                <td>{Number(product.price || 0).toLocaleString('vi-VN')} VND</td>
                                <td>{product.stock}</td>
                                <td>
                                    <button className="btn btn-sm btn-edit" onClick={() => openEdit(product)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(product.id)}>
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
                            <h5>{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label>Tên sản phẩm</label>
                                <input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Giá</label>
                                    <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Kho</label>
                                    <input type="number" className="form-control" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Danh mục</label>
                                    <select className="form-control" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label>Mô tả</label>
                                <textarea className="form-control" rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="form-group mb-3">
                                <label>Hình ảnh sản phẩm</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImagesChange}
                                />
                                <small className="text-muted mt-2 d-block">
                                    Có thể chọn nhiều ảnh. Ảnh đầu tiên sẽ được dùng làm ảnh đại diện.
                                </small>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="seller-image-grid">
                                    {formData.images.map((image, index) => (
                                        <div key={`${image}-${index}`} className="seller-image-item">
                                            <img src={image} alt={`Sản phẩm ${index + 1}`} className="seller-image-preview" />
                                            <button
                                                type="button"
                                                className="seller-image-remove"
                                                onClick={() => removeImage(index)}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                            {index === 0 && <span className="seller-image-badge">Ảnh đại diện</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="form-group mb-3">
                                <label>Tổng số ảnh</label>
                                <input className="form-control" value={formData.images.length} disabled />
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

export default SellerProducts;
