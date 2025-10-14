import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { trackPageVisit } from "@/utils/analytics";

// Import pages
import SplashScreen from "./pages/splashscreen";
import Home from "./pages/Home";
import BookPorter from "./pages/BookPorter";
import PorterLogin from "./pages/PorterLogin";
import AdminLogin from "./pages/AdminLogin";
import PorterDashboard from "./pages/PorterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AvailablePorters from "./pages/Available";
import AboutUs from "./pages/aboutus";

const queryClient = new QueryClient();

// Analytics wrapper component
const AnalyticsWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location]);

  return children;
};

// Protected route wrapper to ensure splash has been shown
const ProtectedRoute = ({ children }) => {
  const splashShown = sessionStorage.getItem('splashShown');
  
  // If splash hasn't been shown, redirect to splash
  if (!splashShown) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Routes
const AppRoutes = () => {
  const splashShown = sessionStorage.getItem('splashShown');

  return (
    <Routes>
      {/* Splash Screen Route - Entry point of the app */}
      <Route 
        path="/" 
        element={
          splashShown ? <Navigate to="/home" replace /> : <SplashScreen />
        } 
      />
      
      {/* Main Application Routes - All protected by ProtectedRoute */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/book" 
        element={
          <ProtectedRoute>
            <BookPorter />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/porter-login" 
        element={
          <ProtectedRoute>
            <PorterLogin />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin-login" 
        element={
          <ProtectedRoute>
            <AdminLogin />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/porter-dashboard" 
        element={
          <ProtectedRoute>
            <PorterDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/available" 
        element={
          <ProtectedRoute>
            <AvailablePorters />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/about" 
        element={
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route - Redirect based on splash status */}
      <Route 
        path="*" 
        element={<Navigate to={splashShown ? "/home" : "/"} replace />} 
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsWrapper>
          <AppRoutes />
        </AnalyticsWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;