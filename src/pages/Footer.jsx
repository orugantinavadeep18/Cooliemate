import { Mail, Linkedin, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black relative shadow-2xl border-t border-yellow-400/20">
      <div className="container mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          {/* Left: Logo & Description */}
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CooliMate Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
              <h2 className="text-3xl font-extrabold text-black tracking-wide">CooliMate</h2>
            </div>
            <p className="text-black leading-relaxed text-sm sm:text-base drop-shadow-sm">
              Empowering porters, helping passengers — simplifying travel one bag at a time.
            </p>
            
          </div>

          {/* Middle: Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-sm">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-black">Explore</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-black hover:text-yellow-400 transition">About Us</Link></li>
                <li><Link to="/book" className="text-black hover:text-yellow-400 transition">Book a Porter</Link></li>
                <li><Link to="/porter-login" className="text-black hover:text-yellow-400 transition">Coolie Login</Link></li>
                <li><Link to="/admin-login" className="text-black hover:text-yellow-400 transition">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-black">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="text-black hover:text-yellow-400 transition">Pricing</Link></li>
                <li><Link to="/faq" className="text-black hover:text-yellow-400 transition">FAQ</Link></li>
                <li><Link to="/support" className="text-black hover:text-yellow-400 transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-black">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="text-black hover:text-yellow-400 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-black hover:text-yellow-400 transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Right: Contact */}
          <div className="space-y-4 text-sm">
            <h4 className="text-lg font-semibold mb-2 text-black">Get in Touch</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-black hover:text-yellow-400 transition">
                <Mail size={18} className="text-black" />
                <a href="mailto:support@coolimate.com">support@coolimate.com</a>
              </div>
              <div className="flex items-center gap-2 text-black hover:text-yellow-400 transition">
                <Phone size={18} className="text-black" />
                <span>+91 9494704280</span>
              </div>
              <div className="flex items-center gap-2 text-black hover:text-yellow-400 transition">
                <MapPin size={18} className="text-black" />
                <span>Andhra Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-700/50 my-10" />

        {/* Bottom Section */}
        <div className="text-center text-xs text-black space-y-1">
          <p>
            © 2025 <span className="text-black font-semibold">CoolieMate</span>. Empowering porters, helping passengers.
          </p>
          <p>
            Part of the <span className="text-black font-medium">Digital India Initiative</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;