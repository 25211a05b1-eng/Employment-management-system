import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <i className="bi bi-briefcase-fill brand-icon"></i>
                    <div>
                        <h4>Leave Portal</h4>
                        <small className="text-muted" style={{ fontSize: '0.72rem' }}>Enterprise Management</small>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* Admin Navigation */}
                    {user.role === 'ADMIN' && (
                        <>
                            <div className="sidebar-section-title">Administration</div>
                            <NavLink 
                                to="/admin/dashboard" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-speedometer2"></i>
                                <span>Admin Dashboard</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/leave-requests" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-check2-square"></i>
                                <span>Leave Approvals</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/employees" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-people"></i>
                                <span>Employees</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/departments" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-building"></i>
                                <span>Departments</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/leave-types" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-tags"></i>
                                <span>Leave Types</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/leave-balances" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-wallet2"></i>
                                <span>Leave Balances</span>
                            </NavLink>
                            <NavLink 
                                to="/admin/reports" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-bar-chart-line"></i>
                                <span>Reports & Analytics</span>
                            </NavLink>
                        </>
                    )}

                    {/* Manager Navigation */}
                    {user.role === 'MANAGER' && (
                        <>
                            <div className="sidebar-section-title">Team Management</div>
                            <NavLink 
                                to="/manager/dashboard" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-kanban"></i>
                                <span>Manager Dashboard</span>
                            </NavLink>
                            <NavLink 
                                to="/manager/leave-requests" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <i className="bi bi-card-checklist"></i>
                                <span>Team Requests</span>
                            </NavLink>
                        </>
                    )}

                    {/* Employee Navigation */}
                    <div className="sidebar-section-title">My Leaves</div>
                    <NavLink 
                        to="/employee/dashboard" 
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <i className="bi bi-grid-1x2"></i>
                        <span>My Dashboard</span>
                    </NavLink>
                    <NavLink 
                        to="/employee/apply-leave" 
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <i className="bi bi-calendar-plus"></i>
                        <span>Apply for Leave</span>
                    </NavLink>
                    <NavLink 
                        to="/employee/my-leaves" 
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <i className="bi bi-clock-history"></i>
                        <span>Leave History</span>
                    </NavLink>

                    {/* Account Settings */}
                    <div className="sidebar-section-title">Account</div>
                    <NavLink 
                        to="/profile" 
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <i className="bi bi-person-gear"></i>
                        <span>My Profile</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="fw-semibold text-white small">{user.employee_id}</div>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{user.department_name || 'No Dept'}</small>
                        </div>
                        <button 
                            className="btn btn-sm btn-outline-light border-0" 
                            onClick={logout}
                            title="Sign out"
                        >
                            <i className="bi bi-power fs-6"></i>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
