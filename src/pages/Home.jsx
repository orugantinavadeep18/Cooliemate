import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Shield, Smartphone, IndianRupee, Clock, Star, Users, Award, CheckCircle, ArrowRight, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import * as THREE from 'three';

const AnimatedCounter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={nodeRef}>{count.toLocaleString()}</span>;
};

const ThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        if (Math.abs(positions[i * 3]) > 10) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 10) velocities[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      particles.rotation.y += 0.001;
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
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [1, 0.7]);
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const scaleSpring = useSpring(scaleProgress, springConfig);

  const features = [
    { icon: Smartphone, title: "Advance Booking", description: "Book a certified coolie by entering your PNR number", color: "from-blue-500 to-cyan-500" },
    { icon: IndianRupee, title: "Standardized Rates", description: "No bargaining, just clear, fixed pricing", color: "from-emerald-500 to-teal-500" },
    { icon: Clock, title: "Real-time Tracking", description: "Track your coolie's location, just like Uber", color: "from-purple-500 to-pink-500" },
    { icon: Shield, title: "Verified Porters", description: "All porters are certified and background-checked", color: "from-orange-500 to-red-500" },
  ];

  const pricing = [
    { bags: "1-2 bags", weight: "≤20 kg", price: "₹99", description: "Perfect for solo travelers", popular: false },
    { bags: "3-4 bags", weight: "21-40 kg", price: "₹149", description: "Ideal for families", popular: true },
    { bags: "5+ bags", weight: ">40 kg", price: "₹199", description: "For heavy luggage", popular: false },
  ];

  const stats = [
    { value: 5000, label: "Happy Travelers", icon: Users },
    { value: 150, label: "Verified Porters", icon: Shield },
    { value: 98, label: "% Satisfaction", icon: Star, suffix: "%" },
    { value: 10000, label: "Bags Carried", icon: Briefcase },
  ];

  const fadeUp = { 
    hidden: { opacity: 0, y: 60 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] } } 
  };

  const fadeIn = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1, transition: { duration: 0.8 } } 
  };

  const staggerContainer = { 
    hidden: {}, 
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } 
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pb-0 overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Parallax */}
      <section className="relative overflow-hidden min-h-screen flex items-center -mt-16 pt-16">
        <ThreeBackground />
        
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-indigo-900/90 to-purple-900/95" />
        
        <motion.div 
          className="absolute inset-0 opacity-20 hidden lg:block"
          style={{
            backgroundImage: `url('/img1.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            scale: scaleSpring,
          }}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp}>
              <motion.div
                className="inline-block mb-6 px-4 sm:px-6 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-blue-200 text-xs sm:text-sm font-medium flex items-center gap-2 justify-center">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" /> Revolutionizing Porter Services
                </p>
              </motion.div>
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl leading-tight px-4"
            >
              Welcome to<br />CoolieMate
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 text-white font-semibold px-4"
            >
              Your Personal Porter Booking Platform
            </motion.p>

            <motion.p 
              variants={fadeUp}
              className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-blue-100 italic max-w-2xl mx-auto px-4"
            >
              "Luggage help at your fingertips — making your journey lighter, one bag at a time"
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link to="/book">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="font-bold text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl rounded-full group w-full sm:w-auto"
                  >
                    Book a Porter Now
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-white/20 rounded-full w-full sm:w-auto"
                >
                  Download Our App
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-12 sm:mt-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
                  <motion.div
                    className="w-1.5 h-3 bg-white rounded-full mx-auto"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Animated Marquee */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white py-3 sm:py-4 shadow-lg relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <marquee behavior="scroll" direction="left" scrollamount="10" className="text-sm sm:text-base lg:text-lg font-semibold tracking-wide">
          🚉 Now available at Kurnool Railway Station! — Book your porter hassle-free with CoolieMate — Trusted by 5000+ travelers
        </marquee>
      </div>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl text-center relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="relative z-10">
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mx-auto mb-2 sm:mb-4" />
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
                      <AnimatedCounter end={stat.value} />
                      {stat.suffix || ''}
                    </div>
                    <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-blue-600 text-xs sm:text-sm font-semibold">OUR FEATURES</p>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent px-4">
              Why Choose CoolieMate?
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed px-4">
              The luggage will always be heavy, but with CoolieMate, the journey won't be.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
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
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 h-full relative overflow-hidden">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />
                    <div className="relative z-10">
                      <motion.div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-4 px-4 py-2 bg-white rounded-full shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-blue-600 text-xs sm:text-sm font-semibold">TRANSPARENT PRICING</p>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 text-gray-900 px-4">
              Fair & Fixed Rates
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto px-4">
              No hidden charges, no bargaining — just honest, upfront pricing
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {pricing.map((tier, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative"
              >
                {tier.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </div>
                  </motion.div>
                )}
                
                <div className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl h-full relative overflow-hidden ${tier.popular ? 'ring-2 sm:ring-4 ring-blue-500' : ''}`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  
                  <div className="relative z-10 text-center space-y-4 sm:space-y-6">
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${tier.popular ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Briefcase className={`w-8 h-8 sm:w-10 sm:h-10 ${tier.popular ? 'text-white' : 'text-gray-700'}`} />
                    </motion.div>
                    
                    <div>
                      <h3 className="font-bold text-xl sm:text-2xl mb-2 text-gray-900">{tier.bags}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm font-medium">{tier.weight}</p>
                    </div>
                    
                    <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {tier.price}
                    </div>
                    
                    <p className="text-gray-600 text-sm sm:text-base">{tier.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 sm:mt-12 text-center bg-white rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-700 font-medium text-sm sm:text-base">
              <span className="font-bold text-blue-600">Additional charges:</span> Late night (11 PM - 5 AM) +₹20 | Priority service +₹30
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-blue-600 text-xs sm:text-sm font-semibold">SIMPLE PROCESS</p>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 text-gray-900 px-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg sm:text-xl px-4">
              Book your porter in 5 simple steps
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { text: "Enter your PNR number and travel details", icon: Smartphone },
              { text: "View instant pricing based on your luggage", icon: IndianRupee },
              { text: "Get assigned a certified porter", icon: Shield },
              { text: "Track your porter's location in real-time", icon: MapPin },
              { text: "Pay conveniently via app after service", icon: CheckCircle },
            ].map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="group"
                >
                  <div className="flex items-center space-x-4 sm:space-x-6 p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg relative z-10"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {index + 1}
                    </motion.div>
                    
                    <div className="flex-1 relative z-10">
                      <p className="text-gray-900 font-semibold text-sm sm:text-base lg:text-lg">{step.text}</p>
                    </div>
                    
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 relative z-10" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="text-center mt-8 sm:mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/book">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="font-bold text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl rounded-full group">
                  Get Started Now
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 100, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 px-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-300 text-lg sm:text-xl px-4">
              Trusted by thousands of travelers across India
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { name: "Priya Sharma", role: "Business Traveler", rating: 5, text: "CoolieMate made my journey so much easier. The porter was punctual and professional!" },
              { name: "Rajesh Kumar", role: "Family Traveler", rating: 5, text: "Finally, a service that's transparent and reliable. No more haggling at the station!" },
              { name: "Anita Desai", role: "Student", rating: 5, text: "Affordable and convenient. The real-time tracking feature is amazing!" },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-gray-300 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600" />
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-yellow-300" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 px-4">
              Ready to Experience Hassle-Free Travel?
            </h2>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-blue-100 px-4">
              Join thousands of satisfied travelers who've made their journey lighter with CoolieMate
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/book">
                  <Button
                    size="lg"
                    className="font-bold text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl rounded-full group w-full sm:w-auto"
                  >
                    Book Your Porter
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full w-full sm:w-auto"
                >
                  Download App
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-6 sm:gap-8 text-center px-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <p className="text-2xl sm:text-3xl font-black">24/7</p>
                <p className="text-blue-100 text-xs sm:text-sm">Support Available</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black">100%</p>
                <p className="text-blue-100 text-xs sm:text-sm">Verified Porters</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black">5000+</p>
                <p className="text-blue-100 text-xs sm:text-sm">Happy Customers</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;