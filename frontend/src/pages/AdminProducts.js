import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

const EMPTY_FORM = {
    name: '',
    price: '',
    description: '',
    images: [],
    categoryId: '',
    stock: ''
};

const readFilesAsDataUrls = (files) =>
    Promise.all(
        Array.from(files || []).map(
            (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh'));
                    reader.readAsDataURL(file);
                })
        )
    );

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const totalStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);

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
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data || []);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
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

    const openEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name || '',
            price: product.price || '',
            description: product.description || '',
            images: Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.image].filter(Boolean),
            categoryId: product.categoryId || '',
            stock: product.stock || 0
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setSelectedProduct(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setFormData(EMPTY_FORM);
    };

    const handleImagesChange = async (e) => {
        try {
            const nextImages = await readFilesAsDataUrls(e.target.files);
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...nextImages]
            }));
            setError('');
        } catch (err) {
            setError(err.message || 'Không thể đọc tệp hình ảnh');
        } finally {
            e.target.value = '';
        }
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
                images: formData.images,
                categoryId: Number(formData.categoryId),
                price: Number(formData.price),
                stock: Number(formData.stock || 0)
            };

            if (selectedProduct) {
                await api.put(`/products/${selectedProduct.id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            closeModal();
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

    const filteredProducts = products.filter(
        (product) =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id?.toString().includes(searchTerm)
    );

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
                    <h2>Quản lý sản phẩm</h2>
                    <p>Tổng cộng: {products.length} sản phẩm | Tồn kho: {totalStock}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-circle"></i> Thêm sản phẩm
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="admin-toolbar">
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control"
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Kho</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>#{product.id}</td>
                                    <td>
                                        <img
                                            src={product.image || 'https://via.placeholder.com/50?text=TS'}
                                            alt={product.name}
                                            className="product-thumbnail"
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.category?.name || 'N/A'}</td>
                                    <td className="price">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(product.price)}
                                    </td>
                                    <td>
                                        <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {product.stock} sản phẩm
                                        </span>
                                    </td>
                                    <td className="text-muted">
                                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-edit" onClick={() => openEdit(product)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-delete" onClick={() => handleDelete(product.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">Không tìm thấy sản phẩm</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
                            <button className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label>Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Giá *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Kho</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Danh mục *</label>
                                    <select
                                        className="form-control"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label>Mô tả</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
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
                                    Tất cả ảnh đều chọn trực tiếp từ máy tính. Ảnh đầu tiên sẽ là ảnh đại diện.
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

export default AdminProducts;
