import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    // Access usage of mockLogin from the hook result at the top level
    const auth = useAuth() as any;

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const { user } = useAuth();

    React.useEffect(() => {
        if (user) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const handleMockLogin = async (role: string) => {
        try {
            await auth.mockLogin(role);
        } catch (err) {
            console.error("Mock login failed", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {/* Dev Only: Mock Login Buttons */}
                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase text-center">Dev Mode: Quick Login</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleMockLogin('admin')} className="text-xs bg-purple-100 text-purple-700 py-1 px-2 rounded hover:bg-purple-200">Admin</button>
                        <button onClick={() => handleMockLogin('manager')} className="text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200">Manager</button>
                        <button onClick={() => handleMockLogin('technician')} className="text-xs bg-orange-100 text-orange-700 py-1 px-2 rounded hover:bg-orange-200">Technician</button>
                        <button onClick={() => handleMockLogin('employee')} className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded hover:bg-green-200">Employee</button>
                    </div>
                </div>

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
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
