import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to parse saved user from localStorage:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const { token, email, role } = response.data;
            
            localStorage.setItem('token', token);
            const userPayload = { username, email, role };
            localStorage.setItem('user', JSON.stringify(userPayload));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(userPayload);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Invalid username or password.'
            };
        }
    };

    const register = async (username, email, password, role) => {
        try {
            await axios.post('/api/auth/register', { username, email, password, role });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = async (email, password) => {
        try {
            const response = await axios.put('/api/auth/profile', { email, password });
            const updated = response.data;
            const updatedUser = { ...user, email: updated.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile.'
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
