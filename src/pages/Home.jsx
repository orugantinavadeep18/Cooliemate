import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Shield, Smartphone, IndianRupee, Clock, Star, Users, MapPin, Zap, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Three.js Background Animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create floating geometric shapes
    const geometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.6,
      wireframe: false 
    });
    
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(pointLight, ambientLight);

    // Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      torus.rotation.x += 0.005;
      torus.rotation.y += 0.005;
      torus.rotation.z += 0.002;
      
      particlesMesh.rotation.y += 0.001;
      
      camera.position.x = mousePosition.x * 0.5;
      camera.position.y = -mousePosition.y * 0.5;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [mousePosition]);

  // Mouse movement tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Smartphone, title: "Advance Booking", description: "Book a certified coolie by entering your PNR number", color: "from-blue-500 to-cyan-500" },
    { icon: IndianRupee, title: "Standardized Rates", description: "No bargaining, just clear, fixed pricing", color: "from-green-500 to-emerald-500" },
    { icon: Clock, title: "Real-time Tracking", description: "Track your coolie's location, just like Uber", color: "from-purple-500 to-pink-500" },
    { icon: Shield, title: "Verified Porters", description: "All porters are certified and background-checked", color: "from-orange-500 to-red-500" },
  ];

  const pricing = [
    { bags: "1-2 bags", weight: "≤20 kg", price: "₹99", description: "Perfect for light travelers", popular: false },
    { bags: "3-4 bags", weight: "21-40 kg", price: "₹149", description: "Most popular choice", popular: true },
    { bags: "5+ bags", weight: ">40 kg", price: "₹199", description: "For heavy luggage", popular: false },
  ];

 
  const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } };
  const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } };
  const slideLeft = { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } };
  const slideRight = { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      />
      <Navbar />
      <div className="relative z-10">
        

        {/* Hero Section with Glassmorphism */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
          </div>

          {/* Overlay pattern */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="container mx-auto px-4 relative">
            <motion.div
              className="max-w-5xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={scaleIn}
                transition={{ duration: 0.8, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full mb-8 border border-white/30"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-sm font-medium">Now Live at Kurnool Railway Station</span>
              </motion.div>

              <motion.h1 
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-tight"
              >
                <span className="text-white drop-shadow-2xl">Welcome to,</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">
                  CoolieMate!
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl mb-4 text-white/95 font-semibold"
              >
                Premium Coolie Booking at Your Fingertips
              </motion.p>
              
              <motion.p 
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-base md:text-lg lg:text-xl mb-10 text-white/80 italic max-w-2xl mx-auto"
              >
                "Making every journey comfortable, one bag at a time"
              </motion.p>
              
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link to="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-bold text-lg px-10 py-7 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 rounded-2xl group"
                  >
                    Book Porter Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto font-semibold text-lg px-10 py-7 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white border-2 border-white/30 shadow-xl rounded-2xl"
                >
                  Learn More
                </Button>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-20 left-10 hidden lg:block"
              >
                <div className="w-20 h-20 bg-yellow-400/20 backdrop-blur-lg rounded-full border border-yellow-400/30"></div>
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-20 right-10 hidden lg:block"
              >
                <div className="w-32 h-32 bg-blue-400/20 backdrop-blur-lg rounded-full border border-blue-400/30"></div>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="url(#wave-gradient)"/>
              <defs>
                <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(241, 245, 249, 0.8)" />
                  <stop offset="100%" stopColor="rgba(241, 245, 249, 1)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* Stats Section */}
       

        {/* Features Section */}
        <section className="py-20 md:py-28 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block"
              >
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                  WHY CHOOSE US
                </span>
              </motion.div>
              
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
              >
                Experience the CoolieMate Difference
              </motion.h2>
              
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
              >
                The luggage will always be heavy, but with CoolieMate, the journey won't be. 
                We bring comfort, dignity, and convenience to every traveler.
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeUp}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <Card className="relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 rounded-3xl border-2 border-gray-100 hover:border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                      <CardContent className="pt-8 pb-8 px-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="font-bold text-xl text-gray-900">{feature.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
               
              </motion.div>
              
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white"
              >
                Transparent, Fair Pricing
              </motion.h2>
              
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto"
              >
                No hidden charges, no bargaining - just honest rates you can trust
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {pricing.map((tier, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <Card className="relative bg-white/10 backdrop-blur-lg rounded-3xl border-2 border-white/20 shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden h-full">
                    <CardContent className="pt-10 pb-10 px-8">
                      <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Briefcase className="w-12 h-12 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-black text-2xl mb-2 text-white">{tier.bags}</h3>
                          <p className="text-blue-200 font-medium">{tier.weight}</p>
                        </div>
                        
                        <div className="py-4">
                          <div className="text-6xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mb-2">
                            {tier.price}
                          </div>
                          <p className="text-blue-200">{tier.description}</p>
                        </div>
                        
                        <Button 
                          className="w-full py-6 text-lg font-bold rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-300 shadow-lg hover:shadow-white/20"
                        >
                          Select Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="inline-block bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl border border-white/20">
                <p className="text-blue-100 text-sm">
                  <span className="font-semibold text-yellow-300">Additional charges:</span> Late night (11 PM - 5 AM) +₹20 | Priority service +₹30
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-28 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-4">
                  HOW IT WORKS
                </span>
              </motion.div>
              
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
              >
                Simple, Fast & Reliable
              </motion.h2>
              
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-600 text-lg md:text-xl"
              >
                Get started in just 5 easy steps
              </motion.p>
            </div>

            <motion.div
              className="max-w-4xl mx-auto space-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                { text: "Enter your PNR number and travel details", icon: Smartphone },
                { text: "View instant pricing based on your luggage", icon: IndianRupee },
                { text: "Get assigned a certified porter", icon: Shield },
                { text: "Track your porter's location in real-time", icon: MapPin },
                { text: "Pay conveniently via app after service", icon: CheckCircle2 },
              ].map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={index}
                    variants={index % 2 === 0 ? slideLeft : slideRight}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="flex items-start space-x-6 p-6 md:p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-gray-900 text-lg md:text-xl font-semibold">{step.text}</p>
                    </div>
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <StepIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/book">
                <Button 
                  size="lg" 
                  className="font-bold text-lg px-12 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 rounded-2xl group"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold mb-4">
                  TESTIMONIALS
                </span>
              </motion.div>
              
              <motion.h2
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
              >
               Review by our Customers
              </motion.h2>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                { name: "Rajesh", role: "Frequent Traveler", rating: 5, text: "CoolieMate made my journey so much easier! No haggling, just straightforward service." },
                { name: "Priya ", role: "Business Professional", rating: 4, text: "The real-time tracking feature is a game-changer. I always know when my porter is arriving." },
                { name: "Patel", role: "Family Traveler", rating: 4, text: "Traveling with kids and luggage was a nightmare. CoolieMate solved everything!" },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 1, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6"
              >
                Ready to Experience Hassle-Free Travel?
              </motion.h2>
              
              <motion.p
                variants={fadeUp}
                className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto"
              >
                Join thousands of happy travelers who've made their journey comfortable with CoolieMate
              </motion.p>
              
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link to="/book" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-bold text-lg px-12 py-7 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 rounded-2xl group"
                  >
                    Book Your Porter Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-blue-200 text-sm"
              >
                No credit card required • Instant booking • 24/7 support
              </motion.p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;