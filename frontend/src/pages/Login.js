import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getSocialAuthConfigError,
    requestFacebookAccessToken,
    requestGoogleAccessToken
} from '../services/socialAuth';
import './auth.css';

function Login({ show = true, onClose, onShowRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');
    const [error, setError] = useState('');
    const { login, socialLogin } = useAuth();

    if (!show) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('open-login-modal'));
        }
    };

    const handleShowRegister = () => {
        if (onClose) onClose();

        if (onShowRegister) {
            onShowRegister();
            return;
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('open-register-modal'));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err?.message || err?.response?.data?.message || 'Email hoac mat khau khong chinh xac';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
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
            setError(err.message || 'Dang nhap mang xa hoi that bai');
        } finally {
            setSocialLoading('');
        }
    };

    return (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
            }}
            onClick={handleClose}
        >
            <div
                className="auth-card position-relative shadow-lg"
                style={{
                    maxWidth: '450px',
                    width: '90%',
                    margin: '20px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    animation: 'fadeIn 0.3s ease'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 m-3"
                    aria-label="Close"
                    onClick={handleClose}
                    style={{ zIndex: 10 }}
                ></button>

                <div className="auth-header">
                    <h2>Dang Nhap</h2>
                    <p>Chao mung quay lai TechShop</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-envelope"></i> Email
                        </label>
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="Nhap email cua ban"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-check mb-3">
                        <input type="checkbox" className="form-check-input" id="remember" />
                        <label className="form-check-label" htmlFor="remember">
                            Ghi nho toi
                        </label>
                    </div>

                    <button type="submit" className="btn btn-login w-100 mb-3" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Dang dang nhap...
                            </>
                        ) : (
                            'Dang Nhap'
                        )}
                    </button>
                </form>

                <div className="divider">HOAC</div>

                <button
                    type="button"
                    className="btn btn-social google-login w-100 mb-2"
                    onClick={() => handleSocialLogin('google')}
                    disabled={Boolean(socialLoading)}
                >
                    <i className="bi bi-google"></i> {socialLoading === 'google' ? 'Dang ket noi Google...' : 'Dang nhap voi Google'}
                </button>

                <button
                    type="button"
                    className="btn btn-social facebook-login w-100 mb-3"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={Boolean(socialLoading)}
                >
                    <i className="bi bi-facebook"></i> {socialLoading === 'facebook' ? 'Dang ket noi Facebook...' : 'Dang nhap voi Facebook'}
                </button>

                <div className="auth-footer">
                    <p>Ban chua co tai khoan?</p>
                    <button
                        type="button"
                        className="link-primary btn btn-link"
                        onClick={handleShowRegister}
                        style={{ textDecoration: 'none', color: 'inherit', padding: 0, border: 'none', cursor: 'pointer' }}
                    >
                        Tao tai khoan moi
                    </button>
                </div>

                <div className="forgot-password">
                    <Link to="#" className="link-secondary" onClick={handleClose}>
                        Quen mat khau?
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
