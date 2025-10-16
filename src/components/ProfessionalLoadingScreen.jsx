import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

const ProfessionalLoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const mountRef = useRef(null);

  useEffect(() => {
    const duration = 4000;
    const steps = 100;
    const increment = 100 / steps;
    const intervalTime = duration / steps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete?.(), 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Gradient mesh background
    const geometry = new THREE.PlaneGeometry(50, 50, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = -10;
    scene.add(plane);

    // Floating geometric shapes
    const shapes = [];
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.TetrahedronGeometry(0.7, 0),
    ];

    for (let i = 0; i < 12; i++) {
      const geom = shapeGeometries[i % shapeGeometries.length];
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xef4444 : 0xdc2626,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20 - 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shapes.push(mesh);
      scene.add(mesh);
    }

    // Particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.03,
      opacity: 0.6,
      transparent: true,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 15;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      plane.rotation.z += 0.001;
      
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.002 * (index % 2 === 0 ? 1 : -1);
        shape.rotation.y += 0.003 * (index % 2 === 0 ? -1 : 1);
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
      });

      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50"
    >
      {/* Three.js Background */}
      <div ref={mountRef} className="absolute inset-0 opacity-50" />

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 md:p-12 max-w-xl mx-4 sm:mx-6 w-full"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/5 rounded-3xl" />

        <div className="relative space-y-6 sm:space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-red-500/30 rounded-full blur-3xl"
              />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <img
                  src="/logo.png"
                  alt="CoolieMate"
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="text-white text-2xl sm:text-3xl md:text-4xl font-bold">CM</div>';
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Coolie
              </span>
              <span className="text-gray-900">Mate</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium px-2">
              Professional Porter Services
            </p>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="space-y-4"
          >
            {/* Modern progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Loading your experience</span>
                <span className="text-red-600 font-bold tabular-nums">{Math.round(progress)}%</span>
              </div>
              
              <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute h-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-full"
                  style={{
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                  }}
                >
                  {/* Animated shimmer */}
                  <motion.div
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{ width: "50%" }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Status message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-500 text-xs sm:text-sm"
          >
            Setting up your workspace...
          </motion.p>
        </div>
      </motion.div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-40 h-40 sm:w-64 sm:h-64 bg-red-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-red-600/10 rounded-full blur-3xl" />
    </motion.div>
  );
};

export default ProfessionalLoadingScreen;