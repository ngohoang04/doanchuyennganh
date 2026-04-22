import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWidget from './ChatWidget';
import './admin-layout.css';

function SellerLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const displayName = user?.shopName || user?.lastName || user?.firstName || user?.email;

    const menuItems = [
        { label: 'Tổng quan', icon: 'bi-speedometer2', path: '/seller' },
        { label: 'Sản phẩm của tôi', icon: 'bi-box', path: '/seller/products' },
        { label: 'Đơn bán hàng', icon: 'bi-bag-check', path: '/seller/orders' },
        { label: 'Voucher', icon: 'bi-ticket-perforated', path: '/seller/vouchers' }
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3 className="sidebar-title">
                        <i className="bi bi-shop"></i>
                        {sidebarOpen && 'Seller'}
                    </h3>
                    <button className="btn-toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <i className="bi bi-chevron-left"></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            title={item.label}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="btn btn-danger w-100" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        {sidebarOpen && 'Đăng xuất'}
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button className="btn-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <i className="bi bi-list"></i>
                        </button>
                        <h1 className="page-title">TechShop Seller</h1>
                    </div>
                    <div className="header-right">
                        <button
                            type="button"
                            className="btn btn-outline-primary me-3"
                            onClick={() => navigate('/')}
                        >
                            <i className="bi bi-house-door me-2"></i>
                            Về trang chủ
                        </button>
                        <div className="user-info">
                            <span className="user-name">{displayName}</span>
                            <img
                                src={user?.avatar || 'https://via.placeholder.com/40'}
                                alt={displayName}
                                className="user-avatar"
                            />
                        </div>
                    </div>
                </header>

                <main className="admin-content">{children}</main>
                <ChatWidget />
            </div>
        </div>
    );
}

export default SellerLayout;
