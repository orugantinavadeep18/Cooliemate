import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const SplashScreen = () => {
  const mountRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      navigate('/home');
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);
    mountRef.current?.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1.5, 100);
    pointLight2.position.set(-10, -10, 5);
    scene.add(pointLight2);

    // Create animated luggage/briefcase geometry
    const group = new THREE.Group();
    
    // Main briefcase body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.7,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Handle
    const handleCurve = new THREE.TorusGeometry(0.6, 0.08, 16, 100, Math.PI);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      metalness: 0.8,
      roughness: 0.2,
    });
    const handle = new THREE.Mesh(handleCurve, handleMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.y = 1.2;
    group.add(handle);

    // Lock detail
    const lockGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32);
    const lockMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 1,
      roughness: 0.1,
    });
    const lock = new THREE.Mesh(lockGeometry, lockMaterial);
    lock.rotation.x = Math.PI / 2;
    lock.position.z = 0.3;
    group.add(lock);

    // Particles for effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    scene.add(group);
    camera.position.z = 5;

    // Animation
    let animationProgress = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      animationProgress += 0.01;

      // Rotate briefcase
      group.rotation.y += 0.02;
      group.rotation.x = Math.sin(animationProgress) * 0.1;

      // Pulse effect
      const scale = 1 + Math.sin(animationProgress * 2) * 0.05;
      group.scale.set(scale, scale, scale);

      // Rotate particles
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Color shift for lights
      pointLight.intensity = 2 + Math.sin(animationProgress * 3) * 0.5;
      pointLight2.intensity = 1.5 + Math.cos(animationProgress * 2) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Mark splash as shown and navigate
          setTimeout(() => {
            sessionStorage.setItem('splashShown', 'true');
            navigate('/home');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(progressInterval);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
      renderer.dispose();
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Three.js Canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 animate-pulse">
            CooliMate
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 font-light tracking-wide">
            Your Luggage, Our Priority
          </p>
        </div>

        {/* Loading Progress */}
        <div className="w-64 md:w-80 px-4">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              {/* Progress Bar Fill */}
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="mt-3 text-center">
              <span className="text-white/80 text-sm font-medium">
                Loading {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-12 text-center px-4">
          <p className="text-blue-100/60 text-sm md:text-base italic">
            Bringing comfort to every journey...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="mt-6 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-white/40 text-xs tracking-widest uppercase">
          Powered by Innovation
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;