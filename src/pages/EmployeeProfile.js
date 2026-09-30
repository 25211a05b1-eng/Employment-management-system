import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const EmployeeProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const [profile, setProfile] = useState(null);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [phone, setPhone] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileRes, balanceRes] = await Promise.all([
                api.get('/auth/profile'),
                api.get('/leave-balances')
            ]);

            if (profileRes.success) {
                setProfile(profileRes.data);
                setPhone(profileRes.data.phone || '');
            }
            if (balanceRes.success) {
                setBalances(balanceRes.data);
            }
        } catch (err) {
            setError(err.message || 'Error fetching profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword) {
            if (!currentPassword) {
                setError('Current password is required to change password.');
                return;
            }
            if (newPassword.length < 6) {
                setError('New password must be at least 6 characters long.');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                setError('New passwords do not match.');
                return;
            }
        }

        setUpdating(true);
        try {
            const payload = {
                phone: phone.trim()
            };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const res = await api.put('/auth/profile', payload);
            if (res.success) {
                setSuccessMsg('Profile updated successfully.');
                updateUserProfile(res.data);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            }
        } catch (err) {
            setError(err.message || 'Error updating profile.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <Loading message="Loading profile information..." />;
    }

    return (
        <div className="container-fluid p-0">
            <div className="mb-4">
                <h2 className="fw-bold mb-1" style={{ color: 'var(--elms-primary)' }}>
                    My Profile
                </h2>
                <p className="text-muted mb-0">
                    View account credentials, manager assignment, and manage security settings.
                </p>
            </div>

            <ErrorMessage message={error} onDismiss={() => setError('')} />

            {successMsg && (
                <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div className="flex-grow-1">{successMsg}</div>
                    <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
                </div>
            )}

            <div className="row g-4">
                {/* Account Details Card */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white mb-4">
                        <div className="text-center mb-4 pb-3 border-bottom">
                            <div className="d-inline-flex p-3 rounded-circle bg-light border mb-2 text-primary" style={{ width: '70px', height: '70px', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-person fs-1"></i>
                            </div>
                            <h4 className="fw-bold mb-0 text-dark">{profile?.name}</h4>
                            <span className={`role-badge ${profile?.role} mt-2 d-inline-block`}>
                                {profile?.role}
                            </span>
                        </div>

                        <div className="d-flex flex-column gap-3 small">
                            <div className="d-flex justify-content-between py-1 border-bottom">
                                <span className="text-muted">Employee ID:</span>
                                <span className="fw-semibold text-dark">{profile?.employee_id}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                                <span className="text-muted">Email:</span>
                                <span className="fw-semibold text-dark">{profile?.email}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                                <span className="text-muted">Phone:</span>
                                <span className="fw-semibold text-dark">{profile?.phone || 'Not provided'}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                                <span className="text-muted">Department:</span>
                                <span className="fw-semibold text-dark">{profile?.department_name || 'None Assigned'}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                                <span className="text-muted">Reporting Manager:</span>
                                <span className="fw-semibold text-dark">{profile?.manager_name || 'System / Direct'}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 border-bottom">
                                <span className="text-muted">Joining Date:</span>
                                <span className="fw-semibold text-dark">{profile?.joining_date}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1">
                                <span className="text-muted">Account Status:</span>
                                <span className="badge bg-success-subtle text-success">{profile?.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Leave Allowances summary */}
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <h6 className="fw-bold mb-3 text-dark">Active Leave Allowances (2026)</h6>
                        <div className="d-flex flex-column gap-2">
                            {balances.map(b => (
                                <div key={b.id} className="d-flex justify-content-between align-items-center p-2 rounded bg-light border small">
                                    <span className="fw-semibold text-dark">{b.leave_type_name}</span>
                                    <span>
                                        <strong className="text-success">{b.remaining_days}</strong> / {b.total_days} days
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Edit Security & Contact Settings */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm p-4 rounded-3 bg-white">
                        <h5 className="fw-bold mb-3 text-dark">Update Contact & Security</h5>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small text-muted">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <hr className="my-4" />
                            <h6 className="fw-bold text-dark mb-3">Change Account Password</h6>

                            <div className="mb-3">
                                <label className="form-label fw-semibold small text-muted">Current Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password to verify"
                                />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small text-muted">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold small text-muted">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary-custom px-4 py-2"
                                disabled={updating}
                            >
                                {updating ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving Changes...
                                    </>
                                ) : (
                                    'Save Profile Changes'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
