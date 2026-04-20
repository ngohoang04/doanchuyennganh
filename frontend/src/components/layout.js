import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import ChatWidget from './ChatWidget';

function Layout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, padding: '20px 0' }}>
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}

export default Layout;
