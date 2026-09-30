import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Initial auth check
    useEffect(() => {
        const verifyUser = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                try {
                    const res = await api.get('/auth/profile');
                    if (res.success && res.data) {
                        setUser(res.data);
                        localStorage.setItem('user', JSON.stringify(res.data));
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Session verification error:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyUser();
    }, []);

    // Login action
    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.success && res.data) {
            const { user: userData, token: jwtToken } = res.data;
            setUser(userData);
            setToken(jwtToken);
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }
        throw new Error(res.message || 'Login failed');
    };

    // Register action
    const register = async (formData) => {
        const res = await api.post('/auth/register', formData);
        if (res.success && res.data) {
            const { user: userData, token: jwtToken } = res.data;
            setUser(userData);
            setToken(jwtToken);
            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        }
        throw new Error(res.message || 'Registration failed');
    };

    // Logout action
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // Update user profile in context state
    const updateUserProfile = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        role: user ? user.role : null,
        isAdmin: user ? user.role === 'ADMIN' : false,
        isManager: user ? user.role === 'MANAGER' : false,
        isEmployee: user ? user.role === 'EMPLOYEE' : false,
        login,
        register,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
