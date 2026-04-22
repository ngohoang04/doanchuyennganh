import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordWithToken } from '../services/AuthService';
import './auth.css';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            setLoading(true);
            const response = await resetPasswordWithToken(token, password);
            setSuccess(response.message || 'Đặt lại mật khẩu thành công.');
            setPassword('');
            setConfirmPassword('');
            window.setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.message || 'Không thể đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card shadow-lg">
                <div className="auth-header">
                    <h2>Đặt Lại Mật Khẩu</h2>
                    <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group mb-3">
                        <label className="form-label">
                            <i className="bi bi-lock"></i> Mật khẩu mới
                        </label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control form-control-lg"
                                placeholder="Nhập mật khẩu mới"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" className="btn-toggle-password" onClick={() => setShowPassword((prev) => !prev)}>
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">
                            <i className="bi bi-lock-fill"></i> Xác nhận mật khẩu
                        </label>
                        <div className="password-input">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-control form-control-lg"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button type="button" className="btn-toggle-password" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-login w-100 mb-3" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                </form>

                <div className="forgot-password">
                    <Link to="/login" className="link-secondary">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
