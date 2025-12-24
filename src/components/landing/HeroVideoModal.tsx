import { useEffect, useMemo, useRef, useState } from 'react';
import { FastForward, Pause, Play, Rewind, Volume2, VolumeX, X } from 'lucide-react';
import FrostedModal from '../ui/FrostedModal';

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HeroVideoModal({
  isOpen,
  onClose,
  videoUrl,
  title = 'Watch the demo',
}: {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const hasVideo = !!videoUrl;

  useEffect(() => {
    if (!isOpen) return;
    // reset UI each open
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsMuted(false);
  }, [isOpen]);

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        // ignore autoplay restrictions
      }
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const seekBy = (deltaSeconds: number) => {
    const el = videoRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(Math.max(0, el.currentTime + deltaSeconds), el.duration);
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const progressPct = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  return (
    <FrostedModal
      isOpen={isOpen}
      onClose={() => {
        // pause on close
        videoRef.current?.pause?.();
        setIsPlaying(false);
        onClose();
      }}
      maxWidthClass="max-w-5xl"
      contentClassName="p-0"
      showTiledGlass
      backdropStyle={{
        background: 'rgba(0, 0, 0, 0.74)',
        backdropFilter: 'blur(34px)',
        WebkitBackdropFilter: 'blur(34px)',
      }}
      surfaceStyle={{
        background: 'rgba(255, 255, 255, 0.045)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
      }}
      zIndexClassName="z-[110]"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(18, 14, 28, 0.40)',
            backdropFilter: 'blur(26px)',
            WebkitBackdropFilter: 'blur(26px)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="min-w-0">
            <div className="text-white font-semibold text-lg truncate">{title}</div>
            <div className="text-white/60 text-xs truncate">
              {hasVideo ? 'Tip: Space to play/pause • ←/→ to seek' : 'Paste your video URL when ready'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill w-10 h-10 flex items-center justify-center"
            aria-label="Close"
            title="Close"
          >
            <X className="w-4 h-4 text-white/85" />
          </button>
        </div>

        {/* Video */}
        <div className="p-5">
          {!hasVideo ? (
            <div
              className="w-full rounded-3xl overflow-hidden flex items-center justify-center text-center px-6"
              style={{
                aspectRatio: '16 / 9',
                background: 'rgba(0,0,0,0.22)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div>
                <div className="text-white text-xl font-semibold mb-2">Video link needed</div>
                <div className="text-white/60 text-sm max-w-lg">
                  Send me the video link (mp4 or a direct file URL) and I’ll wire it in so this modal plays it.
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full rounded-3xl overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                controls={false}
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  const el = videoRef.current;
                  if (!el) return;
                  setDuration(el.duration || 0);
                }}
                onTimeUpdate={() => {
                  const el = videoRef.current;
                  if (!el) return;
                  setCurrentTime(el.currentTime || 0);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Controls */}
          {hasVideo && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => seekBy(-10)}
                  className="glass-pill w-11 h-11 flex items-center justify-center"
                  aria-label="Back 10 seconds"
                  title="Back 10s"
                >
                  <Rewind className="w-5 h-5 text-white/85" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="glass-pill w-12 h-12 flex items-center justify-center"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-white/90" /> : <Play className="w-5 h-5 text-white/90" />}
                </button>

                <button
                  type="button"
                  onClick={() => seekBy(10)}
                  className="glass-pill w-11 h-11 flex items-center justify-center"
                  aria-label="Forward 10 seconds"
                  title="Forward 10s"
                >
                  <FastForward className="w-5 h-5 text-white/85" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="glass-pill w-11 h-11 flex items-center justify-center ml-1"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-white/85" /> : <Volume2 className="w-5 h-5 text-white/85" />}
                </button>

                <div className="ml-auto text-white/65 text-xs tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(e) => {
                    const el = videoRef.current;
                    if (!el) return;
                    const v = Number(e.target.value);
                    el.currentTime = v;
                    setCurrentTime(v);
                  }}
                  className="w-full"
                  style={{
                    accentColor: '#8B5CF6',
                    background: `linear-gradient(90deg, rgba(139,92,246,0.85) ${progressPct}%, rgba(255,255,255,0.10) ${progressPct}%)`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </FrostedModal>
  );
}


