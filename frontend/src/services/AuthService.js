import api from './Api';

const getApiBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const normalizeAuthError = (error, fallbackMessage) => {
    if (!error.response) {
        return {
            message: `Khong the ket noi toi backend tai ${getApiBaseUrl()}. Hay kiem tra backend dang chay va dung cong.`
        };
    }
    const backendMessage = error.response?.data?.message;
    if (error.response?.status === 401 && backendMessage?.startsWith('Not authorized')) {
        return { message: 'Phien dang nhap da het han hoac khong hop le. Vui long dang nhap lai.' };
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
            throw new Error(`Khong the ket noi toi backend tai ${getApiBaseUrl()}. Hay khoi dong backend roi thu lai.`);
        }
        const errorMessage = error.response?.data?.message || error.message || 'Loi khi dang nhap';
        throw new Error(errorMessage);
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw normalizeAuthError(error, 'Loi khi dang ky');
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
            throw new Error(`Khong the ket noi toi backend tai ${getApiBaseUrl()}. Hay khoi dong backend roi thu lai.`);
        }
        throw new Error(error.response?.data?.message || 'Loi khi dang nhap mang xa hoi');
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

export const getToken = () => {
    return localStorage.getItem('token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

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
        throw normalizeAuthError(error, 'Loi khi tai thong tin tai khoan');
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
        throw normalizeAuthError(error, 'Loi khi cap nhat thong tin');
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
        throw normalizeAuthError(error, 'Loi khi doi mat khau');
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
        throw normalizeAuthError(error, 'Loi khi gui ho so nguoi ban');
    }
};
