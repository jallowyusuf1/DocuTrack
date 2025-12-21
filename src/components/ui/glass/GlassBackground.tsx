import { GradientOrbs } from '../GradientOrbs';
import { GlassBackgroundGrid } from './Glass';

export function GlassBackground({
  gridOpacity = 0.12,
}: {
  gridOpacity?: number;
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <GradientOrbs />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 10%, rgba(139, 92, 246, 0.18) 0%, transparent 40%), radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.14) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(236, 72, 153, 0.10) 0%, transparent 50%)',
        }}
      />
      <GlassBackgroundGrid opacity={gridOpacity} />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  );
}

