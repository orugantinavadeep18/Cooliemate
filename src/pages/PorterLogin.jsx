import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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

      // Store authentication data in localStorage
      if (data.data.token) {
        localStorage.setItem('porterToken', data.data.token);
        localStorage.setItem('porterId', data.data.id);
        localStorage.setItem('porterBadgeNumber', data.data.badgeNumber);
        localStorage.setItem('porterName', data.data.name);
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.data.name}!`,
      });

      // Redirect to porter dashboard
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Porter Login</CardTitle>
            <p className="text-muted-foreground text-sm">
              Access your dashboard to manage bookings
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Badge Number Field */}
              <div className="space-y-2">
                <Label htmlFor="badgeNumber">Badge Number</Label>
                <Input
                  id="badgeNumber"
                  value={credentials.badgeNumber}
                  onChange={(e) =>
                    setCredentials({ ...credentials, badgeNumber: e.target.value })
                  }
                  placeholder="Enter your badge number"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Password Field with Eye Toggle */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
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
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
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

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  New Porter?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/porter-registration")}
                    className="text-blue-600 hover:underline font-medium"
                    disabled={isSubmitting}
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PorterLogin;