import React from 'react';
import { useAuth } from '../context/AuthContext';

function AdminTest() {
    const { user } = useAuth();

    return (
        <div style={{ padding: '20px', color: '#333' }}>
            <h1>✅ Admin Page Loaded</h1>
            <p>Logged in as: <strong>{user?.username || user?.email}</strong></p>
            <p>Role: <strong>{user?.role}</strong></p>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                {JSON.stringify(user, null, 2)}
            </pre>
        </div>
    );
}

export default AdminTest;
