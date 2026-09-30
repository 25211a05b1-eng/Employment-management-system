import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const MyLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const endpoint = statusFilter ? `/leave-requests?status=${statusFilter}` : '/leave-requests';
            const res = await api.get(endpoint);
            if (res.success) {
                setRequests(res.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching leave requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleCancelRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to cancel this pending leave request?')) {
            return;
        }

        setActionLoading(requestId);
        setError('');
        setSuccessMsg('');

        try {
            const res = await api.post(`/leave-requests/${requestId}/cancel`);
            if (res.success) {
                setSuccessMsg('Leave request cancelled successfully.');
                fetchRequests();
            }
        } catch (err) {
            setError(err.message || 'Failed to cancel leave request.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        My Leave History & Status
                    </h2>
                    <p className="text-muted mb-0">
                        View submitted leave requests, approval progress, and cancel pending applications.
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <Link to="/employee/apply-leave" className="btn btn-primary-custom d-inline-flex align-items-center gap-2">
                        <i className="bi bi-plus-circle"></i>
                        <span>New Application</span>
                    </Link>
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
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold text-muted mb-1">Filter by Status:</label>
                        <select
                            className="form-select form-select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending Approval</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-8 text-md-end mt-2 mt-md-0">
                        <span className="text-muted small">
                            Total Records: <strong>{requests.length}</strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* Leaves Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                {loading ? (
                    <Loading message="Loading leave applications..." />
                ) : requests.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-calendar-x fs-1 d-block mb-2 text-muted"></i>
                        <h5>No leave requests found</h5>
                        <p className="small mb-3">You haven't submitted any leave requests matching the selected criteria.</p>
                        <Link to="/employee/apply-leave" className="btn btn-sm btn-primary-custom">
                            Apply for Leave Now
                        </Link>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th className="text-center">Days</th>
                                    <th>Reason</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id}>
                                        <td className="fw-semibold text-dark">
                                            {req.leave_type_name}
                                            {req.paid ? (
                                                <span className="badge bg-success-subtle text-success ms-1" style={{ fontSize: '0.65rem' }}>Paid</span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary ms-1" style={{ fontSize: '0.65rem' }}>Unpaid</span>
                                            )}
                                        </td>
                                        <td>{req.start_date}</td>
                                        <td>{req.end_date}</td>
                                        <td className="text-center">
                                            <span className="badge bg-light text-dark border">{req.number_of_days} d</span>
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: '200px' }} title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="small text-muted">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-2"
                                                onClick={() => setSelectedRequest(req)}
                                                title="View Details"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>

                                            {req.status === 'PENDING' && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancelRequest(req.id)}
                                                    disabled={actionLoading === req.id}
                                                    title="Cancel Request"
                                                >
                                                    {actionLoading === req.id ? (
                                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                                    ) : (
                                                        <i className="bi bi-x-circle"></i>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-bold text-dark">Leave Application Details</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0 text-primary">{selectedRequest.leave_type_name}</h6>
                                    <StatusBadge status={selectedRequest.status} />
                                </div>

                                <div className="row g-2 mb-3 small">
                                    <div className="col-6">
                                        <span className="text-muted">Start Date:</span>
                                        <div className="fw-semibold">{selectedRequest.start_date}</div>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">End Date:</span>
                                        <div className="fw-semibold">{selectedRequest.end_date}</div>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">Number of Days:</span>
                                        <div className="fw-semibold">{selectedRequest.number_of_days} Day(s)</div>
                                    </div>
                                    <div className="col-6">
                                        <span className="text-muted">Applied On:</span>
                                        <div className="fw-semibold">{new Date(selectedRequest.created_at).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <span className="text-muted small">Reason for Leave:</span>
                                    <div className="p-2 rounded bg-light border text-dark small mt-1">
                                        {selectedRequest.reason}
                                    </div>
                                </div>

                                {selectedRequest.optional_comments && (
                                    <div className="mb-3">
                                        <span className="text-muted small">Handover / Optional Comments:</span>
                                        <div className="p-2 rounded bg-light border text-dark small mt-1">
                                            {selectedRequest.optional_comments}
                                        </div>
                                    </div>
                                )}

                                {selectedRequest.manager_remarks && (
                                    <div className="mb-3">
                                        <span className="text-muted small">Manager Remarks:</span>
                                        <div className="p-2 rounded bg-light border text-dark small mt-1">
                                            {selectedRequest.manager_remarks}
                                        </div>
                                    </div>
                                )}

                                {selectedRequest.rejection_reason && (
                                    <div className="mb-3">
                                        <span className="text-danger small fw-semibold">Rejection Reason:</span>
                                        <div className="p-2 rounded bg-danger-subtle border border-danger-subtle text-danger small mt-1">
                                            {selectedRequest.rejection_reason}
                                        </div>
                                    </div>
                                )}

                                {selectedRequest.approver_name && (
                                    <div className="small text-muted border-top pt-2">
                                        Reviewed by: <strong>{selectedRequest.approver_name}</strong> {selectedRequest.approved_at ? `on ${new Date(selectedRequest.approved_at).toLocaleString()}` : ''}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top">
                                {selectedRequest.status === 'PENDING' && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            handleCancelRequest(selectedRequest.id);
                                            setSelectedRequest(null);
                                        }}
                                    >
                                        Cancel Request
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>
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

export default MyLeaves;
