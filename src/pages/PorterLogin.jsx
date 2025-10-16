import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { Eye, EyeOff, Loader2, User, Lock, Sparkles } from "lucide-react";

const API_BASE = 'https://cooliemate.onrender.com';

const PorterLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState({
    badgeNumber: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { badgeNumber, password } = credentials;

    if (!badgeNumber || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both badge number and password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Attempting login with badge number:', badgeNumber);

      const response = await fetch(`${API_BASE}/api/porter/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeNumber,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Login successful:', data);

      // Store authentication data
      const authData = {
        token: data.data.token,
        id: data.data.id,
        badgeNumber: data.data.badgeNumber,
        name: data.data.name
      };
      
      // Store in memory (not localStorage as per restrictions)
      window.porterAuth = authData;

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.data.name}!`,
      });

      setTimeout(() => {
        navigate("/porter-dashboard");
      }, 1000);

    } catch (error) {
      console.error('❌ Login Error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Quick & Easy Login
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Porter Login
            </h1>
            <p className="text-slate-600 text-lg">
              Sign in to access your dashboard and manage bookings
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Badge Number Section */}
                <div className="bg-blue-50 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Account Details
                    </h2>
                  </div>

                  {/* Badge Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      Badge Number *
                    </Label>
                    <Input
                      id="badgeNumber"
                      value={credentials.badgeNumber}
                      onChange={(e) =>
                        setCredentials({ ...credentials, badgeNumber: e.target.value })
                      }
                      placeholder="Enter your badge number"
                      disabled={isSubmitting}
                      required
                      className="h-14 text-base border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-500" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({ ...credentials, password: e.target.value })
                        }
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                        required
                        className="h-14 text-base pr-14 border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-slate-700 transition-colors"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing you in...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">
                      New to our platform?
                    </span>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/porter-registration")}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors hover:underline"
                    disabled={isSubmitting}
                  >
                    Create Porter Account
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Having trouble logging in? Contact support for assistance
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PorterLogin;