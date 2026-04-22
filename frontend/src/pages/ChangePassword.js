import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './profile.css';

function ChangePassword() {
    const navigate = useNavigate();
    const { user, changePassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.oldPassword) {
            setError('Vui lòng nhập mật khẩu cũ.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            setError('Mật khẩu mới phải khác mật khẩu cũ.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(user.id, formData.oldPassword, formData.newPassword);
            setSuccess('Đổi mật khẩu thành công.');
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            window.setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Lỗi khi đổi mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mt-5 text-center">
                <p>Vui lòng đăng nhập để thay đổi mật khẩu.</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3>
                                    <i className="bi bi-lock"></i> Đổi mật khẩu
                                </h3>
                            </div>

                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleSubmit} className="change-password-form">
                                <div className="mb-4">
                                    <label className="form-label">Mật khẩu cũ</label>
                                    <div className="password-input">
                                        <input
                                            type={showPasswords.old ? 'text' : 'password'}
                                            className="form-control form-control-lg"
                                            name="oldPassword"
                                            value={formData.oldPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu cũ"
                                            required
                                        />
                                        <button type="button" className="btn-toggle-password" onClick={() => togglePasswordVisibility('old')}>
                                            <i className={`bi ${showPasswords.old ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <div className="password-input">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            className="form-control form-control-lg"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                        />
                                        <button type="button" className="btn-toggle-password" onClick={() => togglePasswordVisibility('new')}>
                                            <i className={`bi ${showPasswords.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Xác nhận mật khẩu mới</label>
                                    <div className="password-input">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            className="form-control form-control-lg"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập lại mật khẩu mới"
                                            required
                                        />
                                        <button type="button" className="btn-toggle-password" onClick={() => togglePasswordVisibility('confirm')}>
                                            <i className={`bi ${showPasswords.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="password-requirements mb-4">
                                    <p className="text-muted small">
                                        <i className="bi bi-info-circle"></i> Mật khẩu nên có ít nhất 6 ký tự.
                                    </p>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary btn-lg w-100 mb-2" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Đổi mật khẩu'
                                        )}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary btn-lg w-100" onClick={() => navigate('/profile')}>
                                        Quay lại
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;
