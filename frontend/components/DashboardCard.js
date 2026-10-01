import React from 'react';

const DashboardCard = ({ title, value, icon, variant = 'primary', subtitle, footer }) => {
    return (
        <div className="dashboard-card stat-card">
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <span className="stat-label">{title}</span>
                    <h2 className="stat-value">{value}</h2>
                    {subtitle && <small className="text-muted">{subtitle}</small>}
                </div>
                <div className={`stat-icon ${variant}`}>
                    <i className={`bi ${icon}`}></i>
                </div>
            </div>
            {footer && (
                <div className="mt-3 pt-2 border-top border-light">
                    <small className="text-muted">{footer}</small>
                </div>
            )}
        </div>
    );
};

export default DashboardCard;
