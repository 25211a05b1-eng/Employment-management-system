import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ManageLeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [currentType, setCurrentType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        default_days: 10,
        paid: true
    });
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadLeaveTypes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/leave-types');
            if (res.success) {
                setLeaveTypes(res.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching leave types.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaveTypes();
    }, []);

    const openAddModal = () => {
        setCurrentType(null);
        setFormData({
            name: '',
            description: '',
            default_days: 10,
            paid: true
        });
        setModalError('');
        setShowModal('add');
    };

    const openEditModal = (lt) => {
        setCurrentType(lt);
        setFormData({
            name: lt.name,
            description: lt.description || '',
            default_days: lt.default_days,
            paid: Boolean(lt.paid)
        });
        setModalError('');
        setShowModal('edit');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setModalError('');

        if (!formData.name.trim()) {
            setModalError('Leave type name is required.');
            return;
        }

        const days = parseInt(formData.default_days, 10);
        if (isNaN(days) || days < 0) {
            setModalError('Default allowance days must be a non-negative number.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                default_days: days,
                paid: formData.paid
            };

            if (showModal === 'add') {
                const res = await api.post('/leave-types', payload);
                if (res.success) {
                    setSuccessMsg('Leave type created and balances synchronized for all employees.');
                }
            } else if (showModal === 'edit') {
                const res = await api.put(`/leave-types/${currentType.id}`, payload);
                if (res.success) {
                    setSuccessMsg('Leave type updated successfully.');
                }
            }

            setShowModal(false);
            loadLeaveTypes();
        } catch (err) {
            setModalError(err.message || 'Error saving leave type.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (lt) => {
        if (!window.confirm(`Are you sure you want to delete leave type "${lt.name}"?`)) {
            return;
        }

        setError('');
        setSuccessMsg('');
        try {
            const res = await api.delete(`/leave-types/${lt.id}`);
            if (res.success) {
                setSuccessMsg('Leave type deleted successfully.');
                loadLeaveTypes();
            }
        } catch (err) {
            setError(err.message || 'Error deleting leave type.');
        }
    };

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Leave Types Configuration
                    </h2>
                    <p className="text-muted mb-0">
                        Manage organizational leave policies, default allowances, and paid vs unpaid designations.
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <button className="btn btn-primary-custom d-inline-flex align-items-center gap-2" onClick={openAddModal}>
                        <i className="bi bi-plus-circle-fill"></i>
                        <span>Add Leave Type</span>
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

            {/* Leave Types Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                {loading ? (
                    <Loading message="Loading leave types..." />
                ) : leaveTypes.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-tags fs-1 d-block mb-2 text-muted"></i>
                        <h5>No leave types defined</h5>
                        <p className="small mb-3">Add your first leave category to allow employee requests.</p>
                        <button className="btn btn-sm btn-primary-custom" onClick={openAddModal}>
                            Add Leave Type
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Leave Type Name</th>
                                    <th>Classification</th>
                                    <th className="text-center">Annual Default Allowance</th>
                                    <th>Policy Description</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveTypes.map(lt => (
                                    <tr key={lt.id}>
                                        <td className="fw-bold text-muted">#{lt.id}</td>
                                        <td className="fw-bold text-dark">{lt.name}</td>
                                        <td>
                                            {lt.paid ? (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                    Paid Leave
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                                                    Unpaid Leave
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-light text-dark border fs-6">
                                                {lt.default_days} Days
                                            </span>
                                        </td>
                                        <td className="text-muted small" style={{ maxWidth: '350px' }}>
                                            {lt.description || 'Standard organizational leave category.'}
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => openEditModal(lt)}
                                                    title="Edit Policy"
                                                >
                                                    <i className="bi bi-pencil me-1"></i> Edit
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(lt)}
                                                    title="Delete Policy"
                                                >
                                                    <i className="bi bi-trash"></i>
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

            {/* Modal: Add / Edit Leave Type */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold text-dark">
                                    {showModal === 'add' ? 'Add Leave Type' : `Edit Leave Type: ${currentType?.name}`}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleFormSubmit}>
                                <div className="modal-body p-4">
                                    <ErrorMessage message={modalError} onDismiss={() => setModalError('')} />

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-muted">Leave Type Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Maternity Leave"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-muted">Default Allowance (Days) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={formData.default_days}
                                                onChange={(e) => setFormData({ ...formData, default_days: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-muted">Classification</label>
                                            <select
                                                className="form-select"
                                                value={formData.paid ? 'true' : 'false'}
                                                onChange={(e) => setFormData({ ...formData, paid: e.target.value === 'true' })}
                                            >
                                                <option value="true">Paid Leave</option>
                                                <option value="false">Unpaid Leave</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-muted">Policy Description</label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            placeholder="Guidelines, eligibility rules, and notice periods..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary-custom" disabled={saving}>
                                        {saving ? 'Saving...' : showModal === 'add' ? 'Create Leave Type' : 'Save Changes'}
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

export default ManageLeaveTypes;
