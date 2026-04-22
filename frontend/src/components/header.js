import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../services/shop';
import './header.css';
import Login from '../pages/Login';
import Register from '../pages/Register';

function Header() {
    const [collapsed, setCollapsed] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const displayName = user?.lastName || user?.firstName || user?.email;
    const canAccessSeller = user?.role === 'seller' || user?.role === 'admin' || user?.sellerStatus === 'active';

    useEffect(() => {
        if (isAuthenticated && user) {
            setShowLoginModal(false);
            setShowRegisterModal(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        const openLoginModal = () => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
        };

        const openRegisterModal = () => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
        };

        if (typeof window !== 'undefined') {
            if (window.sessionStorage.getItem('open-login-modal') === '1') {
                window.sessionStorage.removeItem('open-login-modal');
                openLoginModal();
            }

            if (window.sessionStorage.getItem('open-register-modal') === '1') {
                window.sessionStorage.removeItem('open-register-modal');
                openRegisterModal();
            }
        }

        window.addEventListener('open-login-modal', openLoginModal);
        window.addEventListener('open-register-modal', openRegisterModal);

        return () => {
            window.removeEventListener('open-login-modal', openLoginModal);
            window.removeEventListener('open-register-modal', openRegisterModal);
        };
    }, []);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!isAuthenticated || !user) {
                setCartCount(0);
                return;
            }

            try {
                const response = await getCart(user.id);
                const items = response.data?.items || [];
                const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                setCartCount(totalQuantity);
            } catch (error) {
                setCartCount(0);
            }
        };

        fetchCartCount();

        const handleCartUpdated = (event) => {
            const items = event.detail?.items || [];
            const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

            if (event.detail?.items) {
                setCartCount(totalQuantity);
                return;
            }

            fetchCartCount();
        };

        window.addEventListener('cart-updated', handleCartUpdated);

        return () => {
            window.removeEventListener('cart-updated', handleCartUpdated);
        };
    }, [isAuthenticated, user]);

    const navigateSearch = () => {
        const q = document.getElementById('header-search-input')?.value || '';
        if (q.trim()) navigate(`/products?q=${encodeURIComponent(q.trim())}`);
        else navigate('/products');
        setCollapsed(true);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    return (
            <div>
            <div className="top-bar text-white text-center py-2">
                <small><i className="bi bi-star-fill"></i> Ưu đãi công nghệ chính hãng, giao nhanh trên toàn quốc</small>
            </div>

            <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
                <div className="container">
                    <button className="navbar-brand btn btn-link text-decoration-none p-0" onClick={() => navigate('/')}>
                        <span className="logo">
                            <i className="bi bi-laptop"></i> TechShop
                        </span>
                    </button>

                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label="Toggle navigation"
                    >
                        <i className="bi bi-list"></i>
                    </button>

                    <div className={`collapse navbar-collapse ${!collapsed ? 'show' : ''}`}>
                        <div className="mx-auto w-75 search-container me-3 mb-2 mb-lg-0">
                            <div className="input-group input-group-custom">
                                <input
                                    type="text"
                                    id="header-search-input"
                                    className="form-control search-input"
                                    placeholder="Tìm kiếm sản phẩm..."
                                />
                                <button className="btn btn-search" type="button" onClick={navigateSearch}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                        </div>

                        <div className="d-flex gap-3 align-items-center header-icons">
                            {isAuthenticated && user && (
                                <>
                                    <button className="icon-btn position-relative" type="button" title="Giỏ hàng" onClick={() => navigate('/cart')}>
                                        <i className="bi bi-cart3"></i>
                                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                                    </button>
                                </>
                            )}

                            {isAuthenticated && user ? (
                                <div className="user-menu-container">
                                    <button
                                        className="user-header-btn d-flex align-items-center gap-2"
                                        type="button"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        title={displayName}
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={displayName} className="user-avatar-img" />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                <i className="bi bi-person-circle"></i>
                                            </div>
                                        )}
                                        <span className="user-header-name d-none d-lg-inline">{displayName}</span>
                                    </button>
                                    {showUserMenu && (
                                        <div className="user-dropdown">
                                            <div className="dropdown-header">
                                                <p className="user-name">{displayName || 'Tài khoản'}</p>
                                                <p className="user-email">{user.email}</p>
                                            </div>
                                            <hr />
                                            <button className="dropdown-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                                                <i className="bi bi-person"></i> Hồ sơ
                                            </button>
                                            <button className="dropdown-item" onClick={() => { navigate('/orders'); setShowUserMenu(false); }}>
                                                <i className="bi bi-bag"></i> Đơn hàng
                                            </button>
                                            {user.role === 'admin' && (
                                                <>
                                                    <hr />
                                                    <button className="dropdown-item" onClick={() => { navigate('/admin'); setShowUserMenu(false); }}>
                                                        <i className="bi bi-graph-up"></i> Quản lý hệ thống
                                                    </button>
                                                </>
                                            )}
                                            {canAccessSeller && (
                                                <>
                                                    <hr />
                                                    <button className="dropdown-item" onClick={() => { navigate('/seller'); setShowUserMenu(false); }}>
                                                        <i className="bi bi-shop"></i> Kênh người bán
                                                    </button>
                                                </>
                                            )}
                                            <hr />
                                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                                                <i className="bi bi-box-arrow-right"></i> Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button className="icon-btn" type="button" title="Tài khoản" onClick={() => {
                                    setShowRegisterModal(false);
                                    setShowLoginModal(true);
                                }}>
                                    <i className="bi bi-person"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <Login
                show={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onShowRegister={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                }}
            />

            <Register
                show={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onShowLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
            />
        </div>
    );
}

export default Header;
