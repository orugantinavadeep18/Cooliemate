import { Button } from "@/components/ui/button";
import { Menu, X, Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationCenter from "@/components/NotificationCenter";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null); // 'passenger', 'porter', or 'admin'
  const [userId, setUserId] = useState(null);
  const location = useLocation();

  // Detect user type based on current route or stored session
  useEffect(() => {
    // Check sessionStorage or localStorage for logged-in user
    const storedUserType = sessionStorage.getItem('userType');
    const storedUserId = sessionStorage.getItem('userId');
    
    if (storedUserType && storedUserId) {
      setUserType(storedUserType);
      setUserId(storedUserId);
    } else {
      // Auto-detect based on route for demo purposes
      if (location.pathname.includes('/porter')) {
        setUserType('porter');
        setUserId('1234'); // Porter ID
      } else if (location.pathname.includes('/admin')) {
        setUserType('admin');
        setUserId('admin');
      } else if (location.pathname.includes('/book') || location.pathname.includes('/available')) {
        // For passengers - use phone number or generate session ID
        const sessionId = sessionStorage.getItem('passengerPhone') || 'guest';
        setUserType('passenger');
        setUserId(sessionId);
      }
    }
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Book Porter", path: "/book" },
    { name: "Porter Login", path: "/porter-login" },
    { name: "Admin Login", path: "/admin-login" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center space-x-0 sm:space-x-0 md:space-x-0"
          >
            {/* Logo Image */}
            <img
              src="/logo.png"
              alt="CoolieMate Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 object-contain drop-shadow-2xl m-0 p-0"
            />

            {/* App Name */}
            <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#e63946] tracking-wide leading-tight -ml-3 sm:-ml-4 md:-ml-5">
              CoolieMate
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={location.pathname === link.path ? "secondary" : "ghost"}
                  size="sm"
                  className="font-medium"
                >
                  {link.name}
                </Button>
              </Link>
            ))}

            {/* Notification Bell - Show only if user is logged in */}
            {userId && userType && (
              <div className="ml-4 flex items-center gap-2">
                <NotificationCenter userId={userId} userType={userType} />
              </div>
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Notification Bell for Mobile - Show only if user is logged in */}
            {userId && userType && (
              <NotificationCenter userId={userId} userType={userType} />
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant={location.pathname === link.path ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start font-medium"
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;