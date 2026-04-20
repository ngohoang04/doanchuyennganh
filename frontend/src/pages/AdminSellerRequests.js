import React, { useEffect, useState } from 'react';
import api from '../services/Api';
import './admin.css';

function AdminSellerRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchSellerRequests();
    }, []);

    const getDisplayName = (request) =>
        [request?.lastName, request?.firstName].filter(Boolean).join(' ') ||
        request?.email ||
        'Nguoi dung';

    const fetchSellerRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/users/seller-requests/pending');
            setRequests(response.data || []);
        } catch (err) {
            setError('Khong the tai danh sach yeu cau');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, displayName) => {
        if (!window.confirm(`Ban chac chan muon phe duyet ${displayName} tro thanh nguoi ban?`)) {
            return;
        }

        try {
            await api.post(`/users/seller-requests/${id}/approve`);
            setSuccessMessage(`Da phe duyet yeu cau cua ${displayName}`);
            fetchSellerRequests();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Khong the phe duyet yeu cau');
            console.error(err);
        }
    };

    const handleReject = async (id, displayName) => {
        if (!window.confirm(`Ban chac chan muon tu choi yeu cau cua ${displayName}?`)) {
            return;
        }

        try {
            await api.post(`/users/seller-requests/${id}/reject`);
            setSuccessMessage(`Da tu choi yeu cau cua ${displayName}`);
            fetchSellerRequests();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Khong the tu choi yeu cau');
            console.error(err);
        }
    };

    const handleViewDetail = (request) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header-section">
                <h2>Yeu cau tro thanh nguoi ban</h2>
                <p>Tong cong: {requests.length} yeu cau cho xu ly</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ten hien thi</th>
                            <th>Email</th>
                            <th>Ten shop</th>
                            <th>Yeu cau luc</th>
                            <th>Hanh dong</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((request) => {
                                const displayName = getDisplayName(request);

                                return (
                                    <tr key={request.id}>
                                        <td>#{request.id}</td>
                                        <td>
                                            <div className="user-cell">
                                                <img
                                                    src={request.avatar || 'https://via.placeholder.com/40'}
                                                    alt={displayName}
                                                    className="user-avatar-sm"
                                                />
                                                <div>
                                                    <p className="user-name">{displayName}</p>
                                                    <small>{request.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{request.email}</td>
                                        <td>{request.shopName || '-'}</td>
                                        <td className="text-muted">
                                            {new Date(request.updatedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleViewDetail(request)}
                                                style={{
                                                    background: '#e7f3ff',
                                                    color: '#0066cc',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 12px',
                                                    marginRight: '5px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                title="Xem chi tiet"
                                            >
                                                <i className="bi bi-eye"></i> Xem
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleApprove(request.id, displayName)}
                                                style={{
                                                    background: '#d4edda',
                                                    color: '#155724',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 12px',
                                                    marginRight: '5px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                title="Phe duyet"
                                            >
                                                <i className="bi bi-check-circle"></i> Phe duyet
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleReject(request.id, displayName)}
                                                style={{
                                                    background: '#f8d7da',
                                                    color: '#721c24',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                title="Tu choi"
                                            >
                                                <i className="bi bi-x-circle"></i> Tu choi
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    <div style={{ padding: '30px', color: '#999' }}>
                                        <i className="bi bi-inbox" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                                        Khong co yeu cau cho xu ly
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showDetailModal && selectedRequest && (
                <div
                    className="modal-overlay"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setShowDetailModal(false)}
                >
                    <div
                        className="modal-content"
                        style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Chi tiet ho so ban hang</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                            >
                                x
                            </button>
                        </div>

                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                            <h5 style={{ color: '#667eea', marginBottom: '10px' }}>1. Thong tin ca nhan</h5>
                            <p><strong>Ten hien thi:</strong> {getDisplayName(selectedRequest)}</p>
                            <p><strong>Email:</strong> {selectedRequest.email}</p>
                            <p><strong>Ho va ten:</strong> {[selectedRequest.firstName, selectedRequest.lastName].filter(Boolean).join(' ') || '-'}</p>
                            <p><strong>So dien thoai:</strong> {selectedRequest.phone || '-'}</p>
                            <p><strong>So CMND/CCCD:</strong> {selectedRequest.idCardNumber || '-'}</p>
                        </div>

                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                            <h5 style={{ color: '#667eea', marginBottom: '10px' }}>2. Thong tin cua hang</h5>
                            <p><strong>Ten shop:</strong> {selectedRequest.shopName || '-'}</p>
                            <p><strong>Dia chi kho hang:</strong> {selectedRequest.shopAddress || '-'}</p>
                            <p><strong>Mo ta shop:</strong> {selectedRequest.shopDescription || '-'}</p>
                            {selectedRequest.shopLogo && (
                                <div>
                                    <strong>Logo shop:</strong>
                                    <img src={selectedRequest.shopLogo} alt="Shop logo" style={{ maxWidth: '100px', marginTop: '5px', borderRadius: '4px' }} />
                                </div>
                            )}
                        </div>

                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                            <h5 style={{ color: '#667eea', marginBottom: '10px' }}>3. Thong tin phap ly</h5>
                            <p><strong>Tai khoan ngan hang:</strong> {selectedRequest.bankAccount || '-'}</p>
                            {selectedRequest.idCardFront && (
                                <div>
                                    <strong>Mat truoc CMND/CCCD:</strong>
                                    <img src={selectedRequest.idCardFront} alt="ID card front" style={{ maxWidth: '100%', marginTop: '5px', borderRadius: '4px' }} />
                                </div>
                            )}
                            {selectedRequest.idCardBack && (
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Mat sau CMND/CCCD:</strong>
                                    <img src={selectedRequest.idCardBack} alt="ID card back" style={{ maxWidth: '100%', marginTop: '5px', borderRadius: '4px' }} />
                                </div>
                            )}
                            {selectedRequest.businessLicense && (
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Giay phep kinh doanh:</strong>
                                    <img src={selectedRequest.businessLicense} alt="Business license" style={{ maxWidth: '100%', marginTop: '5px', borderRadius: '4px' }} />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn btn-outline-secondary"
                            >
                                Dong
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSellerRequests;
