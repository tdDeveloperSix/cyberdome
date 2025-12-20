import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, FastForward, Rewind, Scan, Radio, ShieldAlert, Cpu } from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  videoSrc?: string; // Optional background video (served locally recommended)
  duration: number; // Seconds to linger in this room
  analysis: string[]; // Bullet points for the "HUD analysis"
}

const SCENES: Scene[] = [
  {
    id: 'intro',
    title: 'Aalborg CyberDome',
    subtitle: 'Hub for digital modstandskraft',
    description: 'Et samlet miljø, hvor vi arbejder med digital sikkerhed i praksis. Det handler ikke kun om teknik—men om samspil mellem ledelse, teknik og mennesker.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    // Tip: Streamable-links bruger ofte udløbende signatur-URL’er. Læg derfor Veo-videoen lokalt i `public/videos/intro.mp4`.
    videoSrc: '/videos/intro.mp4',
    duration: 7,
    analysis: ['Velkommen', 'Tre zoner', 'Ét fælles sprog']
  },
  {
    id: 'command-center',
    title: 'THE COMMAND CENTER',
    subtitle: 'Zone 1 – ledelse og krisestyring',
    description: 'Her træner topledelsen beslutninger under pres i War Room. I ser også, hvordan deepfakes kan påvirke dømmekraft, og hvordan teams fungerer, når det spidser til.',
    image: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=2000&q=80',
    videoSrc: '/videos/command-center.mp4',
    duration: 10,
    analysis: ['War Room (360°)', 'Beslutninger under pres', 'Feedback og debrief']
  },
  {
    id: 'forge',
    title: 'THE FORGE',
    subtitle: 'Zone 2 – teknisk træning',
    description: 'I The Forge træner teknikere i sikre, isolerede miljøer. Her kan man øve både angreb og forsvar, arbejde med OT/IoT-hardware og løse CTF-udfordringer.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80',
    duration: 10,
    analysis: ['Cyber Range', 'OT/IoT Lab', 'CTF Arena']
  },
  {
    id: 'nexus',
    title: 'THE NEXUS',
    subtitle: 'Zone 3 – oplevelse og forståelse',
    description: 'The Nexus gør cyber forståeligt: historiske artefakter, VR-oplevelser, social engineering og en data-visualisering, der viser trusler som noget konkret.',
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=2000&q=80',
    duration: 9,
    analysis: ['Udstilling', 'VR', 'Adfærd og awareness']
  }
];

interface VirtualTourProps {
  onClose?: () => void;
  initialSceneIndex?: number;
  variant?: 'overlay' | 'hero';
}

