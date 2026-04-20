import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin-layout.css';

function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const displayName = user?.lastName || user?.firstName || user?.email;

    const menuItems = [
        { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin' },
        { label: 'Nguoi dung', icon: 'bi-people', path: '/admin/users' },
        { label: 'San pham', icon: 'bi-box', path: '/admin/products' },
        { label: 'Yeu cau ban hang', icon: 'bi-person-check', path: '/admin/seller-requests' },
        { label: 'Danh muc', icon: 'bi-list', path: '/admin/categories' },
        { label: 'Don hang', icon: 'bi-bag-check', path: '/admin/orders' },
        { label: 'Voucher', icon: 'bi-ticket-perforated', path: '/admin/vouchers' }
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
                        <i className="bi bi-graph-up"></i>
                        {sidebarOpen && 'Admin'}
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
                    <button className="btn btn-danger w-100" onClick={handleLogout} title="Dang xuat">
                        <i className="bi bi-box-arrow-right"></i>
                        {sidebarOpen && 'Dang xuat'}
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button className="btn-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <i className="bi bi-list"></i>
                        </button>
                        <h1 className="page-title">TechShop Admin</h1>
                    </div>
                    <div className="header-right">
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

                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
