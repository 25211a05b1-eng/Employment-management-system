import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department_id: '',
        manager_id: '',
        joining_date: new Date().toISOString().split('T')[0]
    });

    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // Fetch departments and managers on component mount
    useEffect(() => {
        const loadFormData = async () => {
            try {
                // Fetch public departments and managers list
                const [deptRes, mgrRes] = await Promise.all([
                    fetch('/api/departments').then(r => r.json()).catch(() => ({ data: [] })),
                    fetch('/api/employees/managers').then(r => r.json()).catch(() => ({ data: [] }))
                ]);
                if (deptRes.data) setDepartments(deptRes.data);
                if (mgrRes.data) setManagers(mgrRes.data);
            } catch (err) {
                console.error('Error loading dropdown data:', err);
            }
        };
        loadFormData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Full Name is required.');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Email address is required.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Please enter a valid email address.');
            return false;
        }

        if (!formData.password) {
            setError('Password is required.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }

        if (formData.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone)) {
            setError('Please enter a valid phone number.');
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
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                phone: formData.phone.trim() || null,
                department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
                manager_id: formData.manager_id ? parseInt(formData.manager_id, 10) : null,
                joining_date: formData.joining_date
            };

            await register(payload);
            navigate('/employee/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card" style={{ maxWidth: '560px' }}>
            <div className="auth-header">
                <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-2">
                    <i className="bi bi-person-plus-fill fs-2 text-primary"></i>
                </div>
                <h3>Employee Registration</h3>
                <p className="text-muted small mb-0">Join your organization's Leave Management Portal</p>
            </div>

            <div className="auth-body">
                <ErrorMessage message={error} onDismiss={() => setError('')} />

                <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label fw-semibold small text-muted">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="e.g. Rahul Verma"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-muted">Work Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-muted">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-control"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-muted">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-muted">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-muted">Department</label>
                            <select
                                name="department_id"
                                className="form-select"
                                value={formData.department_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold small text-muted">Reporting Manager</label>
                            <select
                                name="manager_id"
                                className="form-select"
                                value={formData.manager_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Manager</option>
                                {managers.map(mgr => (
                                    <option key={mgr.id} value={mgr.id}>{mgr.name} ({mgr.department_name || 'Management'})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="form-label fw-semibold small text-muted">Joining Date</label>
                            <input
                                type="date"
                                name="joining_date"
                                className="form-control"
                                value={formData.joining_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary-custom w-100 py-2 mt-4 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check2-circle"></i>
                                <span>Complete Registration</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p className="text-muted small mb-0">
                        Already have an account? <Link to="/login" className="fw-semibold text-decoration-none">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
