import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import {
    getSocialAuthConfigError,
    requestFacebookAccessToken,
    requestGoogleAccessToken
} from '../services/socialAuth';
import './auth.css';

function Register({ show = true, onClose, onShowLogin }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        avatar: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { socialLogin } = useAuth();

    if (!show) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        navigate('/');
    };

    const handleShowLogin = () => {
        if (onClose) onClose();

        if (onShowLogin) {
            onShowLogin();
            return;
        }

        window.dispatchEvent(new Event('open-login-modal'));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    avatar: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('Vui long nhap day du ho va ten');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mat khau khong khop');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Mat khau phai co it nhat 6 ky tu');
            setLoading(false);
            return;
        }

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || '',
                avatar: formData.avatar || ''
            });

            alert('Dang ky thanh cong! Vui long dang nhap.');
            handleShowLogin();
        } catch (err) {
            setError(err.message || 'Co loi khi dang ky');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialRegister = async (provider) => {
        const configError = getSocialAuthConfigError(provider);
        if (configError) {
            setError(configError);
            return;
        }

        setSocialLoading(provider);
        setError('');

        try {
            const accessToken = provider === 'google'
                ? await requestGoogleAccessToken()
                : await requestFacebookAccessToken();
            await socialLogin(provider, accessToken);
            if (onClose) onClose();
        } catch (err) {
            setError(err.message || 'Dang ky mang xa hoi that bai');
        } finally {
            setSocialLoading('');
        }
    };

    return (
        <div
            className="modal-overlay"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
            onClick={handleClose}
        >
            <div
                className="auth-card position-relative shadow-lg"
                style={{ maxWidth: '450px', width: '90%', margin: '20px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Close" onClick={handleClose} style={{ zIndex: 10 }}></button>
                <div className="auth-header">
                    <h2>Tao Tai Khoan</h2>
                    <p>Tham gia TechShop ngay hom nay</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-person-vcard"></i> Ho
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Nhap ho"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-person"></i> Ten
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Nhap ten"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-envelope"></i> Email
                        </label>
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="Nhap email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-telephone"></i> So dien thoai
                        </label>
                        <input
                            type="tel"
                            className="form-control form-control-lg"
                            placeholder="Nhap so dien thoai"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-lock"></i> Mat khau
                        </label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control form-control-lg"
                                placeholder="Nhap mat khau"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-lock-check"></i> Xac nhan mat khau
                        </label>
                        <div className="password-input">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className="form-control form-control-lg"
                                placeholder="Xac nhan mat khau"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <button type="button" className="btn-toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                                <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-image"></i> Avatar (Tuy chon)
                        </label>
                        <input type="file" className="form-control form-control-lg" accept="image/*" onChange={handleAvatarChange} />
                        {formData.avatar && (
                            <div className="mt-3 text-center">
                                <img
                                    src={formData.avatar}
                                    alt="Preview"
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #667eea' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-check mb-3">
                        <input type="checkbox" className="form-check-input" id="agree" required />
                        <label className="form-check-label" htmlFor="agree">
                            Toi dong y voi <Link to="#" className="link-primary">dieu khoan dich vu</Link>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-register w-100 mb-3" disabled={loading}>
                        {loading ? 'Dang tao tai khoan...' : 'Tao Tai Khoan'}
                    </button>
                </form>

                <div className="divider">HOAC</div>

                <button
                    type="button"
                    className="btn btn-social google-login w-100 mb-2"
                    onClick={() => handleSocialRegister('google')}
                    disabled={Boolean(socialLoading)}
                >
                    <i className="bi bi-google"></i> {socialLoading === 'google' ? 'Dang ket noi Google...' : 'Dang ky voi Google'}
                </button>

                <button
                    type="button"
                    className="btn btn-social facebook-login w-100 mb-3"
                    onClick={() => handleSocialRegister('facebook')}
                    disabled={Boolean(socialLoading)}
                >
                    <i className="bi bi-facebook"></i> {socialLoading === 'facebook' ? 'Dang ket noi Facebook...' : 'Dang ky voi Facebook'}
                </button>

                <div className="auth-footer">
                    <p>Ban da co tai khoan?</p>
                    <button
                        type="button"
                        className="link-primary btn btn-link"
                        onClick={handleShowLogin}
                        style={{ textDecoration: 'none', padding: 0, border: 'none' }}
                    >
                        Dang nhap ngay
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;
