import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ChartContainer from '../components/ChartContainer';

const Reports = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadReportData = async () => {
            try {
                setLoading(true);
                const res = await api.get('/dashboard/admin');
                if (res.success) {
                    setDashboardData(res.data);
                }
            } catch (err) {
                setError(err.message || 'Error loading report metrics.');
            } finally {
                setLoading(false);
            }
        };

        loadReportData();
    }, []);

    if (loading) {
        return <Loading message="Generating analytics and report visualizations..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const { counts, charts } = dashboardData;

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                        Reports & Leave Analytics
                    </h2>
                    <p className="text-muted mb-0">
                        Visual reports, monthly trends, and department-wise attendance statistics.
                    </p>
                </div>
                <div className="mt-2 mt-sm-0">
                    <button 
                        className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                        onClick={() => window.print()}
                    >
                        <i className="bi bi-printer"></i>
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            {/* Metric Summary Banner */}
            <div className="card border-0 shadow-sm p-4 rounded-3 bg-white mb-4">
                <div className="row g-3 text-center">
                    <div className="col-6 col-md-3 border-end">
                        <small className="text-muted fw-semibold d-block mb-1">Total System Requests</small>
                        <h3 className="fw-bold text-dark mb-0">
                            {counts.approvedLeaves + counts.pendingRequests + counts.rejectedLeaves + counts.cancelledLeaves}
                        </h3>
                    </div>
                    <div className="col-6 col-md-3 border-end">
                        <small className="text-muted fw-semibold d-block mb-1">Approval Ratio</small>
                        <h3 className="fw-bold text-success mb-0">
                            {((counts.approvedLeaves / (counts.approvedLeaves + counts.rejectedLeaves || 1)) * 100).toFixed(1)}%
                        </h3>
                    </div>
                    <div className="col-6 col-md-3 border-end">
                        <small className="text-muted fw-semibold d-block mb-1">Active Headcount</small>
                        <h3 className="fw-bold text-primary mb-0">{counts.activeEmployees}</h3>
                    </div>
                    <div className="col-6 col-md-3">
                        <small className="text-muted fw-semibold d-block mb-1">Covered Departments</small>
                        <h3 className="fw-bold text-purple mb-0">{counts.totalDepartments}</h3>
                    </div>
                </div>
            </div>

            {/* Detailed Charts Grid */}
            <div className="row g-4">
                {/* 1. Monthly Trends */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Leave Application Trend (Last 6 Months)</h5>
                        <small className="text-muted mb-3 d-block">Monthly submission and approval rates</small>
                        <ChartContainer
                            type="line"
                            data={charts.monthlyChart}
                            height={280}
                        />
                    </div>
                </div>

                {/* 2. Department-Wise Usage */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Approved Leaves by Department</h5>
                        <small className="text-muted mb-3 d-block">Absence volume across organizational divisions</small>
                        <ChartContainer
                            type="bar"
                            data={charts.departmentChart}
                            height={280}
                        />
                    </div>
                </div>

                {/* 3. Leave Types Breakdown */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Leave Categories Breakdown</h5>
                        <small className="text-muted mb-3 d-block">Distribution across sick, casual, annual, and optional types</small>
                        <ChartContainer
                            type="pie"
                            data={charts.typeChart}
                            height={280}
                        />
                    </div>
                </div>

                {/* 4. Approval Status Pie */}
                <div className="col-12 col-lg-6">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white h-100">
                        <h5 className="fw-bold mb-1 text-dark">Application Status Outcomes</h5>
                        <small className="text-muted mb-3 d-block">Overall percentage of approved, rejected, and pending leaves</small>
                        <ChartContainer
                            type="doughnut"
                            data={charts.statusChart}
                            height={280}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
