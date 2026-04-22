import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Products from '../pages/Products';
import CategoryPage from '../pages/CategoryPage';
import ProductDetail from '../pages/ProductDetail';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminProducts from '../pages/AdminProducts';
import AdminSellerRequests from '../pages/AdminSellerRequests';
import AdminCategories from '../pages/AdminCategories';
import AdminOrders from '../pages/AdminOrders';
import VoucherManagement from '../pages/VoucherManagement';
import Layout from '../components/layout';
import AdminLayout from '../components/admin-layout';
import SellerLayout from '../components/seller-layout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';
import SellerDashboard from '../pages/SellerDashboard';
import SellerProducts from '../pages/SellerProducts';
import SellerOrders from '../pages/SellerOrders';
import AuthRouteRedirect from '../pages/AuthRouteRedirect';

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main Routes */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <CartPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrdersPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <CheckoutPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <AdminDashboard />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <AdminUsers />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/products"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <AdminProducts />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/categories"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <AdminCategories />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/orders"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <AdminOrders />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/seller-requests"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <AdminSellerRequests />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/vouchers"
                    element={
                        <AdminRoute>
                            <AdminLayout>
                                <VoucherManagement />
                            </AdminLayout>
                        </AdminRoute>
                    }
                />

                <Route
                    path="/seller"
                    element={
                        <SellerRoute>
                            <SellerLayout>
                                <SellerDashboard />
                            </SellerLayout>
                        </SellerRoute>
                    }
                />
                <Route
                    path="/seller/products"
                    element={
                        <SellerRoute>
                            <SellerLayout>
                                <SellerProducts />
                            </SellerLayout>
                        </SellerRoute>
                    }
                />
                <Route
                    path="/seller/orders"
                    element={
                        <SellerRoute>
                            <SellerLayout>
                                <SellerOrders />
                            </SellerLayout>
                        </SellerRoute>
                    }
                />
                <Route
                    path="/seller/vouchers"
                    element={
                        <SellerRoute>
                            <SellerLayout>
                                <VoucherManagement />
                            </SellerLayout>
                        </SellerRoute>
                    }
                />

                <Route path="/login" element={<AuthRouteRedirect modal="login" />} />
                <Route path="/register" element={<AuthRouteRedirect modal="register" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
