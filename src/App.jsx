import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { trackPageVisit } from "@/utils/analytics";
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
    // Track page visit on route change
    trackPageVisit(location.pathname);
  }, [location]);

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookPorter />} />
            <Route path="/porter-login" element={<PorterLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/porter-dashboard" element={<PorterDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/available" element={<AvailablePorters />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </AnalyticsWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;