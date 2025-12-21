import React from 'react';

export const GradientOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Left Orb */}
      <div
        className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-30 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '0s',
        }}
      />

      {/* Top Right Orb */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '1s',
        }}
      />

      {/* Middle Left Orb */}
      <div
        className="absolute top-1/3 -left-32 w-72 h-72 rounded-full opacity-25 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animationDelay: '2s',
        }}
      />

      {/* Bottom Right Orb */}
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-30 animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animationDelay: '1.5s',
        }}
      />

      {/* Center Orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
};
