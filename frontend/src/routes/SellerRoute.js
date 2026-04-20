import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SellerRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();
    const canAccessSeller = user?.role === 'seller' || user?.role === 'admin' || user?.sellerStatus === 'active';

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    if (!canAccessSeller) {
        return <Navigate to="/" />;
    }

    return children;
}

export default SellerRoute;
