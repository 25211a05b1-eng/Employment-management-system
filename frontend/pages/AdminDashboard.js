import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ChartContainer from '../components/ChartContainer';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAdminDashboard = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard/admin');
            if (res.success) {
                setDashboardData(res.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching admin dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminDashboard();
    }, []);

    if (loading) {
        return <Loading message="Loading system-wide metrics and charts..." />;
    }

    if (error) {
        return (
            <div className="container py-4">
                <ErrorMessage message={error} onDismiss={() => setError('')} />
                <button className="btn btn-outline-primary" onClick={fetchAdminDashboard}>Retry</button>
            </div>
        );
    }

    const { counts, charts, recentRequests } = dashboardData;

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        System Administration Dashboard
                    </h2>
                    <p className="text-muted mb-0">
                        Organization-wide overview of employees, departments, leave allocations, and approval operations.
                    </p>
                </div>
                <div className="d-flex gap-2 mt-2 mt-sm-0">
                    <Link to="/admin/leave-requests" className="btn btn-outline-primary d-inline-flex align-items-center gap-1">
                        <i className="bi bi-check2-square"></i>
                        <span>Manage Requests</span>
                    </Link>
                    <Link to="/admin/employees" className="btn btn-primary-custom d-inline-flex align-items-center gap-1">
                        <i className="bi bi-person-plus"></i>
                        <span>Add Employee</span>
                    </Link>
                </div>
            </div>

            {/* KPI Cards Row 1: Users & Departments */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Active Employees"
                        value={counts.activeEmployees}
                        icon="bi-people-fill"
                        variant="primary"
                        subtitle={`Total registered: ${counts.totalEmployees}`}
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Total Managers"
                        value={counts.totalManagers}
                        icon="bi-person-badge-fill"
                        variant="purple"
                        subtitle="Department team leads"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Departments"
                        value={counts.totalDepartments}
                        icon="bi-building"
                        variant="warning"
                        subtitle="Configured business units"
                    />
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <DashboardCard
                        title="Pending Requests"
                        value={counts.pendingRequests}
                        icon="bi-hourglass-split"
                        variant="danger"
                        subtitle="Awaiting decision"
                    />
                </div>
            </div>

            {/* Leave Decision KPI Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-4">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-success fs-3 mb-1"><i className="bi bi-check-circle-fill"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{counts.approvedLeaves}</h4>
                        <small className="text-muted fw-semibold">Approved Leaves</small>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-danger fs-3 mb-1"><i className="bi bi-x-circle-fill"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{counts.rejectedLeaves}</h4>
                        <small className="text-muted fw-semibold">Rejected Leaves</small>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm p-3 text-center bg-white rounded-3">
                        <div className="text-secondary fs-3 mb-1"><i className="bi bi-slash-circle"></i></div>
                        <h4 className="fw-bold mb-0 text-dark">{counts.cancelledLeaves}</h4>
                        <small className="text-muted fw-semibold">Cancelled Leaves</small>
                    </div>
                </div>
            </div>

            {/* Visualizations Grid: 4 Chart.js Charts */}
            <div className="row g-4 mb-4">
                {/* Chart 1: Approved vs Rejected vs Pending (Doughnut) */}
                <div className="col-12 col-lg-6 col-xl-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Leave Status Distribution</h5>
                        <small className="text-muted mb-3 d-block">Approved vs Pending vs Rejected vs Cancelled</small>
                        <ChartContainer
                            type="doughnut"
                            data={charts.statusChart}
                            height={250}
                        />
                    </div>
                </div>

                {/* Chart 2: Leave Requests by Leave Type (Pie) */}
                <div className="col-12 col-lg-6 col-xl-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Requests by Leave Type</h5>
                        <small className="text-muted mb-3 d-block">Distribution across configured leave categories</small>
                        <ChartContainer
                            type="pie"
                            data={charts.typeChart}
                            height={250}
                        />
                    </div>
                </div>

                {/* Chart 3: Department-wise Leave Usage (Bar) */}
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Department-wise Usage</h5>
                        <small className="text-muted mb-3 d-block">Approved leaves taken per department</small>
                        <ChartContainer
                            type="bar"
                            data={charts.departmentChart}
                            height={250}
                            options={{
                                scales: {
                                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Chart 4: Leave Requests by Month (Line) */}
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="fw-bold mb-0 text-dark">Leave Trends Over Time</h5>
                                <small className="text-muted">Total leave volume vs approved volume by month</small>
                            </div>
                            <span className="badge bg-light text-dark border">Historical Volume</span>
                        </div>
                        <ChartContainer
                            type="line"
                            data={charts.monthlyChart}
                            height={260}
                            options={{
                                scales: {
                                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent System-wide Leave Activity */}
            <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-dark">Recent Organization Leave Activity</h5>
                    <Link to="/admin/leave-requests" className="btn btn-sm btn-link text-decoration-none">
                        View All <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>

                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Leave Type</th>
                                <th>Duration</th>
                                <th>Applied On</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRequests.map(req => (
                                <tr key={req.id}>
                                    <td>
                                        <div className="fw-semibold text-dark">{req.employee_name}</div>
                                        <small className="text-muted">{req.employee_id}</small>
                                    </td>
                                    <td>{req.department_name || 'General'}</td>
                                    <td>{req.leave_type_name}</td>
                                    <td>
                                        <div>{req.start_date} to {req.end_date}</div>
                                        <small className="text-muted">{req.number_of_days} days</small>
                                    </td>
                                    <td className="small text-muted">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td><StatusBadge status={req.status} /></td>
                                    <td className="text-end">
                                        <Link to="/admin/leave-requests" className="btn btn-sm btn-outline-primary">
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
