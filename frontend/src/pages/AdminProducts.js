import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        categoryId: '',
        stock: ''
    });
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
            setError('Khong the tai danh sach san pham');
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
            name: product.name,
            price: product.price,
            description: product.description || '',
            image: product.image || '',
            categoryId: product.categoryId,
            stock: product.stock || 0
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setSelectedProduct(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            image: '',
            categoryId: '',
            stock: ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
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
                    <h2>Quan ly san pham</h2>
                    <p>Tong cong: {products.length} san pham | Ton kho: {totalStock}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-circle"></i> Them san pham
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="admin-toolbar">
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tim kiem theo ten hoac ID..."
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
                            <th>Anh</th>
                            <th>Ten san pham</th>
                            <th>Danh muc</th>
                            <th>Gia</th>
                            <th>Kho</th>
                            <th>Ngay tao</th>
                            <th>Hanh dong</th>
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
                                            {product.stock} san pham
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
                                <td colSpan="8" className="text-center">Khong tim thay san pham</td>
                            </tr>
                        )}
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
                                <label>Ten san pham *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Gia *</label>
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
                                    <label>Danh muc *</label>
                                    <select
                                        className="form-control"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="">Chon danh muc</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label>Mo ta</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>URL hinh anh</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
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

export default AdminProducts;
