import { Button } from "@/components/ui/button";
import { Home, Package, LogIn, Info, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationCenter from "@/components/NotificationCenter";

const Navbar = () => {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Try to get from state/memory first
    if (location.pathname.includes("/porter")) {
      setUserType("porter");
      setUserId("1234");
    } else if (location.pathname.includes("/admin")) {
      setUserType("admin");
      setUserId("admin");
    } else if (
      location.pathname.includes("/book") ||
      location.pathname.includes("/available")
    ) {
      setUserType("passenger");
      setUserId("guest-" + Date.now());
    }
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Book Porter", path: "/book", icon: Package },
    { name: "Porter Login", path: "/porter-login", icon: LogIn },
    { name: "About Us", path: "/about", icon: Info },
    { name: "My Orders", path: "/my-orders", icon: ShoppingBag },
  ];

  return (
    <>
      <nav>
        {/* Desktop Navbar */}
        <div className="hidden md:flex sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm items-center justify-between px-8 h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="CoolieMate Logo" className="h-16 w-16 object-contain" />
            <span className="text-4xl font-extrabold text-[#e63946]">CoolieMate</span>
          </Link>

          <div className="flex items-center space-x-4">
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

            {userId && userType && (
              <NotificationCenter userId={userId} userType={userType} />
            )}
          </div>
        </div>

          {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 flex items-center justify-center px-4 h-14 bg-white border-b border-gray-200 shadow-sm z-40">
          {/* Logo + Title - Centered */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="CoolieMate Logo" className="h-9 w-9" />
            <span className="text-lg font-bold text-[#e63946]">CoolieMate</span>
          </div>

          {/* Notification - Absolute positioned */}
          {userId && userType && (
            <div className="absolute right-4">
              <NotificationCenter userId={userId} userType={userType} />
            </div>
          )}
        </div>
      </nav>

 {/* Mobile Bottom Navigation - Only shows on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 min-w-0 rounded-lg transition-colors ${
                  isActive ? 'bg-red-100' : 'hover:bg-red-50'
                }`}
              >
                <Icon 
                  size={24}
                  className={`flex-shrink-0 ${
                    isActive ? 'text-[#e63946]' : 'text-gray-600'
                  }`}
                />
                <span 
                  className={`text-xs mt-1 font-medium truncate whitespace-nowrap max-w-full ${
                    isActive ? 'text-[#e63946]' : 'text-gray-600'
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile bottom nav - prevents content from being hidden */}
      {/* <div className="md:hidden h-28" /> */}
      {/* Spacer for mobile bottom nav */}
      {/* <div className="md:hidden h-20" /> */}
    </>
  );
};

export default Navbar;