import { Mail, Linkedin, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "/logo.png"; // replace with your logo

const Footer = () => {
  return (
    <footer className="bg-gray-300 text-gray-800 relative shadow-inner">
      <div className="container mx-auto px-6 py-14">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Left: Logo & Contact */}
          <div className="max-w-sm space-y-4">
           

            <div className="flex items-center gap-3 mt-4">
              <img src={logo} alt="CooliMate Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
              <h2 className="text-3xl font-extrabold text-primary tracking-wide">CoolieMate</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Empowering porters, helping passengers — simplifying travel one bag at a time.
            </p>
            {/* </div> */}
          </div>

          {/* Middle: Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Explore</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
                <li><Link to="/book" className="hover:text-primary transition">Book a Porter</Link></li>
                <li><Link to="/porter-login" className="hover:text-primary transition">Coolie Login</Link></li>
                <li><Link to="/admin-login" className="hover:text-primary transition">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="hover:text-primary transition">Pricing</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition">FAQ</Link></li>
                <li><Link to="/support" className="hover:text-primary transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="hover:text-primary transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Right: Contact & Socials */}
          <div className="space-y-4 text-sm">
            <h4 className="text-lg font-semibold mb-2 text-gray-800">Get in Touch</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <a href="mailto:support@coolimate.com" className="hover:text-primary transition">
                  support@coolimate.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                <span>+91 9494704280</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <span>Andhra Pradesh, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-3">
              <a
                href="https://www.linkedin.com/company/coolimate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-primary transition-transform transform hover:scale-110"
              >
                <Linkedin size={22} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-300 my-10" />

        {/* Bottom Section */}
        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>
            © 2025 <span className="text-primary font-semibold">CooliMate</span>. Empowering porters, helping passengers.
          </p>
          <p>
            Part of the <span className="text-primary font-medium">Digital India Initiative</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
