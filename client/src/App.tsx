import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Protected from "./pages/Protected";
import AdminPage from "./pages/AdminPage"; // Keeping original admin page just in case, but usually replaced by Protected->AdminDashboard
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/Layout";
// Manager Pages (can be reused or routed via Protected -> ManagerDashboard)
import Kanban from "./pages/manager/Kanban";
import Calendar from "./pages/manager/Calendar";
import Reports from "./pages/manager/Reports";
// Employee Pages
import MyRequests from "./pages/employee/MyRequests";
import MyEquipment from "./pages/employee/MyEquipment";
// Admin Pages
import UsersPage from "./pages/admin/Users";
import TeamsPage from "./pages/admin/Teams";
import EquipmentPage from "./pages/admin/Equipment";
import SettingsPage from "./pages/admin/Settings";


function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes directly under AppLayout for common structure */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Protected />} />

                {/* Manager & Shared Routes */}
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/reports" element={<Reports />} />

                {/* Employee Routes */}
                <Route path="/my-requests" element={<ProtectedRoute allowedRoles={['employee']}><MyRequests /></ProtectedRoute>} />
                <Route path="/my-equipment" element={<ProtectedRoute allowedRoles={['employee']}><MyEquipment /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute allowedRoles={['admin']}><TeamsPage /></ProtectedRoute>} />
                <Route path="/equipment" element={<ProtectedRoute allowedRoles={['admin']}><EquipmentPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
              </Route>
            </Route>

            {/* Legacy Admin Route (optional) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin-legacy" element={<AdminPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
