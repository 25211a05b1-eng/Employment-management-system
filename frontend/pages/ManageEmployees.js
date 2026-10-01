import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ManageEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false); // false | 'add' | 'edit' | 'view'
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'EMPLOYEE',
        department_id: '',
        manager_id: '',
        joining_date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (roleFilter) queryParams.append('role', roleFilter);
            if (statusFilter) queryParams.append('status', statusFilter);

            const [empRes, deptRes, mgrRes] = await Promise.all([
                api.get(`/employees?${queryParams.toString()}`),
                api.get('/departments'),
                api.get('/employees/managers')
            ]);

            if (empRes.success) setEmployees(empRes.data);
            if (deptRes.success) setDepartments(deptRes.data);
            if (mgrRes.success) setManagers(mgrRes.data);
        } catch (err) {
            setError(err.message || 'Error loading employee records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search, roleFilter, statusFilter]);

    const openAddModal = () => {
        setCurrentEmployee(null);
        setFormData({
            employee_id: '',
            name: '',
            email: '',
            password: '',
            phone: '',
            role: 'EMPLOYEE',
            department_id: '',
            manager_id: '',
            joining_date: new Date().toISOString().split('T')[0],
            status: 'ACTIVE'
        });
        setModalError('');
        setShowModal('add');
    };

    const openEditModal = (emp) => {
        setCurrentEmployee(emp);
        setFormData({
            employee_id: emp.employee_id,
            name: emp.name,
            email: emp.email,
            password: '', // Blank unless changing
            phone: emp.phone || '',
            role: emp.role,
            department_id: emp.department_id || '',
            manager_id: emp.manager_id || '',
            joining_date: emp.joining_date || '',
            status: emp.status
        });
        setModalError('');
        setShowModal('edit');
    };

    const openViewModal = async (emp) => {
        try {
            const res = await api.get(`/employees/${emp.id}`);
            if (res.success) {
                setCurrentEmployee(res.data);
                setShowModal('view');
            }
        } catch (err) {
            setError(err.message || 'Error fetching employee details.');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setModalError('');

        if (!formData.name.trim() || !formData.email.trim()) {
            setModalError('Name and email are required.');
            return;
        }

        if (showModal === 'add' && !formData.password) {
            setModalError('Password is required for new employee creation.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
                manager_id: formData.manager_id ? parseInt(formData.manager_id, 10) : null
            };

            if (showModal === 'add') {
                const res = await api.post('/employees', payload);
                if (res.success) {
                    setSuccessMsg('Employee created successfully with default leave balances.');
                }
            } else if (showModal === 'edit') {
                // If password empty, don't send
                if (!payload.password) delete payload.password;
                const res = await api.put(`/employees/${currentEmployee.id}`, payload);
                if (res.success) {
                    setSuccessMsg('Employee profile updated successfully.');
                }
            }

            setShowModal(false);
            loadData();
        } catch (err) {
            setModalError(err.message || 'Error saving employee.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (emp) => {
        const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const confirmMsg = `Are you sure you want to change ${emp.name}'s status to ${newStatus}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.put(`/employees/${emp.id}`, { status: newStatus });
            setSuccessMsg(`Status for ${emp.name} updated to ${newStatus}.`);
            loadData();
        } catch (err) {
            setError(err.message || 'Error updating status.');
        }
    };

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Employee Management
                    </h2>
                    <p className="text-muted mb-0">
                        Create, view, edit, configure departments, and manage manager assignments.
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <button className="btn btn-primary-custom d-inline-flex align-items-center gap-2" onClick={openAddModal}>
                        <i className="bi bi-person-plus-fill"></i>
                        <span>Add New Employee</span>
                    </button>
                </div>
            </div>

            <ErrorMessage message={error} onDismiss={() => setError('')} />

            {successMsg && (
                <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div className="flex-grow-1">{successMsg}</div>
                    <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="card border-0 shadow-sm p-3 rounded-3 bg-white mb-4">
                <div className="row g-3">
                    <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold text-muted mb-1">Search Employee:</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, ID or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Filter by Role:</label>
                        <select
                            className="form-select form-select-sm"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            <option value="EMPLOYEE">Employees</option>
                            <option value="MANAGER">Managers</option>
                            <option value="ADMIN">Administrators</option>
                        </select>
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Filter by Status:</label>
                        <select
                            className="form-select form-select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="INACTIVE">Inactive Only</option>
                        </select>
                    </div>

                    <div className="col-12 col-md-2 text-md-end pt-md-4">
                        <span className="text-muted small">Total: <strong>{employees.length}</strong></span>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                {loading ? (
                    <Loading message="Loading employee directory..." />
                ) : employees.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-people fs-1 d-block mb-2 text-muted"></i>
                        <h5>No employees found</h5>
                        <p className="small mb-3">No matching employee records for this search criteria.</p>
                        <button className="btn btn-sm btn-primary-custom" onClick={openAddModal}>
                            Add Employee
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Emp ID</th>
                                    <th>Name</th>
                                    <th>Email & Phone</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Manager</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="fw-bold text-dark">{emp.employee_id}</td>
                                        <td>
                                            <div className="fw-semibold text-dark">{emp.name}</div>
                                            <small className="text-muted">Joined {emp.joining_date}</small>
                                        </td>
                                        <td className="small">
                                            <div>{emp.email}</div>
                                            <div className="text-muted">{emp.phone || '—'}</div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${emp.role}`}>{emp.role}</span>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {emp.department_name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="small text-muted">
                                            {emp.manager_name || 'None'}
                                        </td>
                                        <td>
                                            <span className={`badge ${emp.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => openViewModal(emp)}
                                                    title="View Details & Balances"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => openEditModal(emp)}
                                                    title="Edit Employee"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className={`btn ${emp.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                    onClick={() => handleToggleStatus(emp)}
                                                    title={emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                >
                                                    <i className={`bi ${emp.status === 'ACTIVE' ? 'bi-person-x' : 'bi-person-check'}`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Add / Edit Employee */}
            {(showModal === 'add' || showModal === 'edit') && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold text-dark">
                                    {showModal === 'add' ? 'Add New Employee' : `Edit Employee: ${currentEmployee?.name}`}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleFormSubmit}>
                                <div className="modal-body p-4">
                                    <ErrorMessage message={modalError} onDismiss={() => setModalError('')} />

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Employee ID</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. EMP010 (Leave blank for auto)"
                                                value={formData.employee_id}
                                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Full Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Work Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">
                                                {showModal === 'add' ? 'Password *' : 'Password (Leave blank to keep unchanged)'}
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder={showModal === 'add' ? 'Min 6 characters' : 'Enter new password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required={showModal === 'add'}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Role</label>
                                            <select
                                                className="form-select"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="EMPLOYEE">Employee</option>
                                                <option value="MANAGER">Manager</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Department</label>
                                            <select
                                                className="form-select"
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            >
                                                <option value="">Unassigned</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Reporting Manager</label>
                                            <select
                                                className="form-select"
                                                value={formData.manager_id}
                                                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                                            >
                                                <option value="">No Manager Assigned</option>
                                                {managers
                                                    .filter(m => currentEmployee ? m.id !== currentEmployee.id : true)
                                                    .map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} ({m.department_name || 'Management'})</option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Joining Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.joining_date}
                                                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-muted">Status</label>
                                            <select
                                                className="form-select"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary-custom" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            showModal === 'add' ? 'Create Employee' : 'Update Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: View Details & Balances */}
            {showModal === 'view' && currentEmployee && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold text-dark">
                                    Employee Profile: {currentEmployee.name}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded border">
                                            <h6 className="fw-bold text-dark mb-2">Personal & Employment</h6>
                                            <div className="small">
                                                <div className="mb-1"><strong>ID:</strong> {currentEmployee.employee_id}</div>
                                                <div className="mb-1"><strong>Email:</strong> {currentEmployee.email}</div>
                                                <div className="mb-1"><strong>Phone:</strong> {currentEmployee.phone || 'None'}</div>
                                                <div className="mb-1"><strong>Joined:</strong> {currentEmployee.joining_date}</div>
                                                <div><strong>Status:</strong> <span className="badge bg-success-subtle text-success">{currentEmployee.status}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded border">
                                            <h6 className="fw-bold text-dark mb-2">Organization Placement</h6>
                                            <div className="small">
                                                <div className="mb-1"><strong>Role:</strong> <span className={`role-badge ${currentEmployee.role}`}>{currentEmployee.role}</span></div>
                                                <div className="mb-1"><strong>Department:</strong> {currentEmployee.department_name || 'Unassigned'}</div>
                                                <div className="mb-1"><strong>Reporting Manager:</strong> {currentEmployee.manager_name || 'None Assigned'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold text-dark mb-2">Allocated Leave Balances (2026)</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Leave Type</th>
                                                <th>Type</th>
                                                <th className="text-center">Total Allocated</th>
                                                <th className="text-center">Used Days</th>
                                                <th className="text-center">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentEmployee.balances && currentEmployee.balances.length > 0 ? (
                                                currentEmployee.balances.map(b => (
                                                    <tr key={b.id}>
                                                        <td className="fw-semibold">{b.leave_type_name}</td>
                                                        <td>{b.paid ? 'Paid' : 'Unpaid'}</td>
                                                        <td className="text-center">{b.total_days}</td>
                                                        <td className="text-center text-danger">{b.used_days}</td>
                                                        <td className="text-center fw-bold text-success">{b.remaining_days}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted">No balance records found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-top">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageEmployees;
