import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Briefcase } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "./Footer";

const PorterLogin = () => {
  const navigate = useNavigate();
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
      alert("Please enter both badge number and password");
      return;
    }

    setIsSubmitting(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch("https://cooliemate.onrender.com/api/porter/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          badgeNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store authentication data
      if (data.data.token) {
        localStorage.setItem("porterToken", data.data.token);
        localStorage.setItem("porterId", data.data.id);
        localStorage.setItem("porterBadgeNumber", data.data.badgeNumber);
        localStorage.setItem("porterName", data.data.name);
      }

      alert(`Welcome back, ${data.data.name}!`);

      // Navigate to porter dashboard after successful login
      setTimeout(() => {
        navigate("/porter-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
  const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl mb-6">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            CoolieMate
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-semibold">Porter Dashboard</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full max-w-md relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-2xl opacity-30"></div>

          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-white/40">
            {/* Gradient top accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <div className="p-8 md:p-10">
              {/* Form Title */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Access your dashboard to manage bookings
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Badge Number Field */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-2"
                >
                  <label htmlFor="badgeNumber" className="block text-sm font-bold text-gray-900">
                    Badge Number
                  </label>
                  <div className="relative group">
                    <input
                      id="badgeNumber"
                      type="text"
                      value={credentials.badgeNumber}
                      onChange={(e) =>
                        setCredentials({ ...credentials, badgeNumber: e.target.value })
                      }
                      placeholder="Enter your badge number"
                      disabled={isSubmitting}
                      required
                      className="w-full px-5 py-3 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-2"
                >
                  <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      required
                      className="w-full px-5 py-3 pr-12 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 group-hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Login Button */}
                <motion.button
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.5 }}
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="relative py-4"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-600 font-medium">New to CoolieMate?</span>
                  </div>
                </motion.div>

                {/* Register Link */}
                <motion.button
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.6, delay: 0.7 }}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => navigate("/porter-registration")}
                  className="w-full py-3 px-6 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
                >
                  Register as Porter
                </motion.button>
              </form>

              {/* Footer info */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 pt-6 border-t border-gray-200 text-center"
              >
                <p className="text-xs text-gray-500 mb-3">
                  Need help? Contact support at support@cooliemate.com
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Contact Us
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom info cards */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12"
        >
          {[
            { title: "24/7 Support", description: "Always here to help" },
            { title: "Secure Login", description: "Your data is protected" },
            { title: "Real-time Tracking", description: "Manage bookings easily" },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/70 backdrop-blur-lg border border-white/50 hover:border-blue-200 transition-all duration-300 hover:shadow-lg text-center"
            >
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PorterLogin;