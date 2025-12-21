import { useEffect, useRef } from 'react';

export default function PortalEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Portal parameters
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;

    const animate = () => {
      time += 0.01;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(26, 22, 37, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw multiple rotating rings
      for (let i = 0; i < 8; i++) {
        const radius = 100 + i * 40;
        const rotation = time * (0.5 + i * 0.1);
        const segments = 60;

        for (let j = 0; j < segments; j++) {
          const angle = (j / segments) * Math.PI * 2 + rotation;
          const nextAngle = ((j + 1) / segments) * Math.PI * 2 + rotation;

          // Pulsing effect
          const pulse = Math.sin(time * 2 + i * 0.5) * 0.3 + 0.7;
          const currentRadius = radius * pulse;

          // Color gradient based on position
          const hue = (i * 30 + j * 2 + time * 20) % 60 + 240; // Purple/blue range
          const alpha = 0.3 - (i * 0.03);

          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius, angle, nextAngle);
          ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw central glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        200
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - 200, centerY - 200, 400, 400);

      // Draw swirling particles
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2 + time * 0.5;
        const distance = 50 + Math.sin(time + i) * 100;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        const size = 2 + Math.sin(time * 2 + i) * 1;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${0.6 - distance / 300})`;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{
        mixBlendMode: 'screen',
      }}
    />
  );
}
