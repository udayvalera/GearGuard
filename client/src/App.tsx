import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import AppLayout from "./components/Layout";
import Dashboard from "./pages/manager/Dashboard";
import Kanban from "./pages/manager/Kanban";
import Calendar from "./pages/manager/Calendar";
import Reports from "./pages/manager/Reports";

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
            {/* Redirect any unknown route to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
