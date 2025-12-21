import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import VideoModal from '../../components/shared/VideoModal';
import {
  ArrowRight,
  Check,
  Calendar,
  Shield,
  Bell,
  Lock,
  Camera,
  FolderSearch,
  Clock,
  Zap,
  Users,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lightbulb,
  UserCog,
  Play,
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Design name: "planet documents" (keeping for restoration)
const DESIGN_NAME = 'planet documents';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { scrollYProgress } = useScroll();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Initialize 3D universe
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create star field
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create document planets
    const planets: THREE.Mesh[] = [];
    const planetData = [
      { name: 'passport', color: 0x4a90e2, size: 80, orbitRadius: 300, speed: 0.002 },
      { name: 'visa', color: 0x10b981, size: 60, orbitRadius: 400, speed: 0.003 },
      { name: 'id', color: 0xfbbf24, size: 50, orbitRadius: 350, speed: 0.0025 },
      { name: 'insurance', color: 0xef4444, size: 70, orbitRadius: 450, speed: 0.0035 },
      { name: 'subscription', color: 0x8b5cf6, size: 55, orbitRadius: 380, speed: 0.004 },
      { name: 'receipt', color: 0x06b6d4, size: 45, orbitRadius: 420, speed: 0.0028 },
    ];

    planetData.forEach((data, index) => {
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
      });
      const planet = new THREE.Mesh(geometry, material);
      
      const angle = (index / planetData.length) * Math.PI * 2;
      planet.position.x = Math.cos(angle) * data.orbitRadius;
      planet.position.z = Math.sin(angle) * data.orbitRadius;
      planet.userData = data;
      
      scene.add(planet);
      planets.push(planet);

      // Add orbital ring
      const ringGeometry = new THREE.RingGeometry(data.orbitRadius - 5, data.orbitRadius + 5, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: data.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional lights
    const light1 = new THREE.DirectionalLight(0x8b5cf6, 1);
    light1.position.set(500, 500, 500);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xec4899, 0.5);
    light2.position.set(-500, -500, -500);
    scene.add(light2);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      animationFrameRef.current = requestAnimationFrame(animate);

      // Rotate planets
      planets.forEach((planet, index) => {
        const data = planet.userData;
        planet.rotation.y += 0.005;
        
        const angle = time * data.speed + (index / planets.length) * Math.PI * 2;
        planet.position.x = Math.cos(angle) * data.orbitRadius;
        planet.position.z = Math.sin(angle) * data.orbitRadius;
      });

      // Camera follows mouse
      camera.rotation.x = mouseY * 0.1;
      camera.rotation.y = mouseX * 0.1;

      // Rotate stars
      stars.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, []);

  // Animate counters on scroll
  useEffect(() => {
    const counters = document.querySelectorAll('[data-target]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseFloat(counter.getAttribute('data-target') || '0');
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
              } else {
                counter.textContent = Math.floor(current).toLocaleString();
              }
            }, 16);
            observer.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
    return () => observer.disconnect();
  }, []);

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = e.clientX + 'px';
      particle.style.top = e.clientY + 'px';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing-page overflow-x-hidden">
      {/* 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{ background: 'radial-gradient(ellipse at center, #2A2640 0%, #1A1625 40%, #0a0a0a 100%)' }}
      />

      {/* SECTION 1: HERO - ACCOUNTING SOFTWARE STYLE */}
      <HeroSection navigate={navigate} onWatchDemo={() => setIsVideoModalOpen(true)} />

      {/* SECTION 2: FEATURE CARDS - "Be Tax Ready" Style */}
      <FeatureCardsSection />

      {/* SECTION 3: USER TYPE SELECTION */}
      <UserTypeSection navigate={navigate} />

      {/* SECTION 4: COMPARISON SECTION */}
      <ComparisonSection />

      {/* SECTION 5: FAQs SECTION */}
      <FAQsSection />

      {/* SECTION 6: FINAL CTA */}
      <FinalCTASection navigate={navigate} />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="/docutrackr-demo.mp4"
      />
    </div>
  );
}

