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
            setError('Khong the tai danh sach san pham');
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
                setError('Khong the doc tep hinh anh');
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
            setError(err.response?.data?.message || 'Khong the luu san pham');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Ban chac chan muon xoa san pham nay?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the xoa san pham');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <div>
                    <h2>San pham cua toi</h2>
                    <p>Tong cong: {products.length} san pham</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-circle"></i> Them san pham
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Anh</th>
                            <th>Ten</th>
                            <th>Danh muc</th>
                            <th>Gia</th>
                            <th>Kho</th>
                            <th>Hanh dong</th>
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
                            <h5>{selectedProduct ? 'Chinh sua san pham' : 'Them san pham moi'}</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label>Ten san pham</label>
                                <input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Gia</label>
                                    <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Kho</label>
                                    <input type="number" className="form-control" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Danh muc</label>
                                    <select className="form-control" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                                        <option value="">Chon danh muc</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label>Mo ta</label>
                                <textarea className="form-control" rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="form-group mb-3">
                                <label>Hinh anh san pham</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImagesChange}
                                />
                                <small className="text-muted mt-2 d-block">
                                    Co the chon nhieu anh. Anh dau tien se duoc dung lam anh dai dien.
                                </small>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="seller-image-grid">
                                    {formData.images.map((image, index) => (
                                        <div key={`${image}-${index}`} className="seller-image-item">
                                            <img src={image} alt={`San pham ${index + 1}`} className="seller-image-preview" />
                                            <button
                                                type="button"
                                                className="seller-image-remove"
                                                onClick={() => removeImage(index)}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                            {index === 0 && <span className="seller-image-badge">Anh dai dien</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="form-group mb-3">
                                <label>Tong so anh</label>
                                <input className="form-control" value={formData.images.length} disabled />
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

export default SellerProducts;
