import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BookPorter from "./pages/BookPorter";
import PorterLogin from "./pages/PorterLogin";
import AdminLogin from "./pages/AdminLogin";
import PorterDashboard from "./pages/PorterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AvailablePorters from "./pages/Available";
import AboutUs from "./pages/aboutus";
import PorterRegistration from './pages/porterregistration';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookPorter />} />
          <Route path="/porter-login" element={<PorterLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/porter-dashboard" element={<PorterDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/porter-registration" element={<PorterRegistration/>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
           <Route path="/available" element={<AvailablePorters/>} />
          <Route path="*" element={<NotFound />} />
           <Route path="/about" element={<AboutUs/>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
