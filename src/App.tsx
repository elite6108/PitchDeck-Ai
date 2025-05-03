import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, initializeAuth } from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateDeckPage from './pages/deck/CreateDeckPage';
import ViewDeckPage from './pages/deck/ViewDeckPage';
import EditDeckPage from './pages/deck/EditDeckPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized } = useAuthStore();
  
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <CreateDeckPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deck/:id/view" 
          element={
            <ProtectedRoute>
              <ViewDeckPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deck/:id/edit" 
          element={
            <ProtectedRoute>
              <EditDeckPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Not found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;