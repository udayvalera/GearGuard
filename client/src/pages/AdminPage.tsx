import React from 'react';

const AdminPage: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-red-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-red-700">Admin Dashboard</h1>
                <p className="mt-4 text-xl">Only admins can see this!</p>
            </div>
        </div>
    );
};

export default AdminPage;
