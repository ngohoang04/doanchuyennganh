import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './profile.css';

function Profile() {
    const navigate = useNavigate();
    const { user, updateUser, submitSellerRequest, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSellerForm, setShowSellerForm] = useState(false);
    const [sellerForm, setSellerForm] = useState({
        fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '',
        phone: user?.phone || '',
        email: user?.email || '',
        idCardNumber: '',
        shopName: '',
        shopDescription: '',
        shopAddress: '',
        shopLogo: '',
        idCardFront: '',
        idCardBack: '',
        businessLicense: '',
        bankAccount: ''
    });
    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        avatar: user?.avatar || ''
    });

    const shouldShowSellerSection = user && !['seller', 'admin'].includes(String(user.role || '').toLowerCase());

    const compressImage = (base64String, quality = 0.7, maxSize = 500000) => (
        new Promise((resolve) => {
            const img = new Image();
            img.src = base64String;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width * 0.8;
                canvas.height = img.height * 0.8;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let compressed = canvas.toDataURL('image/jpeg', quality);
                while (compressed.length > maxSize && quality > 0.1) {
                    quality -= 0.1;
                    compressed = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(compressed);
            };
        })
    );

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const compressed = await compressImage(reader.result);
            setFormData((prev) => ({
                ...prev,
                avatar: compressed
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateUser(user.id, formData);
            setSuccess('Cập nhật thông tin cá nhân thành công.');
            setIsEditing(false);
            window.setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.message || 'Lỗi khi cập nhật thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleSellerChange = (e) => {
        setSellerForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSellerFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const compressed = await compressImage(reader.result);
            setSellerForm((prev) => ({
                ...prev,
                [e.target.name]: compressed
            }));
        };
        reader.readAsDataURL(file);
    };

    const resetSellerForm = () => {
        setSellerForm({
            fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '',
            phone: user?.phone || '',
            email: user?.email || '',
            idCardNumber: '',
            shopName: '',
            shopDescription: '',
            shopAddress: '',
            shopLogo: '',
            idCardFront: '',
            idCardBack: '',
            businessLicense: '',
            bankAccount: ''
        });
    };

    const handleSellerRequestSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm('Bạn có chắc chắn muốn gửi hồ sơ đăng ký người bán?')) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const fullName = sellerForm.fullName.trim();
            const parts = fullName.split(/\s+/).filter(Boolean);
            const firstName = parts.shift() || user?.firstName || '';
            const lastName = parts.join(' ') || user?.lastName || '';

            await submitSellerRequest(user.id, {
                sellerStatus: 'pending',
                firstName,
                lastName,
                phone: sellerForm.phone,
                shopName: sellerForm.shopName,
                shopDescription: sellerForm.shopDescription,
                shopAddress: sellerForm.shopAddress,
                idCardNumber: sellerForm.idCardNumber,
                idCardFront: sellerForm.idCardFront,
                idCardBack: sellerForm.idCardBack,
                businessLicense: sellerForm.businessLicense,
                bankAccount: sellerForm.bankAccount,
                shopLogo: sellerForm.shopLogo
            });

            setSuccess('Hồ sơ đăng ký người bán đã được gửi thành công. Vui lòng chờ quản trị viên phê duyệt.');
            setShowSellerForm(false);
            resetSellerForm();
            window.scrollTo(0, 0);
            window.setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message || 'Lỗi khi gửi yêu cầu.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mt-5 text-center">
                <p>Vui lòng đăng nhập để xem hồ sơ.</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="container py-5">
                <div className="profile-header mb-5">
                    <div className="profile-avatar">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.lastName || user.firstName || user.email} className="avatar-img" />
                        ) : (
                            <i className="bi bi-person-circle"></i>
                        )}
                    </div>
                    <div className="profile-info">
                        <h1>{user.lastName || user.firstName || user.email}</h1>
                        <p className="text-muted">{user.email}</p>
                    </div>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}
                {success && <div className="alert alert-success mb-4">{success}</div>}

                <div className="row">
                    <div className="col-lg-8">
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <h3>Thông tin tài khoản</h3>
                                {!isEditing && (
                                    <button className="btn btn-outline-primary" onClick={() => setIsEditing(true)}>
                                        <i className="bi bi-pencil"></i> Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="profile-form">
                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Họ</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Nhập họ"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Tên</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Nhập tên"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            className="form-control form-control-lg"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Ảnh đại diện</label>
                                        <div className="avatar-upload-container">
                                            {formData.avatar && (
                                                <div className="current-avatar mb-3">
                                                    <img src={formData.avatar} alt="Avatar preview" className="avatar-preview" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="form-control form-control-lg"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                            <small className="form-text text-muted d-block mt-2">
                                                Chọn ảnh để đặt làm ảnh đại diện. Khuyến nghị dung lượng dưới 2MB.
                                            </small>
                                        </div>
                                    </div>

                                    <div className="profile-form-actions">
                                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setIsEditing(false)}>
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-info-display">
                                    <div className="info-row">
                                        <span className="info-label">Tên hiển thị:</span>
                                        <span className="info-value">{user.lastName || user.firstName || user.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{user.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Họ:</span>
                                        <span className="info-value">{user.firstName || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Tên:</span>
                                        <span className="info-value">{user.lastName || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Số điện thoại:</span>
                                        <span className="info-value">{user.phone || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {shouldShowSellerSection && (
                            <div className="profile-card mt-4">
                                <div className="profile-card-header">
                                    <h3><i className="bi bi-shop"></i> Đăng ký bán hàng</h3>
                                </div>
                                <div className="p-4">
                                    {user.sellerStatus === 'pending' ? (
                                        <div className="alert alert-warning mb-0">
                                            <i className="bi bi-hourglass-split me-2"></i>
                                            Hồ sơ đăng ký người bán của bạn đang chờ quản trị viên phê duyệt.
                                        </div>
                                    ) : showSellerForm ? (
                                        <form onSubmit={handleSellerRequestSubmit} className="seller-register-form mt-3">
                                            <h5 className="mb-3 text-primary border-bottom pb-2">1. Thông tin cá nhân</h5>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Họ và tên</label>
                                                    <input type="text" className="form-control" name="fullName" value={sellerForm.fullName} onChange={handleSellerChange} required />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Số điện thoại</label>
                                                    <input type="tel" className="form-control" name="phone" value={sellerForm.phone} onChange={handleSellerChange} required />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control bg-light" name="email" value={sellerForm.email} readOnly />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Số CMND/CCCD</label>
                                                    <input type="text" className="form-control" name="idCardNumber" value={sellerForm.idCardNumber} onChange={handleSellerChange} required />
                                                </div>
                                            </div>

                                            <h5 className="mb-3 text-primary border-bottom pb-2">2. Thông tin cửa hàng</h5>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Tên shop</label>
                                                    <input type="text" className="form-control" name="shopName" value={sellerForm.shopName} onChange={handleSellerChange} required />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Địa chỉ kho hàng</label>
                                                    <input type="text" className="form-control" name="shopAddress" value={sellerForm.shopAddress} onChange={handleSellerChange} required />
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Mô tả shop</label>
                                                    <textarea className="form-control" name="shopDescription" rows="3" value={sellerForm.shopDescription} onChange={handleSellerChange} required></textarea>
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Logo shop</label>
                                                    <input type="file" className="form-control" name="shopLogo" accept="image/*" onChange={handleSellerFileChange} />
                                                </div>
                                            </div>

                                            <h5 className="mb-3 text-primary border-bottom pb-2">3. Thông tin pháp lý</h5>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Ảnh CMND/CCCD mặt trước</label>
                                                    <input type="file" className="form-control" name="idCardFront" accept="image/*" onChange={handleSellerFileChange} required />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Ảnh CMND/CCCD mặt sau</label>
                                                    <input type="file" className="form-control" name="idCardBack" accept="image/*" onChange={handleSellerFileChange} required />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Giấy phép kinh doanh</label>
                                                    <input type="file" className="form-control" name="businessLicense" accept="image/*" onChange={handleSellerFileChange} />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Tài khoản ngân hàng</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="bankAccount"
                                                        placeholder="Ví dụ: 123456789 - VCB - Nguyen Van A"
                                                        value={sellerForm.bankAccount}
                                                        onChange={handleSellerChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                                    {loading ? 'Đang gửi...' : 'Gửi hồ sơ'}
                                                </button>
                                                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowSellerForm(false)} disabled={loading}>
                                                    Hủy
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div>
                                            <p>Trở thành người bán để bắt đầu đăng sản phẩm của riêng bạn và tiếp cận thêm nhiều khách hàng trên TechShop.</p>
                                            <button className="btn btn-primary" onClick={() => setShowSellerForm(true)} disabled={loading}>
                                                <i className="bi bi-pencil-square me-2"></i> Điền hồ sơ đăng ký
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="profile-menu">
                            <div className="menu-title">Tài khoản</div>
                            <button className="menu-item" onClick={() => navigate('/profile')}>
                                <i className="bi bi-person"></i>
                                <span>Hồ sơ</span>
                            </button>
                            <button className="menu-item" onClick={() => navigate('/change-password')}>
                                <i className="bi bi-lock"></i>
                                <span>Đổi mật khẩu</span>
                            </button>

                            <div className="menu-title mt-4">Tiện ích</div>
                            <button className="menu-item" onClick={() => navigate('/orders')}>
                                <i className="bi bi-bag"></i>
                                <span>Đơn hàng</span>
                            </button>

                            <div className="menu-title mt-4">Khác</div>
                            <button
                                className="menu-item text-danger"
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
