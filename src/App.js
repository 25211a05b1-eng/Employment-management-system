import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import EmployeeProfile from './pages/EmployeeProfile';
import ManagerDashboard from './pages/ManagerDashboard';
import ManageLeaveRequests from './pages/ManageLeaveRequests';
import AdminDashboard from './pages/AdminDashboard';
import ManageEmployees from './pages/ManageEmployees';
import ManageDepartments from './pages/ManageDepartments';
import ManageLeaveTypes from './pages/ManageLeaveTypes';
import ManageLeaveBalances from './pages/ManageLeaveBalances';
import Reports from './pages/Reports';

// Root redirector based on authenticated user's role
const RoleHomeRedirect = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return null;
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Root redirection */}
                    <Route path="/" element={<RoleHomeRedirect />} />

                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Protected Application Routes */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* Common Profile Route */}
                        <Route path="/profile" element={<EmployeeProfile />} />

                        {/* Employee Routes */}
                        <Route
                            path="/employee/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                                    <EmployeeDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/employee/apply-leave"
                            element={
                                <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                                    <ApplyLeave />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/employee/my-leaves"
                            element={
                                <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
                                    <MyLeaves />
                                </ProtectedRoute>
                            }
                        />

                        {/* Manager Routes */}
                        <Route
                            path="/manager/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                                    <ManagerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager/leave-requests"
                            element={
                                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                                    <ManageLeaveRequests />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/leave-requests"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ManageLeaveRequests />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/employees"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ManageEmployees />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/departments"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ManageDepartments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/leave-types"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ManageLeaveTypes />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/leave-balances"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <ManageLeaveBalances />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/reports"
                            element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <Reports />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    {/* Fallback unknown paths */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
