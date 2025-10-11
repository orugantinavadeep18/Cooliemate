import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Book Porter", path: "/book" },
    { name: "Porter Login", path: "/porter-login" },
    { name: "Admin Login", path: "/admin-login" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
