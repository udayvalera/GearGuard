import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup({ email, password });
            navigate("/");
        } catch (err: any) {
            setError(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
