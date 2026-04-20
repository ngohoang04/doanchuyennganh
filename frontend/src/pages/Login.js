import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

function Login({ show = true, onClose, onShowRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    if (!show) return null;

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        window.history.back();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            // Không call onClose ở đây, để AuthContext handle
        } catch (err) {
            console.error('Login error:', err);
            // Lấy message từ Error object
            const errorMsg = err?.message || err?.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={handleClose}>
            <div className="auth-card position-relative shadow-lg" style={{ maxWidth: '450px', width: '90%', margin: '20px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Close" onClick={handleClose} style={{ zIndex: 10 }}></button>
                <div className="auth-header">
                    <h2>Đăng Nhập</h2>
                    <p>Chào mừng quay lại TechShop</p>
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
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="remember"
                        />
                        <label className="form-check-label" htmlFor="remember">
                            Ghi nhớ tôi
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-login w-100 mb-3"
                        disabled={loading}
                    >
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

                <button className="btn btn-social google-login w-100 mb-2">
                    <i className="bi bi-google"></i> Đăng nhập với Google
                </button>

                <button className="btn btn-social facebook-login w-100 mb-3">
                    <i className="bi bi-facebook"></i> Đăng nhập với Facebook
                </button>

                <div className="auth-footer">
                    <p>Bạn chưa có tài khoản?</p>
                    <button
                        type="button"
                        className="link-primary btn btn-link"
                        onClick={() => {
                            onClose();
                            if (onShowRegister) onShowRegister();
                        }}
                        style={{ textDecoration: 'none', color: 'inherit', padding: 0, border: 'none', cursor: 'pointer' }}
                    >
                        Tạo tài khoản mới
                    </button>
                </div>

                <div className="forgot-password">
                    <Link to="#" className="link-secondary" onClick={onClose}>Quên mật khẩu?</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
