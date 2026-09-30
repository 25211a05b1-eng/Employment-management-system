import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-container">
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />
            <div className="main-content">
                <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
                <main className="page-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
