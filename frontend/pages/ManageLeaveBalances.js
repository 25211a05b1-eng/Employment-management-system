import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ManageLeaveBalances = () => {
    const [balances, setBalances] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [searchEmp, setSearchEmp] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal state for editing balance
    const [editingBalance, setEditingBalance] = useState(null);
    const [totalDays, setTotalDays] = useState(0);
    const [usedDays, setUsedDays] = useState(0);
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadBalances = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (departmentFilter) queryParams.append('department_id', departmentFilter);

            const [balRes, deptRes] = await Promise.all([
                api.get(`/leave-balances?${queryParams.toString()}`),
                api.get('/departments')
            ]);

            if (balRes.success) setBalances(balRes.data);
            if (deptRes.success) setDepartments(deptRes.data);
        } catch (err) {
            setError(err.message || 'Error loading leave balances.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalances();
    }, [departmentFilter]);

    const openEditModal = (balance) => {
        setEditingBalance(balance);
        setTotalDays(balance.total_days);
        setUsedDays(balance.used_days);
        setModalError('');
    };

    const handleSaveBalance = async (e) => {
        e.preventDefault();
        setModalError('');

        const total = parseInt(totalDays, 10);
        const used = parseInt(usedDays, 10);

        if (isNaN(total) || total < 0) {
            setModalError('Total days must be a non-negative number.');
            return;
        }

        if (isNaN(used) || used < 0) {
            setModalError('Used days must be a non-negative number.');
            return;
        }

        if (total - used < 0) {
            setModalError(`Invalid balance! Remaining days cannot be negative (Total: ${total}, Used: ${used}).`);
            return;
        }

        setSaving(true);
        try {
            const res = await api.put(`/leave-balances/${editingBalance.id}`, {
                total_days: total,
                used_days: used
            });

            if (res.success) {
                setSuccessMsg(`Leave balance for ${editingBalance.employee_name} (${editingBalance.leave_type_name}) adjusted successfully.`);
                setEditingBalance(null);
                loadBalances();
            }
        } catch (err) {
            setModalError(err.message || 'Error updating leave balance.');
        } finally {
            setSaving(false);
        }
    };

    const filteredBalances = balances.filter(b => {
        if (!searchEmp.trim()) return true;
        const term = searchEmp.toLowerCase();
        return (
            (b.employee_name && b.employee_name.toLowerCase().includes(term)) ||
            (b.employee_id && b.employee_id.toLowerCase().includes(term)) ||
            (b.leave_type_name && b.leave_type_name.toLowerCase().includes(term))
        );
    });

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Leave Balance Configuration
                    </h2>
                    <p className="text-muted mb-0">
                        View, audit, and manually adjust employee leave quotas, used days, and remaining balances.
                    </p>
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

            {/* Filter Bar */}
            <div className="card border-0 shadow-sm p-3 rounded-3 bg-white mb-4">
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-5">
                        <label className="form-label small fw-semibold text-muted mb-1">Search Employee / Leave Type:</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, ID or leave type..."
                                value={searchEmp}
                                onChange={(e) => setSearchEmp(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold text-muted mb-1">Filter by Department:</label>
                        <select
                            className="form-select form-select-sm"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-3 text-md-end pt-md-3">
                        <span className="text-muted small">
                            Records: <strong>{filteredBalances.length}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* Balances Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                {loading ? (
                    <Loading message="Loading employee leave balances..." />
                ) : filteredBalances.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-wallet2 fs-1 d-block mb-2 text-muted"></i>
                        <h5>No leave balances found</h5>
                        <p className="small mb-0">No records match the current filter selection.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Leave Type</th>
                                    <th className="text-center">Total Days</th>
                                    <th className="text-center">Used Days</th>
                                    <th className="text-center">Remaining Days</th>
                                    <th className="text-center">Year</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBalances.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div className="fw-semibold text-dark">{b.employee_name}</div>
                                            <small className="text-muted">{b.employee_id}</small>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {b.department_name || 'General'}
                                            </span>
                                        </td>
                                        <td className="fw-semibold text-primary">
                                            {b.leave_type_name}
                                        </td>
                                        <td className="text-center fw-bold text-dark">{b.total_days}</td>
                                        <td className="text-center text-danger fw-semibold">{b.used_days}</td>
                                        <td className="text-center">
                                            <span className="badge bg-success-subtle text-success fs-6 border border-success-subtle">
                                                {b.remaining_days}
                                            </span>
                                        </td>
                                        <td className="text-center text-muted small">{b.year}</td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => openEditModal(b)}
                                            >
                                                <i className="bi bi-sliders me-1"></i> Adjust
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Adjust Leave Balance */}
            {editingBalance && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold text-dark">
                                    Adjust Leave Balance
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setEditingBalance(null)}></button>
                            </div>
                            <form onSubmit={handleSaveBalance}>
                                <div className="modal-body p-4">
                                    <ErrorMessage message={modalError} onDismiss={() => setModalError('')} />

                                    <div className="p-3 bg-light rounded border mb-3 small">
                                        <div><strong>Employee:</strong> {editingBalance.employee_name} ({editingBalance.employee_id})</div>
                                        <div><strong>Leave Type:</strong> {editingBalance.leave_type_name}</div>
                                        <div><strong>Year:</strong> {editingBalance.year}</div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-muted">Total Days Quota *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={totalDays}
                                                onChange={(e) => setTotalDays(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-muted">Used Days *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={usedDays}
                                                onChange={(e) => setUsedDays(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 rounded bg-light border d-flex justify-content-between align-items-center">
                                        <span className="fw-semibold small text-muted">Calculated Remaining Days:</span>
                                        <span className={`fw-bold fs-5 ${totalDays - usedDays < 0 ? 'text-danger' : 'text-success'}`}>
                                            {totalDays - usedDays} Days
                                        </span>
                                    </div>
                                    {totalDays - usedDays < 0 && (
                                        <small className="text-danger mt-1 d-block">
                                            Warning: Remaining balance cannot be negative!
                                        </small>
                                    )}
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingBalance(null)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary-custom" disabled={saving || totalDays - usedDays < 0}>
                                        {saving ? 'Saving...' : 'Update Balance'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLeaveBalances;
