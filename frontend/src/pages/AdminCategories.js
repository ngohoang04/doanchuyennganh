import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data || []);
        } catch (err) {
            setError('Khong the tai danh muc');
        }
    };

    const handleAdd = async () => {
        if (!name.trim()) return;
        try {
            await api.post('/categories', { name: name.trim() });
            setName('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the them danh muc');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Khong the xoa danh muc');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Quan ly danh muc</h2>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex gap-2 mb-4">
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                <button className="btn btn-primary" onClick={handleAdd}>Them</button>
            </div>
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ten danh muc</th>
                            <th>Hanh dong</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>#{category.id}</td>
                                <td>{category.name}</td>
                                <td>
                                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(category.id)}>
                                        Xoa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminCategories;
