import React, { useState, useEffect } from 'react';
import api from '../services/Api';
import './admin.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'user'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách người dùng');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            role: user.role
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!selectedUser) return;

        try {
            await api.put(`/users/${selectedUser.id}`, formData);
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            setError('Không thể cập nhật người dùng');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa người dùng này?')) return;

        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            setError('Không thể xóa người dùng');
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h2>Quản lý Người dùng</h2>
                <p>Tổng cộng: {users.length} người dùng</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="admin-toolbar">
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
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
                            <th>Tên người dùng</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className="user-cell">
                                            <img
                                                src={user.avatar || 'https://via.placeholder.com/40'}
                                                alt={user.username}
                                                className="user-avatar-sm"
                                            />
                                            <div>
                                                <p className="user-name">{user.username}</p>
                                                <small>{user.firstName} {user.lastName}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${user.role}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Người dùng'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-success">Hoạt động</span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-edit"
                                            onClick={() => handleEdit(user)}
                                            title="Chỉnh sửa"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-delete"
                                            onClick={() => handleDelete(user.id)}
                                            title="Xóa"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">Không tìm thấy người dùng</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>Chỉnh sửa Người dùng</h5>
                            <button
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group mb-3">
                                <label>Tên người dùng</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group mb-3">
                                    <label>Tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label>Họ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label>Vai trò</label>
                                <select
                                    className="form-control"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">Người dùng</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
