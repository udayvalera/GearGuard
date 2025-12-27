import React from "react";
import { useAuth } from "../context/AuthContext";

const Protected: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Protected Dashboard</h1>
            <div className="bg-white p-6 rounded shadow-md">
                <p className="mb-4">Welcome back, <strong>{user?.email}</strong>!</p>
                <p className="mb-4 text-gray-600">This page is only accessible to authenticated users.</p>
                <button
                    onClick={() => logout()}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Protected;
