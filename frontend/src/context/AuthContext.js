import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const token = AuthService.getToken();
        const storedUser = AuthService.getUser();

        const syncUser = async () => {
            if (token && storedUser) {
                setUser(storedUser);
                setIsAuthenticated(true);

                try {
                    const freshUser = await AuthService.getCurrentUser(storedUser.id);
                    setUser(freshUser);
                } catch (error) {
                    console.error('Failed to sync current user:', error);
                }
            }
            setLoading(false);
        };

        syncUser();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const data = await AuthService.login(email, password);
            setUser(data.user);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const data = await AuthService.register(userData);
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const updateUser = useCallback(async (userId, userData) => {
        try {
            const data = await AuthService.updateUser(userId, userData);
            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const submitSellerRequest = useCallback(async (userId, sellerData) => {
        try {
            const data = await AuthService.submitSellerRequest(userId, sellerData);
            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const changePassword = useCallback(async (userId, oldPassword, newPassword) => {
        try {
            const data = await AuthService.changePassword(userId, oldPassword, newPassword);
            return data;
        } catch (error) {
            throw error;
        }
    }, []);

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        submitSellerRequest,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
