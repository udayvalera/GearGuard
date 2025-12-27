import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Protected from "./pages/Protected";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/" element={<Protected />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
