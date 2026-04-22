import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset } from '../services/AuthService';
import {
    getSocialAuthConfigError,
    requestFacebookAccessToken,
    requestGoogleAccessToken
} from '../services/socialAuth';
import './auth.css';

function Login({ show = true, onClose, onShowRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [showForgotForm, setShowForgotForm] = useState(false);
    const [error, setError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [resetPreviewUrl, setResetPreviewUrl] = useState('');
    const { login, socialLogin } = useAuth();

    if (!show) return null;

    const handleClose = () => {
        setShowForgotForm(false);
        setForgotSuccess('');
        setResetPreviewUrl('');
        setError('');

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
        setForgotSuccess('');
        setResetPreviewUrl('');

        try {
            await login(email, password);
            if (onClose) onClose();
        } catch (err) {
            const errorMsg = err?.message || err?.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
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
        setForgotSuccess('');

        try {
            const accessToken = provider === 'google'
                ? await requestGoogleAccessToken()
                : await requestFacebookAccessToken();
            await socialLogin(provider, accessToken);
            if (onClose) onClose();
        } catch (err) {
            setError(err.message || 'Đăng nhập mạng xã hội thất bại');
        } finally {
            setSocialLoading('');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setError('');
        setForgotSuccess('');
        setResetPreviewUrl('');

        try {
            const response = await requestPasswordReset(forgotEmail);
            setForgotSuccess(response.message || 'Nếu email tồn tại, hệ thống đã gửi link đặt lại mật khẩu.');
            setResetPreviewUrl(response.resetUrl || '');
        } catch (err) {
            setError(err.message || 'Không thể gửi email đặt lại mật khẩu');
        } finally {
            setForgotLoading(false);
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
                    <h2>{showForgotForm ? 'Quên Mật Khẩu' : 'Đăng Nhập'}</h2>
                    <p>
                        {showForgotForm
                            ? 'Nhập email để nhận link đặt lại mật khẩu.'
                            : 'Chào mừng bạn quay lại TechShop'}
                    </p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {forgotSuccess && <div className="alert alert-success">{forgotSuccess}</div>}
                {resetPreviewUrl && (
                    <div className="alert alert-warning">
                        <div className="fw-semibold mb-2">Link đặt lại mật khẩu dùng cho local:</div>
                        <a href={resetPreviewUrl}>{resetPreviewUrl}</a>
                    </div>
                )}

                {showForgotForm ? (
                    <form onSubmit={handleForgotPassword} className="auth-form">
                        <div className="form-group mb-3">
                            <label className="form-label">
                                <i className="bi bi-envelope"></i> Email
                            </label>
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                placeholder="Nhập email tài khoản"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-login w-100 mb-3" disabled={forgotLoading}>
                            {forgotLoading ? 'Đang gửi email...' : 'Gửi link đặt lại mật khẩu'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => {
                                setShowForgotForm(false);
                                setForgotSuccess('');
                                setResetPreviewUrl('');
                                setError('');
                            }}
                        >
                            Quay lại đăng nhập
                        </button>
                    </form>
                ) : (
                    <>
                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group mb-3">
                                <label className="form-label">
                                    <i className="bi bi-envelope"></i> Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control form-control-lg"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label">
                                    <i className="bi bi-lock"></i> Mật khẩu
                                </label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control form-control-lg"
                                        placeholder="Nhập mật khẩu"
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
                                    Ghi nhớ tôi
                                </label>
                            </div>

                            <button type="submit" className="btn btn-login w-100 mb-3" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    'Đăng Nhập'
                                )}
                            </button>
                        </form>

                        <div className="divider">HOẶC</div>

                        <button
                            type="button"
                            className="btn btn-social google-login w-100 mb-2"
                            onClick={() => handleSocialLogin('google')}
                            disabled={Boolean(socialLoading)}
                        >
                            <i className="bi bi-google"></i> {socialLoading === 'google' ? 'Đang kết nối Google...' : 'Đăng nhập với Google'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-social facebook-login w-100 mb-3"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={Boolean(socialLoading)}
                        >
                            <i className="bi bi-facebook"></i> {socialLoading === 'facebook' ? 'Đang kết nối Facebook...' : 'Đăng nhập với Facebook'}
                        </button>

                        <div className="auth-footer">
                            <p>Bạn chưa có tài khoản?</p>
                            <button
                                type="button"
                                className="link-primary btn btn-link"
                                onClick={handleShowRegister}
                                style={{ textDecoration: 'none', color: 'inherit', padding: 0, border: 'none', cursor: 'pointer' }}
                            >
                                Tạo tài khoản mới
                            </button>
                        </div>

                        <div className="forgot-password">
                            <Link
                                to="#"
                                className="link-secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setForgotEmail(email);
                                    setShowForgotForm(true);
                                    setError('');
                                    setForgotSuccess('');
                                    setResetPreviewUrl('');
                                }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Login;
