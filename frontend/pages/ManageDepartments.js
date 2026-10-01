import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ManageDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false); // false | 'add' | 'edit'
    const [currentDept, setCurrentDept] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [modalError, setModalError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/departments');
            if (res.success) {
                setDepartments(res.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const openAddModal = () => {
        setCurrentDept(null);
        setName('');
        setDescription('');
        setModalError('');
        setShowModal('add');
    };

    const openEditModal = (dept) => {
        setCurrentDept(dept);
        setName(dept.name);
        setDescription(dept.description || '');
        setModalError('');
        setShowModal('edit');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setModalError('');

        if (!name.trim()) {
            setModalError('Department name is required.');
            return;
        }

        setSaving(true);
        try {
            if (showModal === 'add') {
                const res = await api.post('/departments', {
                    name: name.trim(),
                    description: description.trim()
                });
                if (res.success) {
                    setSuccessMsg('Department created successfully.');
                }
            } else if (showModal === 'edit') {
                const res = await api.put(`/departments/${currentDept.id}`, {
                    name: name.trim(),
                    description: description.trim()
                });
                if (res.success) {
                    setSuccessMsg('Department updated successfully.');
                }
            }

            setShowModal(false);
            loadDepartments();
        } catch (err) {
            setModalError(err.message || 'Error saving department.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (dept) => {
        if (!window.confirm(`Are you sure you want to delete department "${dept.name}"?`)) {
            return;
        }

        setError('');
        setSuccessMsg('');
        try {
            const res = await api.delete(`/departments/${dept.id}`);
            if (res.success) {
                setSuccessMsg('Department deleted successfully.');
                loadDepartments();
            }
        } catch (err) {
            setError(err.message || 'Error deleting department.');
        }
    };

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Department Management
                    </h2>
                    <p className="text-muted mb-0">
                        Configure organizational units, view active headcount, and manage department descriptions.
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <button className="btn btn-primary-custom d-inline-flex align-items-center gap-2" onClick={openAddModal}>
                        <i className="bi bi-plus-circle-fill"></i>
                        <span>Add Department</span>
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

            {/* Department Cards Grid */}
            {loading ? (
                <Loading message="Loading departments..." />
            ) : departments.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-3">
                    <i className="bi bi-building-x fs-1 text-muted mb-2"></i>
                    <h5>No departments found</h5>
                    <p className="text-muted small mb-3">Add your organization's first department.</p>
                    <div>
                        <button className="btn btn-primary-custom" onClick={openAddModal}>Add Department</button>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {departments.map(dept => (
                        <div key={dept.id} className="col-12 col-md-6 col-xl-4">
                            <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="fw-bold text-dark mb-0">{dept.name}</h5>
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                            {dept.employee_count} {dept.employee_count === 1 ? 'Member' : 'Members'}
                                        </span>
                                    </div>
                                    <p className="text-muted small mb-4" style={{ minHeight: '40px' }}>
                                        {dept.description || 'No description provided for this business unit.'}
                                    </p>
                                </div>

                                <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        ID: #{dept.id}
                                    </small>
                                    <div className="btn-group btn-group-sm">
                                        <button 
                                            className="btn btn-outline-primary"
                                            onClick={() => openEditModal(dept)}
                                            title="Edit Department"
                                        >
                                            <i className="bi bi-pencil me-1"></i> Edit
                                        </button>
                                        <button 
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(dept)}
                                            title="Delete Department"
                                            disabled={dept.employee_count > 0}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Add / Edit Department */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold text-dark">
                                    {showModal === 'add' ? 'Create New Department' : `Edit Department: ${currentDept?.name}`}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleFormSubmit}>
                                <div className="modal-body p-4">
                                    <ErrorMessage message={modalError} onDismiss={() => setModalError('')} />

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-muted">Department Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Quality Assurance"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold text-muted">Description / Function</label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            placeholder="Describe primary functions and responsibilities..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary-custom" disabled={saving}>
                                        {saving ? 'Saving...' : showModal === 'add' ? 'Create Department' : 'Save Changes'}
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

export default ManageDepartments;
