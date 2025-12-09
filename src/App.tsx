import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from "@/components/ui/toaster"; // Import the Toaster

// Pages
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BudgetComplete from './pages/BudgetComplete';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AcceptInvitation from './pages/AcceptInvitation';

export default function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invitation/accept" element={<AcceptInvitation />} />

        {/* Protected routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* The new "Complete" view */}
        <Route path="/budget/:id/complete" element={
          <PrivateRoute>
            <BudgetComplete />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Global Toaster for Notifications */}
      <Toaster />
    </>
  );
}