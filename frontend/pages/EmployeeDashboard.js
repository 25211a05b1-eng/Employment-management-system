import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ChartContainer from '../components/ChartContainer';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/employee');
            if (res.success) {
                setDashboardData(res.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return <Loading message="Loading your leave dashboard..." />;
    }

    if (error) {
        return (
            <div className="container py-4">
                <ErrorMessage message={error} onDismiss={() => setError('')} />
                <button className="btn btn-outline-primary" onClick={fetchDashboard}>Retry</button>
            </div>
        );
    }

    const { employee, stats, balances, recentRequests, chartData } = dashboardData;

    return (
        <div className="container-fluid p-0">
            {/* Header Greeting */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Welcome, {employee?.name || user?.name}! 👋
                    </h2>
                    <p className="text-muted mb-0">
                        Employee ID: <strong className="text-dark">{employee?.employee_id || user?.employee_id}</strong> &bull; Department: <strong className="text-dark">{employee?.department_name || 'General'}</strong> {employee?.manager_name ? `• Manager: ${employee.manager_name}` : ''}
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <Link to="/employee/apply-leave" className="btn btn-primary-custom d-inline-flex align-items-center gap-2">
                        <i className="bi bi-plus-circle"></i>
                        <span>Apply for Leave</span>
                    </Link>
                </div>
            </div>

            {/* Leave Balance KPI Cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Casual Leave Balance"
                        value={`${stats.casualLeave} Days`}
                        icon="bi-calendar-event"
                        variant="primary"
                        subtitle="Available for domestic & urgent needs"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Sick Leave Balance"
                        value={`${stats.sickLeave} Days`}
                        icon="bi-heart-pulse"
                        variant="success"
                        subtitle="Available for health recovery"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Annual / Earned Leave"
                        value={`${stats.annualLeave} Days`}
                        icon="bi-sun"
                        variant="warning"
                        subtitle="Paid planned vacation days"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Total Available Leaves"
                        value={`${stats.totalBalance} Days`}
                        icon="bi-wallet2"
                        variant="purple"
                        subtitle="Sum of active remaining balance"
                    />
                </div>
            </div>

            {/* Request Status Overview Counters */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-warning fs-3 mb-1"><i className="bi bi-hourglass-split"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{stats.pendingRequests}</h4>
                        <small className="text-muted fw-semibold">Pending Requests</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-success fs-3 mb-1"><i className="bi bi-check-circle-fill"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{stats.approvedRequests}</h4>
                        <small className="text-muted fw-semibold">Approved Requests</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-danger fs-3 mb-1"><i className="bi bi-x-circle-fill"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{stats.rejectedRequests}</h4>
                        <small className="text-muted fw-semibold">Rejected Requests</small>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-secondary fs-3 mb-1"><i className="bi bi-slash-circle"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{stats.cancelledRequests}</h4>
                        <small className="text-muted fw-semibold">Cancelled Requests</small>
                    </div>
                </div>
            </div>

            {/* Leave Usage Visualization & Balance Table */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm p-4 rounded-3 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0 text-dark">Leave Usage & Balance Visualization</h5>
                            <span className="badge bg-light text-muted border">Year 2026</span>
                        </div>
                        {chartData && (
                            <ChartContainer
                                type="bar"
                                data={chartData}
                                height={280}
                                options={{
                                    plugins: {
                                        legend: { position: 'top' }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 2 }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm p-4 rounded-3 h-100 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0 text-dark">Detailed Balances</h5>
                            <Link to="/employee/apply-leave" className="btn btn-sm btn-outline-primary">Apply</Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr className="text-muted small">
                                        <th>Leave Type</th>
                                        <th className="text-center">Total</th>
                                        <th className="text-center">Used</th>
                                        <th className="text-center">Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balances.map(b => (
                                        <tr key={b.id}>
                                            <td className="fw-semibold text-dark">{b.leave_type_name}</td>
                                            <td className="text-center text-muted">{b.total_days}</td>
                                            <td className="text-center text-danger">{b.used_days}</td>
                                            <td className="text-center fw-bold text-success">{b.remaining_days}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Leave Requests */}
            <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-dark">Recent Leave Applications</h5>
                    <Link to="/employee/my-leaves" className="btn btn-sm btn-link text-decoration-none">
                        View All History <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>

                {recentRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                        No recent leave requests found. Click "Apply for Leave" to submit your first request.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="fw-semibold text-dark">{req.leave_type_name}</td>
                                        <td>{req.start_date}</td>
                                        <td>{req.end_date}</td>
                                        <td><span className="badge bg-light text-dark border">{req.number_of_days} d</span></td>
                                        <td className="text-truncate" style={{ maxWidth: '240px' }} title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td>
                                            <StatusBadge status={req.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
