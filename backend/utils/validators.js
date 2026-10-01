// Utility validation functions

const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
};

const isValidPhone = (phone) => {
    if (!phone) return true; // Optional field
    const re = /^[0-9+\-\s()]{7,20}$/;
    return re.test(phone.trim());
};

const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset hours to midnight for exact calendar day difference
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    
    // Inclusive days (+ 1)
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidDate,
    calculateDays
};
