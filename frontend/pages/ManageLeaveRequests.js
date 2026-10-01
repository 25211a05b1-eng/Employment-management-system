import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const ManageLeaveRequests = () => {
    const { user, isAdmin, isManager } = useAuth();
    const [requests, setRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal state for view, approve, reject
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject' | 'view'
    const [remarks, setRemarks] = useState('');
    const [modalError, setModalError] = useState('');

    const fetchLeaveData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (statusFilter) queryParams.append('status', statusFilter);
            if (typeFilter) queryParams.append('leave_type_id', typeFilter);
            if (isManager && !isAdmin) queryParams.append('team_only', 'true');

            const [reqRes, typesRes] = await Promise.all([
                api.get(`/leave-requests?${queryParams.toString()}`),
                api.get('/leave-types')
            ]);

            if (reqRes.success) setRequests(reqRes.data);
            if (typesRes.success) setLeaveTypes(typesRes.data);
        } catch (err) {
            setError(err.message || 'Error fetching leave requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveData();
    }, [statusFilter, typeFilter]);

    const openActionModal = (request, actionType) => {
        setSelectedRequest(request);
        setModalAction(actionType);
        setRemarks('');
        setModalError('');
    };

    const handleConfirmAction = async () => {
        if (!selectedRequest) return;
        setModalError('');

        if (modalAction === 'reject' && !remarks.trim()) {
            setModalError('A rejection reason is strictly required.');
            return;
        }

        setActionLoading(selectedRequest.id);
        try {
            if (modalAction === 'approve') {
                const res = await api.post(`/leave-requests/${selectedRequest.id}/approve`, {
                    manager_remarks: remarks.trim() || 'Approved'
                });
                if (res.success) {
                    setSuccessMsg('Leave request approved and balance deducted.');
                }
            } else if (modalAction === 'reject') {
                const res = await api.post(`/leave-requests/${selectedRequest.id}/reject`, {
                    rejection_reason: remarks.trim(),
                    manager_remarks: remarks.trim()
                });
                if (res.success) {
                    setSuccessMsg('Leave request rejected. No balance was deducted.');
                }
            }

            setModalAction(null);
            setSelectedRequest(null);
            fetchLeaveData();
        } catch (err) {
            setModalError(err.message || 'Error updating request status.');
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
                        {isAdmin ? 'All Leave Requests Management' : 'Team Leave Requests & Approvals'}
                    </h2>
                    <p className="text-muted mb-0">
                        {isAdmin
                            ? 'Comprehensive oversight of all submitted employee leaves, approvals, and rejections.'
                            : 'Review, approve, or reject leave applications submitted by your assigned team members.'}
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
                    <div className="col-12 col-sm-6 col-md-4">
                        <label className="form-label small fw-semibold text-muted mb-1">Filter by Status:</label>
                        <select
                            className="form-select form-select-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending Action</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="col-12 col-sm-6 col-md-4">
                        <label className="form-label small fw-semibold text-muted mb-1">Filter by Leave Type:</label>
                        <select
                            className="form-select form-select-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Leave Types</option>
                            {leaveTypes.map(lt => (
                                <option key={lt.id} value={lt.id}>{lt.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-4 text-md-end pt-md-3">
                        <span className="text-muted small">
                            Showing <strong>{requests.length}</strong> request(s)
                        </span>
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                {loading ? (
                    <Loading message="Loading leave applications..." />
                ) : requests.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                        <h5>No leave requests found</h5>
                        <p className="small mb-0">No records match your selected filter criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Leave Type</th>
                                    <th>Dates</th>
                                    <th className="text-center">Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td>
                                            <div className="fw-semibold text-dark">{req.employee_name}</div>
                                            <small className="text-muted">{req.employee_id}</small>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {req.department_name || 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="fw-semibold">{req.leave_type_name}</span>
                                            {req.paid ? (
                                                <span className="badge bg-success-subtle text-success ms-1" style={{ fontSize: '0.65rem' }}>Paid</span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary ms-1" style={{ fontSize: '0.65rem' }}>Unpaid</span>
                                            )}
                                        </td>
                                        <td className="small">
                                            <div>{req.start_date} to</div>
                                            <div className="text-muted">{req.end_date}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-light text-dark border">{req.number_of_days} d</span>
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: '200px' }} title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td>
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => openActionModal(req, 'view')}
                                                    title="View Details"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            className="btn btn-outline-success"
                                                            onClick={() => openActionModal(req, 'approve')}
                                                            disabled={actionLoading === req.id}
                                                            title="Approve"
                                                        >
                                                            <i className="bi bi-check-lg"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => openActionModal(req, 'reject')}
                                                            disabled={actionLoading === req.id}
                                                            title="Reject"
                                                        >
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action / Details Modal */}
            {modalAction && selectedRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className={`modal-header ${
                                modalAction === 'approve' ? 'bg-success text-white' :
                                modalAction === 'reject' ? 'bg-danger text-white' : 'border-bottom'
                            }`}>
                                <h5 className="modal-title fw-bold">
                                    {modalAction === 'approve' && 'Approve Leave Request'}
                                    {modalAction === 'reject' && 'Reject Leave Request'}
                                    {modalAction === 'view' && 'Leave Request Details'}
                                </h5>
                                <button 
                                    type="button" 
                                    className={`btn-close ${modalAction !== 'view' ? 'btn-close-white' : ''}`}
                                    onClick={() => setModalAction(null)}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <ErrorMessage message={modalError} onDismiss={() => setModalError('')} />

                                <div className="mb-3 p-3 bg-light rounded border small">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <span className="text-muted">Employee:</span>
                                            <div className="fw-bold text-dark">{selectedRequest.employee_name} ({selectedRequest.employee_id})</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Department:</span>
                                            <div className="fw-semibold">{selectedRequest.department_name || 'General'}</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Leave Type:</span>
                                            <div className="fw-semibold text-primary">{selectedRequest.leave_type_name}</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Current Status:</span>
                                            <div><StatusBadge status={selectedRequest.status} /></div>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Dates:</span>
                                            <div className="fw-semibold">{selectedRequest.start_date} to {selectedRequest.end_date}</div>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Duration:</span>
                                            <div className="fw-semibold">{selectedRequest.number_of_days} Day(s)</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <span className="text-muted small fw-semibold">Reason for Leave:</span>
                                    <div className="p-2 rounded bg-light border text-dark small mt-1">
                                        {selectedRequest.reason}
                                    </div>
                                </div>

                                {selectedRequest.optional_comments && (
                                    <div className="mb-3">
                                        <span className="text-muted small fw-semibold">Handover / Optional Comments:</span>
                                        <div className="p-2 rounded bg-light border text-dark small mt-1">
                                            {selectedRequest.optional_comments}
                                        </div>
                                    </div>
                                )}

                                {selectedRequest.manager_remarks && (
                                    <div className="mb-3">
                                        <span className="text-muted small fw-semibold">Manager Remarks:</span>
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

                                {modalAction !== 'view' && (
                                    <div className="mt-3">
                                        <label className="form-label fw-semibold small text-dark">
                                            {modalAction === 'approve' ? 'Approval Remarks (Optional)' : 'Rejection Reason (Required) *'}
                                        </label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            placeholder={
                                                modalAction === 'approve'
                                                    ? 'e.g. Approved. Please coordinate handover.'
                                                    : 'State clear reason for rejection...'
                                            }
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            required={modalAction === 'reject'}
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-top">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAction(null)}>
                                    {modalAction === 'view' ? 'Close' : 'Cancel'}
                                </button>
                                {modalAction !== 'view' && (
                                    <button
                                        type="button"
                                        className={`btn ${modalAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                        onClick={handleConfirmAction}
                                        disabled={actionLoading !== null}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            modalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLeaveRequests;
