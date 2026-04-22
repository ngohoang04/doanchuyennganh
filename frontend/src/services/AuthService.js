import api from './Api';

const getApiBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const normalizeAuthError = (error, fallbackMessage) => {
    if (!error.response) {
        return {
            message: `Không thể kết nối tới backend tại ${getApiBaseUrl()}. Hãy kiểm tra backend đang chạy và đúng cổng.`
        };
    }

    const backendMessage = error.response?.data?.message;
    if (error.response?.status === 401 && backendMessage?.startsWith('Not authorized')) {
        return { message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' };
    }

    return error.response?.data || { message: fallbackMessage };
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    } catch (error) {
        if (!error.response) {
            throw new Error(`Không thể kết nối tới backend tại ${getApiBaseUrl()}. Hãy khởi động backend rồi thử lại.`);
        }
        throw new Error(error.response?.data?.message || error.message || 'Lỗi khi đăng nhập');
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Lỗi khi đăng ký');
    }
};

export const socialLogin = async (provider, accessToken) => {
    try {
        const response = await api.post('/auth/social', { provider, accessToken });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    } catch (error) {
        if (!error.response) {
            throw new Error(`Không thể kết nối tới backend tại ${getApiBaseUrl()}. Hãy khởi động backend rồi thử lại.`);
        }
        throw new Error(error.response?.data?.message || 'Lỗi khi đăng nhập mạng xã hội');
    }
};

export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email }, { skipAuthRedirect: true });
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Không thể gửi email đặt lại mật khẩu');
    }
};

export const resetPasswordWithToken = async (token, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { token, newPassword }, { skipAuthRedirect: true });
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Không thể đặt lại mật khẩu');
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        localStorage.removeItem('user');
        return null;
    }
};

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => Boolean(localStorage.getItem('token'));

export const getCurrentUser = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`, {
            skipAuthRedirect: true
        });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Lỗi khi tải thông tin tài khoản');
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/users/${userId}`, userData, {
            skipAuthRedirect: true
        });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Lỗi khi cập nhật thông tin');
    }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    try {
        const response = await api.post(`/auth/change-password/${userId}`, {
            oldPassword,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Lỗi khi đổi mật khẩu');
    }
};

export const submitSellerRequest = async (userId, sellerData) => {
    try {
        const response = await api.post(`/users/${userId}/seller-request`, sellerData, {
            skipAuthRedirect: true
        });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return updateUser(userId, {
                ...sellerData,
                sellerStatus: 'pending'
            });
        }
        throw normalizeAuthError(error, 'Lỗi khi gửi hồ sơ người bán');
    }
};
