import React from "react";
import { useAuth } from "../context/AuthContext";
import ManagerDashboard from './manager/Dashboard';
import EmployeeDashboard from './employee/Dashboard';
import AdminDashboard from './admin/Dashboard';
import TechnicianDashboard from './technician/Dashboard';

const Protected: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role;

    if (role === 'admin') return <AdminDashboard />;
    if (role === 'manager') return <ManagerDashboard />;
    if (role === 'technician') return <TechnicianDashboard />;

    return <EmployeeDashboard />;
};

export default Protected;
