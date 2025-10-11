import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo credentials: admin / admin123
    if (credentials.username.toLowerCase() === "admin" && credentials.password === "admin123") {
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
      });
      navigate("/admin-dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try: admin / admin123",
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
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-muted-foreground text-sm">Manage porters and oversee all bookings</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter admin username"
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
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Login
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <p>Demo credentials:</p>
                <p className="font-mono">Username: admin</p>
                <p className="font-mono">Password: admin123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
