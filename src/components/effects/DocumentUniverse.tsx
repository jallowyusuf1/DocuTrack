import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, CreditCard, Shield, Calendar } from 'lucide-react';

interface FloatingDoc {
  id: number;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  speed: number;
  icon: typeof FileText;
  color: string;
}

export default function DocumentUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<FloatingDoc[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const icons = [FileText, CreditCard, Shield, Calendar];
    const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

    // Create floating documents
    const createDocs = () => {
      const docs: FloatingDoc[] = [];
      const numDocs = window.innerWidth < 768 ? 8 : 15;

      for (let i = 0; i < numDocs; i++) {
        docs.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 100,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360,
          rotationZ: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          speed: 0.1 + Math.random() * 0.2,
          icon: icons[Math.floor(Math.random() * icons.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      docsRef.current = docs;
    };

    createDocs();

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;

      docsRef.current.forEach((doc) => {
        // Gentle rotation
        doc.rotationX += doc.speed * 0.5;
        doc.rotationY += doc.speed * 0.3;
        doc.rotationZ += doc.speed * 0.2;

        // Orbital motion
        doc.x = 50 + Math.sin(time * doc.speed + doc.id) * 30;
        doc.y = 50 + Math.cos(time * doc.speed * 0.7 + doc.id) * 25;
        doc.z = 50 + Math.sin(time * doc.speed * 0.5 + doc.id) * 20;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        perspective: '1000px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {docsRef.current.map((doc) => (
        <FloatingDocument key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

function FloatingDocument({ doc }: { doc: FloatingDoc }) {
  const Icon = doc.icon;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${doc.x}%`,
        top: `${doc.y}%`,
        transform: `
          translateX(-50%)
          translateY(-50%)
          translateZ(${doc.z}px)
          rotateX(${doc.rotationX}deg)
          rotateY(${doc.rotationY}deg)
          rotateZ(${doc.rotationZ}deg)
          scale(${doc.scale})
        `,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        left: `${doc.x}%`,
        top: `${doc.y}%`,
        transform: `
          translateX(-50%)
          translateY(-50%)
          translateZ(${doc.z}px)
          rotateX(${doc.rotationX}deg)
          rotateY(${doc.rotationY}deg)
          rotateZ(${doc.rotationZ}deg)
          scale(${doc.scale})
        `,
      }}
      transition={{
        duration: 0.1,
        ease: 'linear',
      }}
    >
      <div
        className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center"
        style={{
          background: `rgba(${parseInt(doc.color.slice(1, 3), 16)}, ${parseInt(
            doc.color.slice(3, 5),
            16
          )}, ${parseInt(doc.color.slice(5, 7), 16)}, 0.2)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${doc.color}40`,
          boxShadow: `0 8px 32px ${doc.color}30`,
        }}
      >
        <Icon className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: doc.color }} />
      </div>
    </motion.div>
  );
}
