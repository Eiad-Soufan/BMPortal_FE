import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LicenseExpired from "./components/LicenseExpired";
import AdminNotify from './pages/AdminNotify';
import Complaints from './pages/Complaints';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PointsManager from './pages/PointsManager';
import Policies from './pages/Policies';
import PrintView from './pages/PrintView';
import Profile from './pages/Profile';
import SubmitComplaint from './pages/SubmitComplaint';
import SurveyDetails from './pages/SurveyDetails';
import SurveyForm from './pages/SurveyForm';
import Surveys from './pages/Surveys';
import TaskDetails from './pages/TaskDetails';
import TaskForm from './pages/TaskForm';
import Tasks from './pages/Tasks';
import AdminRoute from './utils/AdminRoute';
import HROnly from './utils/HROnly';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/license-expired" element={<LicenseExpired />} />
        {/* صفحة تسجيل الدخول */}
        <Route path="/" element={<Login />} />
        <Route path="/print" element={<PrintView />} />

        {/* 🔒 صفحة الإشعارات الخاصة بالإدارة */}
        <Route
          path="/admin-notify"
          element={
            <AdminRoute>
              <AdminNotify />
            </AdminRoute>
          }
        />

        {/* 🔒 لوحة التحكم - محمية */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />

        <Route path="/submit-complaint" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/tasks/new" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
        <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
        {/* إعادة توجيه لأي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/surveys/new" element={<SurveyForm />} />
        <Route path="/surveys/:id" element={<SurveyDetails />} />
        <Route path="/hr/points" element={<HROnly><PointsManager /></HROnly>} />

      </Routes>
    </Router>
  );
}

export default App;
