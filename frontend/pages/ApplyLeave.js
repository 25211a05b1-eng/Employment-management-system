import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const ApplyLeave = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [formData, setFormData] = useState({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
        optional_comments: ''
    });

    const [calculatedDays, setCalculatedDays] = useState(0);
    const [selectedBalance, setSelectedBalance] = useState(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    // Load available leave types and employee's balances
    useEffect(() => {
        const loadLeaveData = async () => {
            try {
                setLoading(true);
                const [typesRes, balancesRes] = await Promise.all([
                    api.get('/leave-types'),
                    api.get('/leave-balances')
                ]);

                if (typesRes.success) setLeaveTypes(typesRes.data);
                if (balancesRes.success) setBalances(balancesRes.data);
            } catch (err) {
                setError(err.message || 'Error loading leave types or balances.');
            } finally {
                setLoading(false);
            }
        };

        loadLeaveData();
    }, []);

    // Calculate days whenever start_date or end_date changes
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            const diffTime = end.getTime() - start.getTime();
            if (diffTime >= 0) {
                const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setCalculatedDays(days);
            } else {
                setCalculatedDays(0);
            }
        } else {
            setCalculatedDays(0);
        }
    }, [formData.start_date, formData.end_date]);

    // Update selected leave balance information when leave type changes
    useEffect(() => {
        if (formData.leave_type_id) {
            const match = balances.find(b => String(b.leave_type_id) === String(formData.leave_type_id));
            setSelectedBalance(match || null);
        } else {
            setSelectedBalance(null);
        }
    }, [formData.leave_type_id, balances]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.leave_type_id) {
            setError('Please select a leave type.');
            return false;
        }

        if (!formData.start_date) {
            setError('Please select a start date.');
            return false;
        }

        if (!formData.end_date) {
            setError('Please select an end date.');
            return false;
        }

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError('End date cannot be earlier than start date.');
            return false;
        }

        if (calculatedDays <= 0) {
            setError('Invalid date range specified.');
            return false;
        }

        if (!formData.reason.trim()) {
            setError('Please provide a reason for your leave request.');
            return false;
        }

        // Paid leave balance check on client side
        if (selectedBalance && selectedBalance.paid) {
            if (calculatedDays > selectedBalance.remaining_days) {
                setError(`Insufficient leave balance! You requested ${calculatedDays} day(s), but only have ${selectedBalance.remaining_days} remaining.`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                leave_type_id: parseInt(formData.leave_type_id, 10),
                start_date: formData.start_date,
                end_date: formData.end_date,
                reason: formData.reason.trim(),
                optional_comments: formData.optional_comments ? formData.optional_comments.trim() : null
            };

            const res = await api.post('/leave-requests', payload);
            if (res.success) {
                setSuccessMsg('Your leave request has been submitted successfully with status PENDING! Redirecting to your leave history...');
                setTimeout(() => {
                    navigate('/employee/my-leaves');
                }, 1800);
            }
        } catch (err) {
            setError(err.message || 'Error submitting leave request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="mb-4">
                <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                    Apply for Leave
                </h2>
                <p className="text-muted mb-0">
                    Submit a new leave application for managerial review and approval.
                </p>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <ErrorMessage message={error} onDismiss={() => setError('')} />

                        {successMsg && (
                            <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                                <div>{successMsg}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Leave Type Selector */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-dark">
                                    Leave Type <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="leave_type_id"
                                    className="form-select"
                                    value={formData.leave_type_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Leave Type --</option>
                                    {leaveTypes.map(lt => (
                                        <option key={lt.id} value={lt.id}>
                                            {lt.name} {lt.paid ? '(Paid Leave)' : '(Unpaid Leave)'}
                                        </option>
                                    ))}
                                </select>
                                <div className="form-text">
                                    Leave types and allowances are governed by company HR policies.
                                </div>
                            </div>

                            {/* Dates Row */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold text-dark">
                                        Start Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        className="form-control"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold text-dark">
                                        End Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        className="form-control"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Automatic Days Indicator */}
                            <div className="p-3 mb-3 rounded-2 bg-light border d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="fw-semibold text-dark">Total Requested Duration:</span>
                                    <div className="text-muted small">Calculated inclusively based on selected dates</div>
                                </div>
                                <span className={`badge fs-6 ${calculatedDays > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                                    {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                                </span>
                            </div>

                            {/* Reason for Leave */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-dark">
                                    Reason for Leave <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    name="reason"
                                    rows="3"
                                    className="form-control"
                                    placeholder="Explain the reason for taking leave (e.g. personal matters, doctor consultation, vacation)..."
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            {/* Optional Comments */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold text-dark">
                                    Optional Comments / Handover Notes
                                </label>
                                <textarea
                                    name="optional_comments"
                                    rows="2"
                                    className="form-control"
                                    placeholder="Mention handover tasks or contact availability during absence..."
                                    value={formData.optional_comments}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary-custom px-4 py-2 d-inline-flex align-items-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            <span>Submitting Application...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-fill"></i>
                                            <span>Submit Leave Request</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4 py-2"
                                    onClick={() => navigate('/employee/dashboard')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Balance & Info Sidebar Card */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white mb-4">
                        <h5 className="fw-bold mb-3 text-dark">Your Leave Balance</h5>
                        {selectedBalance ? (
                            <div className="p-3 rounded-2 border border-primary-subtle bg-light mb-3">
                                <div className="fw-bold text-primary mb-1">{selectedBalance.leave_type_name}</div>
                                <div className="d-flex justify-content-between text-muted small mb-1">
                                    <span>Total Allocated:</span>
                                    <strong>{selectedBalance.total_days} days</strong>
                                </div>
                                <div className="d-flex justify-content-between text-muted small mb-1">
                                    <span>Already Used:</span>
                                    <strong className="text-danger">{selectedBalance.used_days} days</strong>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Remaining Balance:</span>
                                    <span className="text-success fs-5">{selectedBalance.remaining_days} days</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted small">
                                Select a leave type to check your current available balance.
                            </p>
                        )}

                        <div className="border-top pt-3">
                            <h6 className="fw-semibold text-dark small mb-2">Leave Application Guidelines:</h6>
                            <ul className="text-muted small ps-3 mb-0">
                                <li className="mb-1">Submit planned annual leave at least 3 days in advance.</li>
                                <li className="mb-1">Medical leaves may require supporting prescriptions upon return.</li>
                                <li className="mb-1">Overlapping leave applications are automatically prevented.</li>
                                <li>All leave requests are subject to approval by your designated manager.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyLeave;