// Hero Section Component
function HeroSection({ navigate, onWatchDemo }: { navigate: (path: string) => void; onWatchDemo: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={fadeInUp}
        className="relative z-10 max-w-6xl mx-auto text-center"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6"
        >
          Document Management That{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Exceeds Expectations
          </span>
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-purple-200 mb-12 max-w-3xl mx-auto"
        >
          Built native to track your documents. Never miss a deadline again.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="relative px-12 py-6 text-lg font-bold text-white rounded-full overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Get Started Free
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWatchDemo}
            className="px-12 py-6 text-lg font-bold text-white rounded-full glass-btn-secondary"
          >
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Stats Ticker */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: '10000', label: 'Active Users' },
            { number: '50000', label: 'Documents Tracked' },
            { number: '99.9', label: 'On-Time Renewals', suffix: '%' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              custom={i}
              className="text-center"
            >
              <div className="text-4xl font-bold text-white mb-2">
                <span data-target={stat.number}>0</span>
                {stat.suffix}
              </div>
              <div className="text-purple-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// Chart Content Component
function ChartContent({ isInView }: { isInView: boolean }) {
  return (
    <div className="space-y-4">
      <div className="h-24 md:h-32 bg-gradient-to-t from-blue-600/20 to-blue-400/40 rounded-lg flex items-end justify-between px-2 md:px-4 pb-2">
        {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((month, i) => (
          <div key={month} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={isInView ? { height: `${20 + i * 15}%`, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              className="w-full max-w-4 md:max-w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t mx-auto"
            />
            <span className="text-[10px] md:text-xs text-white/60">{month}</span>
          </div>
        ))}
      </div>
      <p className="text-xs md:text-sm text-white/60">Track your document lifecycle</p>
    </div>
  );
}

// Feature Cards Section - "Be Tax Ready" Style
function FeatureCardsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // GSAP scroll animations
  useEffect(() => {
    if (!isInView) return;
    
    const cards = ref.current?.querySelectorAll('.feature-card');
    if (cards) {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );
    }
  }, [isInView]);

  const features = [
    {
      title: 'Be Deadline Ready',
      subtitle: 'Cash & accrual together at last',
      content: (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-semibold text-sm md:text-base">
              Cash
            </button>
            <button className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm md:text-base">
              Accrual
            </button>
          </div>
          <p className="text-sm text-white/60">Track both methods seamlessly</p>
        </div>
      ),
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Be Organized Ready',
      subtitle: 'Real-time key metrics',
      content: 'chart', // Special marker
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Get Accurate Tracking, Faster',
      subtitle: 'Financials on the first of the month',
      content: (
        <div className="space-y-4">
          <div className="flex gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient1)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${98 * 2 * Math.PI * 0.98} ${2 * Math.PI * 40}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">98%</span>
                </div>
              </div>
              <p className="text-xs text-center text-white/60 mt-2">Auto-categorized</p>
            </div>
            <div className="flex-1">
              <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient2)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${90 * 2 * Math.PI * 0.9} ${2 * Math.PI * 40}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">90%</span>
                </div>
              </div>
              <p className="text-xs text-center text-white/60 mt-2">Finalized</p>
            </div>
          </div>
        </div>
      ),
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Spotlight Tool Highlights Changes',
      subtitle: 'See what matters most',
      content: (
        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Revenue</span>
              <span className="text-green-400 font-semibold">$18,328</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Expenses</span>
              <span className="text-red-400">-$212</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Tax</span>
              <span className="text-red-400">-$50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Fees</span>
              <span className="text-red-400">-$873</span>
            </div>
          </div>
        </div>
      ),
      icon: PieChart,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                custom={index}
                whileHover={{ scale: 1.02, y: -5 }}
                className="feature-card glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl hover:glass-card-elevated transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-white/60 mb-4">{feature.subtitle}</p>
                {feature.content === 'chart' ? (
                  <ChartContent isInView={isInView} />
                ) : (
                  feature.content
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// User Type Selection Section
function UserTypeSection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const userTypes = [
    {
      icon: Lightbulb,
      title: "I'm A Founder",
      description: 'I want a quick setup and minimal customization for the product.',
      cta: 'Explore features for founders',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: UserCog,
      title: "I'm An Accountant",
      description: 'I want an easy installation and minimal customization for the DocuTrackr product.',
      cta: 'Explore features for accountants',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {userTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={index}
                variants={scaleIn}
                custom={index}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl text-center hover:glass-card-elevated transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/signup')}
              >
                <div className="relative mb-4 md:mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-white/20 rounded-full" />
                  </div>
                  <div className={`relative w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">{type.title}</h3>
                <p className="text-white/70 mb-4 md:mb-6 text-sm md:text-base">{type.description}</p>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-green-400 font-semibold flex items-center justify-center gap-2"
                >
                  {type.cta}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// Comparison Section - "With Puzzle" vs "Without Puzzle"
function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  // Animate charts on scroll
  useEffect(() => {
    if (!isInView) return;
    
    // Animate progress circles
    const circles = ref.current?.querySelectorAll('circle[stroke*="gradient"]');
    if (circles) {
      circles.forEach((circle, i) => {
        const length = circle.getTotalLength();
        circle.style.strokeDasharray = `${length} ${length}`;
        circle.style.strokeDashoffset = `${length}`;
        
        gsap.to(circle, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: i * 0.2,
          ease: 'power2.out',
        });
      });
    }
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-bold text-center text-white mb-12"
        >
          Results In 5 Minutes, Not 5 Days
        </motion.h2>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {/* With DocuTrackr */}
          <motion.div variants={scaleIn} className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl">
            <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-4 md:mb-6">With DocuTrackr</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-5 h-5 text-green-400" />
                <span>3-5 Min</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>4 Steps</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Zap className="w-5 h-5 text-green-400" />
                <span>Free</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card-subtle p-3 md:p-4 rounded-xl">
                <div className="h-24 md:h-32 bg-gradient-to-t from-blue-600/20 to-blue-400/40 rounded-lg flex items-end justify-between px-2 pb-2 mb-2">
                  {[0.4, 0.6, 1.0, 0.8].map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0, opacity: 0 }}
                      animate={isInView ? { height: `${val * 100}%`, opacity: 1 } : {}}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      className="w-full max-w-8 md:max-w-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t flex-1 mx-0.5"
                    />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-white/60">Auto-generated document reports</p>
              </div>
              <div className="glass-card-subtle p-3 md:p-4 rounded-xl">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                  <svg className="w-24 h-24 md:w-32 md:h-32 transform -rotate-90">
                    <circle cx="48" cy="48" r="42" className="md:hidden" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="10" fill="none" />
                    <circle cx="64" cy="64" r="56" className="hidden md:block" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="12" fill="none" />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      className="md:hidden"
                      stroke="url(#gradient3-mobile)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${24 * 2 * Math.PI * 0.24} ${2 * Math.PI * 42}`}
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="hidden md:block"
                      stroke="url(#gradient3)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${24 * 2 * Math.PI * 0.24} ${2 * Math.PI * 56}`}
                    />
                    <defs>
                      <linearGradient id="gradient3-mobile">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                      <linearGradient id="gradient3">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl md:text-3xl font-bold text-white">$1.2M</span>
                    <span className="text-green-400 text-xs md:text-sm">↑ Up 24%</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-white/60 text-center mt-2">Instant metrics and insights</p>
              </div>
            </div>
          </motion.div>

          {/* Without DocuTrackr */}
          <motion.div variants={scaleIn} className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl opacity-60">
            <h3 className="text-xl md:text-2xl font-bold text-white/60 mb-4 md:mb-6">Without DocuTrackr</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-white/60">
                <Clock className="w-5 h-5" />
                <span>5 Days</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <XCircle className="w-5 h-5" />
                <span>15 Steps</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Zap className="w-5 h-5" />
                <span>$400-$1500</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card-subtle p-4 rounded-xl">
                <div className="h-24 md:h-32 border-2 border-dashed border-white/10 rounded-lg flex items-end justify-between px-2 pb-2 mb-2">
                  {[0, 0, 0, 0].map((_, i) => (
                    <div key={i} className="w-8 md:w-12 border border-white/10 rounded-t" style={{ height: '20%' }} />
                  ))}
                </div>
                <p className="text-sm text-white/40">Manual</p>
              </div>
              <div className="glass-card-subtle p-3 md:p-4 rounded-xl">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/10 flex items-center justify-center">
                    <span className="text-xl md:text-3xl font-bold text-white/40">$0</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-white/40 text-center mt-2">No metrics</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// FAQs Section
function FAQsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCategory, setActiveCategory] = useState<'founder' | 'accountant'>('founder');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // Animate FAQ items on scroll
  useEffect(() => {
    if (!isInView) return;
    
    const items = ref.current?.querySelectorAll('.faq-item');
    if (items) {
      gsap.fromTo(
        items,
        {
          opacity: 0,
          x: -30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [isInView, activeCategory]);

  const faqs = {
    founder: [
      {
        q: 'Why is DocuTrackr better for startups than other solutions like QuickBooks?',
        a: 'DocuTrackr is built specifically for document tracking and deadline management. Unlike generic accounting software, we focus on what matters most: never missing an expiration date.',
      },
      {
        q: "Why can't I rely solely on Stripe, Brex, and Ramp for document tracking?",
        a: 'While payment platforms track transactions, they don\'t manage important documents like passports, visas, insurance policies, or subscriptions. DocuTrackr fills that gap.',
      },
      {
        q: 'Can I really get started myself as a founder (with no accounting experience)?',
        a: 'Absolutely! DocuTrackr is designed to be intuitive. Just snap a photo of your document, and our AI extracts all the details. Set your expiration date, and you\'re done.',
      },
    ],
    accountant: [
      {
        q: 'How does DocuTrackr integrate with existing accounting workflows?',
        a: 'DocuTrackr complements your accounting software by focusing on document lifecycle management. Export data when needed, or use our API for seamless integration.',
      },
      {
        q: 'Can multiple team members access the same document database?',
        a: 'Yes! DocuTrackr supports team collaboration with role-based access. Share documents securely with family members or team members as needed.',
      },
      {
        q: 'What security measures are in place for sensitive documents?',
        a: 'We use bank-level encryption, password protection for sensitive documents, and secure cloud storage. Your data is encrypted both in transit and at rest.',
      },
    ],
  };

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-4xl md:text-5xl font-bold text-center text-white mb-8"
        >
          FAQs
        </motion.h2>

        {/* Category Toggle */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="flex gap-2 mb-6 md:mb-8 glass-card p-1 rounded-xl"
        >
          {(['founder', 'accountant'] as const).map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setOpenIndex(null);
              }}
              className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold text-sm md:text-base transition-all ${
                activeCategory === category
                  ? 'glass-btn-primary text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {category === 'founder' ? 'Founder' : 'Accountants'}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="space-y-3 md:space-y-4"
        >
          {faqs[activeCategory].map((faq, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
              custom={index}
              className="faq-item glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 md:p-6 flex items-center justify-between text-left"
              >
                <span className="text-white font-medium text-sm md:text-base pr-4">{faq.q}</span>
                <ChevronRight
                  className={`w-5 h-5 text-white/60 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 md:px-6 pb-4 md:pb-6 text-white/70 text-sm md:text-base">{faq.a}</div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection({ navigate }: { navigate: (path: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-purple-200 mb-8 md:mb-12">
            Join thousands who never miss a deadline
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="relative px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-bold text-white rounded-full overflow-hidden group mb-6 md:mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(139, 92, 246, 0.5)',
            }}
          >
            <span className="relative z-10">Create Free Account</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <div className="flex flex-wrap gap-4 md:gap-6 justify-center text-purple-300 text-xs md:text-sm">
            <span>🔒 Bank-Level Security</span>
            <span>⚡ Free Forever</span>
            <span>🌍 50,000+ Users</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
