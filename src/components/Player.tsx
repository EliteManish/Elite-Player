import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Maximize, Minimize, Pause, Play, Volume2, VolumeX, Settings, 
  PictureInPicture, RotateCcw, RotateCw, Lock, Unlock, Download, 
  ChevronRight, Monitor, Languages, FastForward, Flag, Check, Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PlayerProps {
  url: string;
  title?: string;
  category?: string;
  poster?: string;
  year?: string;
  language?: string;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  url, title, category, poster, year = '2024', language = 'Hindi', onEnded, onError 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'quality' | 'speed' | 'audio' | 'resize'>('main');
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [qualities, setQualities] = useState<{ height: number; index: number }[]>([]);
  const [audioTracks, setAudioTracks] = useState<{ name: string; index: number }[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState(-1); // -1 is auto
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isBrilliantMode, setIsBrilliantMode] = useState(false);
  const [resizeMode, setResizeMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  
  const controlsTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    setIsLoading(true);

    const playVideo = async () => {
      if (!video) return;
      try {
        await video.play();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        }
      }
    };

    if (url.includes('.m3u8') || url.includes('m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          const mappedQualities = hls!.levels.map((l, i) => ({ height: l.height, index: i }));
          setQualities(mappedQualities);
          
          const mappedTracks = hls!.audioTracks.map((t, i) => ({ name: t.name, index: i }));
          setAudioTracks(mappedTracks);
          
          playVideo();
        });
        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
          setCurrentAudioIndex(data.id);
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (hls?.autoLevelEnabled) {
               setCurrentQualityIndex(-1);
          } else {
               setCurrentQualityIndex(data.level);
          }
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR: hls!.startLoad(); break;
              case Hls.ErrorTypes.MEDIA_ERROR: hls!.recoverMediaError(); break;
              default: onError?.(data); break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          playVideo();
        });
      }
    } else {
      // Standard video fallback (MP4, WebM, etc)
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setDuration(video.duration);
        playVideo();
      });
      video.addEventListener('error', (e) => {
        onError?.(e);
      });
    }

    const timeUpdate = () => setCurrentTime(video.currentTime);
    const durationChange = () => setDuration(video.duration);
    const playState = () => setIsPlaying(true);
    const pauseState = () => setIsPlaying(false);

    video.addEventListener('timeupdate', timeUpdate);
    video.addEventListener('durationchange', durationChange);
    video.addEventListener('play', playState);
    video.addEventListener('pause', pauseState);

    return () => {
      if (hls) hls.destroy();
      hlsRef.current = null;
      video.removeEventListener('timeupdate', timeUpdate);
      video.removeEventListener('durationchange', durationChange);
      video.removeEventListener('play', playState);
      video.removeEventListener('pause', pauseState);
    };
  }, [url]);

  const handleQualityChange = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQualityIndex(index);
    }
  };

  const handleAudioChange = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index;
      setCurrentAudioIndex(index);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    if (isLocked) return;
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        try {
          await video.play();
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error("Playback toggle failed:", err);
            setIsPlaying(false);
          }
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        const screenAny = screen as any;
        if (screenAny.orientation && screenAny.orientation.lock) {
          screenAny.orientation.lock('landscape').catch(() => {
            // Orientation lock might fail on some devices/browsers, ignore quietly
          });
        }
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleControls = () => {
    if (showSettings) {
      setShowSettings(false);
      setSettingsView('main');
      return;
    }
    
    if (showControls) {
      setShowControls(false);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    } else {
      setShowControls(true);
      startControlsTimer();
    }
  };

  const startControlsTimer = () => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    startControlsTimer();
  };

  const seek = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleProgressBarInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
  };

  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressBarInteraction(e);
  };

  const onDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressBarInteraction(e);
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const [showBrilliantMode, setShowBrilliantMode] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const brandingTimer = useRef<number | null>(null);
  const brandingHideTimer = useRef<number | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowBranding(true);
    if (brandingHideTimer.current) clearTimeout(brandingHideTimer.current);
    brandingHideTimer.current = window.setTimeout(() => setShowBranding(false), 2000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleMouseMove();
    if (brandingTimer.current) clearTimeout(brandingTimer.current);
    brandingTimer.current = window.setTimeout(() => {
      setShowBranding(true);
      if (brandingHideTimer.current) clearTimeout(brandingHideTimer.current);
      brandingHideTimer.current = window.setTimeout(() => setShowBranding(false), 2000);
    }, 800); 
  };

  const handleTouchEnd = () => {
    if (brandingTimer.current) clearTimeout(brandingTimer.current);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg md:rounded-2xl overflow-hidden group select-none shadow-2xl touch-action-none transition-colors duration-500",
        isBrilliantMode ? "bg-zinc-950 ring-1 ring-white/10" : "bg-black"
      )}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      onClick={toggleControls}
    >
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full cursor-pointer transition-all duration-300",
          resizeMode === 'cover' ? "object-cover" : resizeMode === 'fill' ? "object-fill" : "object-contain"
        )}
        onClick={(e) => {
          e.stopPropagation();
          toggleControls();
        }}
        poster={poster}
        playsInline
      />

      {/* Elite Branding at bottom */}
      <AnimatePresence>
        {showBranding && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-6 left-6 z-[100] pointer-events-none"
          >
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-sm font-black italic tracking-tighter text-white/60">
              Elite Player
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
          />
        </div>
      )}

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 flex flex-col justify-between"
          >
            {/* Top Bar - Metadata */}
            {!isLocked && (
              <div className="p-4 md:p-8 flex items-start justify-between" onClick={(e) => e.stopPropagation()}>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-white text-sm sm:text-base md:text-2xl font-bold tracking-tight drop-shadow-lg uppercase leading-tight truncate max-w-[250px] sm:max-w-md md:max-w-4xl">
                      {title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-wider">{category || 'Video Stream'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Center Controls */}
            <div 
              className="flex-1 flex items-center justify-center gap-6 sm:gap-12 md:gap-24 relative"
              onClick={(e) => {
                e.stopPropagation();
                toggleControls();
              }}
            >
              {!isLocked && (
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: -15 }}
                  whileTap={{ scale: 0.9, rotate: -45 }}
                  onClick={(e) => { e.stopPropagation(); seek(-10); }}
                  className="text-white hover:text-blue-400 transition-all"
                >
                  <RotateCcw className="w-10 h-10 md:w-16 md:h-16" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-20 h-20 md:w-32 md:h-32 flex items-center justify-center text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform"
              >
                {isPlaying ? <Pause className="w-12 h-12 md:w-20 md:h-20 fill-current" /> : <Play className="w-12 h-12 md:w-20 md:h-20 ml-1.5 fill-current" />}
              </motion.button>

              {!isLocked && (
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9, rotate: 45 }}
                  onClick={(e) => { e.stopPropagation(); seek(10); }}
                  className="text-white hover:text-blue-400 transition-all"
                >
                  <RotateCw className="w-10 h-10 md:w-16 md:h-16" />
                </motion.button>
              )}
            </div>

            {/* Bottom Section */}
            <div className="px-4 md:px-10 pb-4 md:pb-8 space-y-4 md:space-y-6" onClick={(e) => e.stopPropagation()}>
              {/* Progress Bar (Static for Live, Dynamic for VOD) */}
              <div 
                className="relative w-full h-1 md:h-2 bg-white/20 rounded-full cursor-pointer flex items-center group/progress"
                onMouseDown={onDragStart}
                onMouseMove={onDragMove}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onTouchStart={onDragStart}
                onTouchMove={onDragMove}
                onTouchEnd={onDragEnd}
              >
                <div className="absolute inset-0 bg-white/10 rounded-full" />
                <motion.div 
                   className="absolute top-0 left-0 h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-end"
                   style={{ width: duration ? `${(currentTime / duration) * 100}%` : '100%' }}
                >
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-xl scale-0 group-hover/progress:scale-100 transition-transform translate-x-1/2" />
                </motion.div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsLocked(!isLocked); }}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isLocked ? <Lock size={24} /> : <Unlock size={24} />}
                  </button>

                  {!isLocked && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {isMuted ? <VolumeX size={26} /> : <Volume2 size={26} />}
                      </button>
                      <div className="text-white text-sm md:text-lg font-medium tabular-nums drop-shadow-md">
                        {formatTime(currentTime)} <span className="text-white/30 px-1">/</span> {formatTime(duration)}
                      </div>
                    </>
                  )}
                </div>

                {!isLocked && (
                  <div className="flex items-center gap-3 md:gap-7">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                      }}
                      className={cn(
                        "p-2 rounded-xl transition-all shadow-xl",
                        showSettings ? "bg-blue-600 text-white" : "text-white hover:bg-white/10"
                      )}
                    >
                      <Settings size={28} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Close Overlay */}
            <div 
              className="absolute inset-0 z-50" 
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(false);
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className="absolute top-1/2 -translate-y-1/2 right-6 w-72 md:w-80 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-3xl p-6 z-[60] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
            {settingsView === 'main' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-white text-lg font-bold">Settings</h3>
                  <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-white/5 py-1.5 px-3 rounded-lg">
                    <Flag size={14} /> Report
                  </button>
                </div>

                <div className="space-y-2">
                  <SettingItem 
                    icon={<Maximize size={18} />} 
                    label="Resize Mode" 
                    value={resizeMode.charAt(0).toUpperCase() + resizeMode.slice(1)} 
                    onClick={() => setSettingsView('resize')}
                  />
                  <SettingItem 
                    icon={<Settings size={18} />} 
                    label="Quality" 
                    value={currentQualityIndex === -1 ? 'Auto' : `${qualities[currentQualityIndex]?.height}p`} 
                    onClick={() => setSettingsView('quality')}
                  />
                  <SettingItem 
                    icon={<FastForward size={18} />} 
                    label="Playback speed" 
                    value={playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`} 
                    onClick={() => setSettingsView('speed')}
                  />
                </div>
              </>
            )}

            {settingsView === 'resize' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setSettingsView('main')}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <h3 className="text-white text-lg font-bold">Resize Mode</h3>
                </div>
                <div className="space-y-1">
                  {['contain', 'cover', 'fill'].map((m) => (
                    <SubSettingItem 
                      key={m}
                      label={m.charAt(0).toUpperCase() + m.slice(1)} 
                      active={resizeMode === m} 
                      onClick={() => { setResizeMode(m as any); setSettingsView('main'); }} 
                    />
                  ))}
                </div>
              </>
            )}

            {settingsView === 'quality' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setSettingsView('main')}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <h3 className="text-white text-lg font-bold">Quality</h3>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <SubSettingItem 
                    label="Auto" 
                    active={currentQualityIndex === -1} 
                    onClick={() => { handleQualityChange(-1); setSettingsView('main'); }} 
                  />
                  {qualities.slice().reverse().map((q) => (
                    <SubSettingItem 
                      key={q.index}
                      label={`${q.height}p`} 
                      active={currentQualityIndex === q.index} 
                      onClick={() => { handleQualityChange(q.index); setSettingsView('main'); }} 
                    />
                  ))}
                </div>
              </>
            )}

            {settingsView === 'speed' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setSettingsView('main')}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <h3 className="text-white text-lg font-bold">Playback speed</h3>
                </div>
                <div className="space-y-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <SubSettingItem 
                      key={s}
                      label={s === 1 ? 'Normal' : `${s}x`} 
                      active={playbackSpeed === s} 
                      onClick={() => { handleSpeedChange(s); setSettingsView('main'); }} 
                    />
                  ))}
                </div>
              </>
            )}

            {settingsView === 'audio' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setSettingsView('main')}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <h3 className="text-white text-lg font-bold">Audio & Subtitles</h3>
                </div>
                <div className="space-y-4">
                   <div>
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-3">Audio Tracks</p>
                     <div className="space-y-1">
                       {audioTracks.length > 0 ? (
                         audioTracks.map((t) => (
                           <SubSettingItem 
                             key={t.index}
                             label={t.name} 
                             active={currentAudioIndex === t.index} 
                             onClick={() => { handleAudioChange(t.index); setSettingsView('main'); }} 
                           />
                         ))
                       ) : (
                         <SubSettingItem label={language} active={true} onClick={() => setSettingsView('main')} />
                       )}
                     </div>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 px-3">Subtitles</p>
                     <SubSettingItem label="Off" active={true} onClick={() => setSettingsView('main')} />
                   </div>
                </div>
              </>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingItem: React.FC<{ icon: React.ReactNode, label: string, value: string, onClick?: () => void }> = ({ icon, label, value, onClick }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-all text-white group"
  >
    <div className="flex items-center gap-3">
      <div className="text-white/40 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] md:text-xs text-white/40 font-bold">{value}</span>
      <ChevronRight size={14} className="text-white/20" />
    </div>
  </button>
);

const SubSettingItem: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={cn(
      "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
      active ? "bg-blue-600/10 text-blue-400" : "text-white/60 hover:bg-white/5 hover:text-white"
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    {active && <Check size={16} />}
  </button>
);
