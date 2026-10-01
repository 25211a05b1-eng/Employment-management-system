import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if redirected from expired session
    const isSessionExpired = new URLSearchParams(location.search).get('expired') === 'true';

    const validateForm = () => {
        if (!email.trim()) {
            setError('Please enter your work email.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email format.');
            return false;
        }
        if (!password) {
            setError('Please enter your password.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = await login(email.trim(), password);
            // Redirect based on user role
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (user.role === 'MANAGER') {
                navigate('/manager/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Quick fill helper for evaluator convenience
    const fillCredentials = (roleEmail, rolePass) => {
        setEmail(roleEmail);
        setPassword(rolePass);
        setError('');
    };

    return (
        <div className="auth-card">
            <div className="auth-header">
                <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-2">
                    <i className="bi bi-shield-lock-fill fs-2 text-primary"></i>
                </div>
                <h3>Welcome Back</h3>
                <p className="text-muted small mb-0">Sign in to your Employee Leave Management account</p>
            </div>

            <div className="auth-body">
                {isSessionExpired && (
                    <div className="alert alert-warning py-2 small" role="alert">
                        Your session has expired. Please log in again.
                    </div>
                )}

                <ErrorMessage message={error} onDismiss={() => setError('')} />

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label className="form-label fw-semibold small text-muted">Work Email</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light text-muted">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label fw-semibold small text-muted mb-0">Password</label>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-light text-muted">
                                <i className="bi bi-key"></i>
                            </span>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Quick Test Login Buttons for Academic Demo */}
                <div className="mt-4 pt-3 border-top">
                    <p className="text-muted small text-center mb-2 fw-semibold">Quick Demo Login (1-Click Fill):</p>
                    <div className="d-grid gap-2">
                        <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger d-flex justify-content-between align-items-center"
                            onClick={() => fillCredentials('admin@company.com', 'Admin@123')}
                        >
                            <span><i className="bi bi-shield-check me-1"></i> Admin</span>
                            <small className="opacity-75">admin@company.com</small>
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary d-flex justify-content-between align-items-center"
                            onClick={() => fillCredentials('manager.eng@company.com', 'Manager@123')}
                        >
                            <span><i className="bi bi-person-badge me-1"></i> Manager (Eng)</span>
                            <small className="opacity-75">manager.eng@company.com</small>
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-sm btn-outline-success d-flex justify-content-between align-items-center"
                            onClick={() => fillCredentials('rahul.verma@company.com', 'Employee@123')}
                        >
                            <span><i className="bi bi-person me-1"></i> Employee (Rahul)</span>
                            <small className="opacity-75">rahul.verma@company.com</small>
                        </button>
                    </div>
                </div>

                <div className="text-center mt-3">
                    <p className="text-muted small mb-0">
                        New employee? <Link to="/register" className="fw-semibold text-decoration-none">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
