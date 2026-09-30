import React from 'react';

const StatusBadge = ({ status }) => {
    const s = (status || '').toUpperCase();

    let badgeClass = 'badge-cancelled';
    let iconClass = 'bi-dash-circle';

    switch (s) {
        case 'PENDING':
            badgeClass = 'badge-pending';
            iconClass = 'bi-hourglass-split';
            break;
        case 'APPROVED':
            badgeClass = 'badge-approved';
            iconClass = 'bi-check-circle-fill';
            break;
        case 'REJECTED':
            badgeClass = 'badge-rejected';
            iconClass = 'bi-x-circle-fill';
            break;
        case 'CANCELLED':
            badgeClass = 'badge-cancelled';
            iconClass = 'bi-slash-circle';
            break;
        default:
            badgeClass = 'badge-cancelled';
            iconClass = 'bi-question-circle';
    }

    return (
        <span className={`badge-status ${badgeClass}`}>
            <i className={`bi ${iconClass}`}></i>
            {s}
        </span>
    );
};

export default StatusBadge;
