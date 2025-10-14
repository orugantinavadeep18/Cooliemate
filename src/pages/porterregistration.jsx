import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  User,
  Phone,
  MapPin,
  BadgeCheck,
  Lock,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PorterRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    badge_no: "",
    station: "",
    photo: null
  });

  const [errors, setErrors] = useState({});

  // Animated background particles
  useEffect(() => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.mobile.trim()) {
        newErrors.mobile = "Mobile number is required";
      } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
        newErrors.mobile = "Enter valid 10-digit mobile number";
      }
      if (!formData.station.trim()) newErrors.station = "Station is required";
    }

    if (currentStep === 2) {
      if (!formData.badge_no.trim()) {
        newErrors.badge_no = "Badge number is required";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    if (!formData.photo) {
      toast({
        title: "Photo Required",
        description: "Please upload your photo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('badge_no', formData.badge_no);
      formDataToSend.append('station', formData.station);
      formDataToSend.append('photo', formData.photo);

      const response = await fetch(`${API_BASE}/api/porter/register`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setStep(4); // Success step
        setTimeout(() => {
          navigate('/porter-login', {
            state: {
              registered: true,
              cooliemateId: data.porter.cooliemate_id,
              mobile: formData.mobile
            }
          });
        }, 3000);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <canvas
        id="particles-canvas"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-600/20" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          {/* Logo Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-4 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Join CooliMate
            </h1>
            <p className="text-gray-300">Become a verified porter today</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            variants={cardVariants}
            className="flex justify-center mb-6 space-x-4"
          >
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'w-16 bg-primary' : 'w-8 bg-gray-600'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: s * 0.1 }}
              />
            ))}
          </motion.div>

          {/* Form Card */}
          <motion.div variants={cardVariants}>
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
              <CardContent className="pt-8 pb-6">
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Personal Details
                          </h2>
                          <p className="text-sm text-gray-300">
                            Let's start with your basic information
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Enter your full name"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                          {errors.name && (
                            <p className="text-red-400 text-sm">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobile" className="text-white">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Mobile Number
                          </Label>
                          <Input
                            id="mobile"
                            type="tel"
                            maxLength={10}
                            value={formData.mobile}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mobile: e.target.value.replace(/\D/g, '')
                              })
                            }
                            placeholder="10 digit mobile number"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                          {errors.mobile && (
                            <p className="text-red-400 text-sm">{errors.mobile}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="station" className="text-white">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Station
                          </Label>
                          <Input
                            id="station"
                            value={formData.station}
                            onChange={(e) =>
                              setFormData({ ...formData, station: e.target.value })
                            }
                            placeholder="Your working station"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                          {errors.station && (
                            <p className="text-red-400 text-sm">{errors.station}</p>
                          )}
                        </div>

                        <Button
                          type="button"
                          onClick={handleNext}
                          className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                          size="lg"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Step 2: Security */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Security Details
                          </h2>
                          <p className="text-sm text-gray-300">
                            Set up your badge number and password
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="badge_no" className="text-white">
                            <BadgeCheck className="w-4 h-4 inline mr-2" />
                            Railway Badge Number
                          </Label>
                          <Input
                            id="badge_no"
                            value={formData.badge_no}
                            onChange={(e) =>
                              setFormData({ ...formData, badge_no: e.target.value })
                            }
                            placeholder="Your official badge number"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                          {errors.badge_no && (
                            <p className="text-red-400 text-sm">{errors.badge_no}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                              }
                              placeholder="Minimum 6 characters"
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-400 text-sm">{errors.password}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Confirm Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value
                              })
                            }
                            placeholder="Re-enter your password"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-400 text-sm">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3 mt-6">
                          <Button
                            type="button"
                            onClick={() => setStep(1)}
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="flex-1 bg-gradient-to-r from-primary to-purple-600"
                            size="lg"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Photo Upload */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Upload Photo
                          </h2>
                          <p className="text-sm text-gray-300">
                            Add a clear photo for verification
                          </p>
                        </div>

                        <div className="flex flex-col items-center space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            {imagePreview ? (
                              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 border-2 border-dashed border-white/30 flex items-center justify-center">
                                <Camera className="w-12 h-12 text-white/50" />
                              </div>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center shadow-lg"
                            >
                              <Upload className="w-5 h-5 text-white" />
                            </motion.button>
                          </motion.div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />

                          <p className="text-sm text-gray-300 text-center">
                            Click the camera icon to upload
                            <br />
                            <span className="text-xs text-gray-400">
                              Max size: 5MB
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <Button
                            type="button"
                            onClick={() => setStep(2)}
                            variant="outline"
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary to-purple-600"
                            size="lg"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                Complete Registration
                                <CheckCircle2 className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                      <motion.div
                        key="step4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ type: "spring", duration: 0.8 }}
                          className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 mx-auto mb-6 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-4">
                          Registration Successful!
                        </h2>
                        <p className="text-gray-300 mb-2">
                          Your CoolieMate ID has been generated
                        </p>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="inline-block px-6 py-3 bg-white/10 rounded-lg mb-6"
                        >
                          <p className="text-sm text-gray-400">CoolieMate ID</p>
                          <p className="text-2xl font-mono font-bold text-primary">
                            Loading...
                          </p>
                        </motion.div>

                        <p className="text-sm text-gray-400">
                          Redirecting to login page...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-400 mt-6"
          >
            Already have an account?{' '}
            <button
              onClick={() => navigate('/porter-login')}
              className="text-primary hover:text-primary/80 font-semibold"
            >
              Login here
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default PorterRegistration;