export const VirtualTour: React.FC<VirtualTourProps> = ({ onClose, initialSceneIndex = 0, variant = 'overlay' }) => {
  const isOverlay = variant === 'overlay';
  const isHero = variant === 'hero';
  const [currentIndex, setCurrentIndex] = useState(initialSceneIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 for current slide
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const SCENE_DURATION_MS = SCENES[currentIndex].duration * 1000;
  const UPDATE_FREQ = 50; // ms

  // Handle Auto-Play Logic
  useEffect(() => {
    // Hero-baggrunden skal være statisk (ingen auto-skift af "skærm/scene")
    if (isHero) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    if (!isPlaying) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        const increment = (UPDATE_FREQ / SCENE_DURATION_MS) * 100;
        const next = prev + increment;
        
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, UPDATE_FREQ);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, currentIndex, isHero]);

  const handleNext = () => {
    if (isHero) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SCENES.length);
      setProgress(0);
      setIsTransitioning(false);
    }, 800); // Transition duration
  };

  const handlePrev = () => {
    if (isHero) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
      setProgress(0);
      setIsTransitioning(false);
    }, 800);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const scene = SCENES[currentIndex];

  // Sync play/pause state with background video (if present)
  useEffect(() => {
    if (isHero) return; // hero er statisk baggrund; video må gerne køre videre
    const v = videoRef.current;
    if (!v) return;
    // Sørg for at video aldrig spiller med lyd (også på devices der "glemmer" muted ved play()).
    v.muted = true;
    v.defaultMuted = true;
    if (isPlaying) {
      const p = v.play();
      if (p && typeof (p as Promise<void>).catch === 'function') {
        (p as Promise<void>).catch(() => {
          // Autoplay kan fejle på nogle devices/browsere; UI-knappen kan starte afspilning.
        });
      }
    } else {
      v.pause();
    }
  }, [isPlaying, currentIndex, isHero]);

  const containerClasses = isOverlay
    ? 'fixed inset-0 z-[100]'
    : 'absolute inset-0 w-full h-full';

  return (
    <div
      className={`${containerClasses} bg-black overflow-hidden font-mono text-cyan-500 select-none`}
      onTouchStart={(e) => {
        if (!isOverlay || isTransitioning) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest('button') || target?.closest('[data-tour-controls]')) return;
        const t = e.touches[0];
        if (!t) return;
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (!isOverlay || isTransitioning) return;
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest('button') || target?.closest('[data-tour-controls]')) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Swipe horizontally: avoid hijacking vertical scroll
        if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
          if (dx < 0) handleNext();
          else handlePrev();
        }
      }}
    >
      
      {/* --- Viewport Layer --- */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        
        {/* Background Media (Video preferred, fallback to image) */}
        <div
          key={scene.id} // Key change triggers re-render of animation
          className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          {scene.videoSrc ? (
            <video
              ref={(el) => { videoRef.current = el; }}
              className="absolute inset-0 w-full h-full object-cover"
              src={scene.videoSrc}
              poster={scene.image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={{
                animation: isPlaying && !isTransitioning ? `dolly-in ${scene.duration + 2}s linear forwards` : 'none',
                transform: isPlaying ? 'scale(1)' : 'scale(1.05)',
              }}
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${scene.image})`,
                animation: isPlaying && !isTransitioning ? `dolly-in ${scene.duration + 2}s linear forwards` : 'none',
                transform: isPlaying ? 'scale(1)' : 'scale(1.1)',
              }}
            />
          )}

          {/* Filters for Cyber Look */}
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay"></div>
        </div>

        {/* Transition "Warp" Effect */}
        {!isHero && isTransitioning && (
           <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="w-full h-2 bg-cyan-500 blur-md animate-[scan_0.5s_linear]"></div>
              <div className="absolute text-2xl md:text-4xl font-bold tracking-[0.6em] md:tracking-[1em] text-cyan-500 animate-pulse">Skifter</div>
           </div>
        )}

        {/* Vignette & Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      </div>

      {/* --- HUD Interface --- */}
      {!isHero && (
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 pointer-events-none">
        
        {/* Header HUD */}
        <div className="flex justify-between items-start">
           <div className="bg-black/70 border-l-4 border-cyan-500 p-3 md:p-4 backdrop-blur-sm transform transition-all duration-500 slide-in-left max-w-[85vw] md:max-w-none">
              <div className="flex items-center gap-2 mb-1">
                 {isPlaying ? <Radio className="w-4 h-4 animate-pulse text-red-500" /> : <Pause className="w-4 h-4 text-yellow-500" />}
                 <span className="text-[10px] md:text-xs font-bold tracking-widest text-cyan-300">
                    {isPlaying ? 'Automatisk rundtur' : 'Pause'}
                 </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1">{scene.title}</h1>
              <p className="text-xs md:text-sm text-cyan-200 tracking-wide font-mono">{scene.subtitle}</p>
           </div>

           <div className="flex gap-4 pointer-events-auto">
              {isOverlay && onClose && (
                <button
                  onClick={onClose}
                  aria-label="Luk rundtur"
                  className="p-3 md:p-2 bg-black/60 hover:bg-red-500/20 text-cyan-200 hover:text-red-400 border border-slate-700/50 hover:border-red-500 transition-all rounded-full group"
                >
                   <X className="w-7 h-7 md:w-8 md:h-8 group-hover:rotate-90 transition-transform" />
                </button>
              )}
           </div>
        </div>

        {/* Center Analysis HUD (Decorational) */}
        {!isTransitioning && (
           <div className="hidden md:block absolute top-1/2 right-10 -translate-y-1/2 w-64 space-y-2">
              {scene.analysis.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-black/60 border-r-2 border-cyan-500/50 p-2 text-right backdrop-blur-sm text-xs font-mono text-cyan-200 animate-in slide-in-from-right fade-in duration-700"
                  style={{ animationDelay: `${idx * 500 + 500}ms`, animationFillMode: 'both' }}
                >
                  {item}
                </div>
              ))}
           </div>
        )}
        
        {/* Center Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 md:opacity-30">
           <Scan className="w-40 h-40 md:w-64 md:h-64 text-cyan-200 stroke-[0.5]" />
        </div>

        {/* Footer HUD */}
        <div
          data-tour-controls
          className="bg-black/80 border-t border-cyan-900/50 backdrop-blur-md p-4 md:p-6 pointer-events-auto rounded-t-xl mx-auto w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)] pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
           <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
              
              {/* Description Text */}
              <div className="flex-1 text-center md:text-left max-h-[32vh] md:max-h-none overflow-auto md:overflow-visible pr-1">
                 <div className="flex items-center gap-2 text-cyan-400 mb-2 justify-center md:justify-start">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest">Overblik</span>
                 </div>
                 <p className="text-white/90 text-base md:text-lg leading-relaxed font-light">
                   {scene.description}
                 </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 md:gap-4 shrink-0">
                 <button
                   onClick={handlePrev}
                   aria-label="Forrige"
                   className="p-4 md:p-3 hover:bg-cyan-500/20 rounded-full transition-colors text-cyan-300"
                 >
                    <Rewind className="w-6 h-6" />
                 </button>
                 
                 <button 
                   onClick={togglePlay} 
                   aria-label={isPlaying ? 'Pause' : 'Afspil'}
                   className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 md:hover:scale-105"
                 >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                 </button>

                 <button
                   onClick={handleNext}
                   aria-label="Næste"
                   className="p-4 md:p-3 hover:bg-cyan-500/20 rounded-full transition-colors text-cyan-300"
                 >
                    <FastForward className="w-6 h-6" />
                 </button>
              </div>
           </div>

           {/* Progress Timeline */}
           <div className="mt-4 md:mt-6 flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] text-cyan-700 font-mono">SCENE {currentIndex + 1}/{SCENES.length}</span>
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden flex gap-1">
                 {SCENES.map((_, idx) => (
                    <div key={idx} className="flex-1 bg-gray-900 relative h-full">
                       {/* Completed Scenes */}
                       {idx < currentIndex && <div className="absolute inset-0 bg-cyan-700"></div>}
                       {/* Current Scene Progress */}
                       {idx === currentIndex && (
                         <div 
                           className="absolute left-0 top-0 bottom-0 bg-cyan-400 shadow-[0_0_10px_cyan]" 
                           style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
                         ></div>
                       )}
                    </div>
                 ))}
              </div>
              <span className="hidden sm:inline text-[10px] text-cyan-700 font-mono">SLUT</span>
           </div>
           <div className="mt-3 text-center text-[10px] text-slate-400 md:hidden">
             Tip: Swipe venstre/højre for at skifte scene.
           </div>
        </div>
      </div>
      )}

      <style>{`
        @keyframes dolly-in {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .slide-in-left {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
