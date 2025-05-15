import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, initializeAuth } from './store/authStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setDevelopmentApiKeys } from './utils/apiKeyHelper';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateDeckPage from './pages/deck/CreateDeckPage';
import ViewDeckPage from './pages/deck/ViewDeckPage';
import EditDeckPage from './pages/deck/EditDeckPage';
import GenerateAgreementPage from './pages/agreement/GenerateAgreementPage';
import MyAgreementsPage from './pages/agreement/MyAgreementsPage';
import ViewAgreementPage from './pages/agreement/ViewAgreementPage';
import LogoGeneratorPage from './pages/logo/LogoGeneratorPage';
import SavedLogosPage from './pages/logo/SavedLogosPage';
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
    
    // Set API keys manually for development testing
    // This is a temporary solution until we move API calls to a server
    if (import.meta.env.DEV) {
      setDevelopmentApiKeys();
    }
  }, []);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
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
        
        {/* Business Agreement */}
        <Route 
          path="/agreements" 
          element={
            <ProtectedRoute>
              <GenerateAgreementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agreements/create" 
          element={
            <ProtectedRoute>
              <GenerateAgreementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agreements/my-agreements" 
          element={
            <ProtectedRoute>
              <MyAgreementsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agreements/view/:id" 
          element={
            <ProtectedRoute>
              <ViewAgreementPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Logo Generator */}
        <Route 
          path="/logo" 
          element={
            <ProtectedRoute>
              <LogoGeneratorPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/logo/saved" 
          element={
            <ProtectedRoute>
              <SavedLogosPage />
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