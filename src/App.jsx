import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { trackPageVisit } from "@/utils/analytics";

// Import pages
import Home from "./pages/Home";
import BookPorter from "./pages/BookPorter";
import PorterLogin from "./pages/PorterLogin";
import PorterRegistration from './pages/porterregistration';
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

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Home Route - Main landing page */}
      <Route path="/" element={<Home />} />
      
      {/* Public Routes */}
      <Route path="/book" element={<BookPorter />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/available" element={<AvailablePorters />} />
      
      {/* Authentication Routes */}
      <Route path="/porter-login" element={<PorterLogin />} />
      <Route path="/porter-registration" element={<PorterRegistration/>} />
      <Route path="/admin-login" element={<AdminLogin />} />
      
      {/* Dashboard Routes */}
      <Route path="/porter-dashboard" element={<PorterDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      
      {/* Catch-all route - Redirect to home */}
      <Route path="*" element={<Home />} />
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