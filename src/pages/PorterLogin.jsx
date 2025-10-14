import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
const PorterLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Demo credentials: Test porter / test123
    if (credentials.username.toLowerCase() === "test porter" && credentials.password === "test123") {
      toast({
        title: "Login Successful",
        description: "Welcome back, Test Porter!",
      });
      navigate("/porter-dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try: Test porter / test123",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Porter Login</CardTitle>
            <p className="text-muted-foreground text-sm">Access your dashboard to manage bookings</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Login
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <p>Demo credentials:</p>
                <p className="font-mono">Username: Test porter</p>
                <p className="font-mono">Password: test123</p>
              </div>
            </form>
          </CardContent>
        </Card>
        
      </div>
      <Footer/>
    </div>
  );
};

export default PorterLogin;
