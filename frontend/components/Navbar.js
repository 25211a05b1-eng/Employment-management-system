import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="top-navbar">
            <div className="d-flex align-items-center gap-3">
                <button 
                    className="btn btn-sm btn-outline-secondary d-lg-none"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Navigation"
                >
                    <i className="bi bi-list fs-5"></i>
                </button>
                <span className="text-muted small d-none d-md-inline">
                    Employee Leave Management System
                </span>
            </div>

            <div className="d-flex align-items-center gap-3">
                {user && (
                    <div className="dropdown">
                        <button 
                            className="btn btn-light d-flex align-items-center gap-2 border px-2 py-1 rounded-pill"
                            type="button" 
                            id="userDropdown" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                        >
                            <div className="avatar-circle">
                                {getInitials(user.name)}
                            </div>
                            <div className="text-start d-none d-sm-block me-1">
                                <div className="fw-semibold small lh-1 text-dark">{user.name}</div>
                                <span className={`role-badge ${user.role} mt-1 d-inline-block`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                    {user.role}
                                </span>
                            </div>
                            <i className="bi bi-chevron-down text-muted small"></i>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border" aria-labelledby="userDropdown">
                            <li className="dropdown-header">
                                <div className="fw-bold text-dark">{user.name}</div>
                                <small className="text-muted">{user.email}</small>
                                <div className="small text-muted mt-1">ID: {user.employee_id}</div>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                                    <i className="bi bi-person text-primary"></i> My Profile
                                </Link>
                            </li>
                            {user.role === 'ADMIN' && (
                                <li>
                                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/admin/dashboard">
                                        <i className="bi bi-speedometer2 text-danger"></i> Admin Dashboard
                                    </Link>
                                </li>
                            )}
                            {user.role === 'MANAGER' && (
                                <li>
                                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/manager/dashboard">
                                        <i className="bi bi-kanban text-info"></i> Manager Dashboard
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link className="dropdown-item d-flex align-items-center gap-2" to="/employee/dashboard">
                                    <i className="bi bi-calendar-check text-success"></i> Leave Dashboard
                                </Link>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button 
                                    className="dropdown-item text-danger d-flex align-items-center gap-2" 
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
