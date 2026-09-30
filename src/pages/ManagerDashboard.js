import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ChartContainer from '../components/ChartContainer';

const ManagerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Modal state for Approval / Rejection
    const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject' | null
    const [activeRequest, setActiveRequest] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [modalError, setModalError] = useState('');

    const fetchManagerDashboard = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/manager');
            if (res.success) {
                setDashboardData(res.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching manager dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagerDashboard();
    }, []);

    const openActionModal = (request, actionType) => {
        setActiveRequest(request);
        setModalAction(actionType);
        setRemarks('');
        setModalError('');
    };

    const handleConfirmAction = async () => {
        if (!activeRequest) return;
        setModalError('');

        if (modalAction === 'reject' && !remarks.trim()) {
            setModalError('Rejection remarks are required when rejecting a leave request.');
            return;
        }

        setActionLoading(activeRequest.id);
        try {
            if (modalAction === 'approve') {
                await api.post(`/leave-requests/${activeRequest.id}/approve`, {
                    manager_remarks: remarks.trim() || 'Approved by Manager'
                });
            } else if (modalAction === 'reject') {
                await api.post(`/leave-requests/${activeRequest.id}/reject`, {
                    rejection_reason: remarks.trim(),
                    manager_remarks: remarks.trim()
                });
            }

            setModalAction(null);
            setActiveRequest(null);
            fetchManagerDashboard();
        } catch (err) {
            setModalError(err.message || 'Error processing leave request.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <Loading message="Loading manager dashboard and team metrics..." />;
    }

    if (error) {
        return (
            <div className="container py-4">
                <ErrorMessage message={error} onDismiss={() => setError('')} />
                <button className="btn btn-outline-primary" onClick={fetchManagerDashboard}>Retry</button>
            </div>
        );
    }

    const { 
        teamMembersCount, 
        pendingCount, 
        approvedCount, 
        rejectedCount, 
        onLeaveTodayCount, 
        pendingRequests, 
        onLeaveToday, 
        chartData 
    } = dashboardData;

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Manager Dashboard
                    </h2>
                    <p className="text-muted mb-0">
                        Oversee direct report leave applications, review requests, and monitor team availability.
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <Link to="/manager/leave-requests" className="btn btn-primary-custom d-inline-flex align-items-center gap-2">
                        <i className="bi bi-card-checklist"></i>
                        <span>Manage All Team Requests</span>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Direct Team Members"
                        value={teamMembersCount}
                        icon="bi-people"
                        variant="primary"
                        subtitle="Active employees reporting to you"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Pending Approvals"
                        value={pendingCount}
                        icon="bi-hourglass-split"
                        variant="warning"
                        subtitle="Awaiting your decision"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Approved Leaves"
                        value={approvedCount}
                        icon="bi-check2-circle"
                        variant="success"
                        subtitle="Total approved team leaves"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="On Leave Today"
                        value={onLeaveTodayCount}
                        icon="bi-person-slash"
                        variant="danger"
                        subtitle="Team members absent today"
                    />
                </div>
            </div>

            {/* Pending Requests Section */}
            <div className="card border-0 shadow-sm p-4 rounded-3 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="fw-bold mb-0 text-dark">Pending Leave Applications</h5>
                        <small className="text-muted">Applications from your direct reports requiring action</small>
                    </div>
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                        {pendingRequests.length} Pending
                    </span>
                </div>

                {pendingRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <i className="bi bi-check2-all fs-2 text-success d-block mb-2"></i>
                        All caught up! No pending leave requests from your team members.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>Dates</th>
                                    <th className="text-center">Days</th>
                                    <th>Reason</th>
                                    <th>Applied On</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map(req => (
                                    <tr key={req.id}>
                                        <td>
                                            <div className="fw-semibold text-dark">{req.employee_name}</div>
                                            <small className="text-muted">{req.employee_id}</small>
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
                                        <td style={{ maxWidth: '240px' }} className="text-truncate" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="small text-muted">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-success"
                                                    onClick={() => openActionModal(req, 'approve')}
                                                    disabled={actionLoading === req.id}
                                                    title="Approve Request"
                                                >
                                                    <i className="bi bi-check-lg me-1"></i> Approve
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => openActionModal(req, 'reject')}
                                                    disabled={actionLoading === req.id}
                                                    title="Reject Request"
                                                >
                                                    <i className="bi bi-x-lg me-1"></i> Reject
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

            {/* Team Statistics & Who is away today */}
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-3 text-dark">Team Members on Leave Today</h5>
                        {onLeaveToday.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <i className="bi bi-people-fill fs-2 d-block mb-2 text-primary opacity-50"></i>
                                All team members are active today. No scheduled absences.
                            </div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {onLeaveToday.map(item => (
                                    <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <div>
                                            <div className="fw-semibold text-dark">{item.employee_name} ({item.employee_id})</div>
                                            <small className="text-muted">{item.leave_type_name} &bull; {item.start_date} to {item.end_date}</small>
                                        </div>
                                        <span className="badge bg-danger-subtle text-danger">On Leave</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-3 text-dark">Team Leave Distribution</h5>
                        {chartData && chartData.labels.length > 0 ? (
                            <ChartContainer
                                type="doughnut"
                                data={chartData}
                                height={240}
                            />
                        ) : (
                            <div className="text-center py-4 text-muted">
                                No historical leave distribution data available yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Approval / Rejection Action Modal */}
            {modalAction && activeRequest && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className={`modal-header ${modalAction === 'approve' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                <h5 className="modal-title fw-bold">
                                    {modalAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setModalAction(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <ErrorMessage message={modalError} onDismiss={() => setModalError('')} />

                                <div className="mb-3 p-3 bg-light rounded border">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Employee:</span>
                                        <strong>{activeRequest.employee_name} ({activeRequest.employee_id})</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Leave Type:</span>
                                        <span>{activeRequest.leave_type_name}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted small">Duration:</span>
                                        <span>{activeRequest.start_date} to {activeRequest.end_date} (<strong>{activeRequest.number_of_days} days</strong>)</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Reason:</span>
                                        <span className="text-end" style={{ maxWidth: '250px' }}>{activeRequest.reason}</span>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold small text-dark">
                                        {modalAction === 'approve' ? 'Manager Remarks (Optional)' : 'Rejection Reason / Remarks (Required) *'}
                                    </label>
                                    <textarea
                                        rows="3"
                                        className="form-control"
                                        placeholder={
                                            modalAction === 'approve' 
                                                ? 'e.g. Approved. Please coordinate handover.' 
                                                : 'Specify exact reason for rejection (e.g. sprint deadline, client delivery, staffing shortage)...'
                                        }
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        required={modalAction === 'reject'}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer border-top">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAction(null)}>
                                    Cancel
                                </button>
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
