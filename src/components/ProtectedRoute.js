import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading message="Authenticating session..." />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="container py-5 text-center">
                <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: '500px' }}>
                    <div className="text-danger mb-3">
                        <i className="bi bi-shield-x fs-1"></i>
                    </div>
                    <h4 className="fw-bold">Access Denied</h4>
                    <p className="text-muted mt-2">
                        Your account role (<strong>{user.role}</strong>) does not have permission to view this section.
                    </p>
                    <div className="mt-3">
                        <button 
                            className="btn btn-primary"
                            onClick={() => window.history.back()}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
