import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, FastForward, Rewind, Scan, Radio, ShieldAlert, Cpu } from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  duration: number; // Seconds to linger in this room
  analysis: string[]; // Bullet points for the "HUD analysis"
}

const SCENES: Scene[] = [
  {
    id: 'approach',
    title: 'FACILITY APPROACH',
    subtitle: 'EXTERIOR PERIMETER',
    description: 'Ankomst til Cyberdome Aalborg. Bygningen er sikret med biometrisk adgangskontrol og Faraday-skærmet arkitektur.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    duration: 8,
    analysis: ['PERIMETER: SECURE', 'SIGNAL: ENCRYPTED', 'ACCESS: GRANTED']
  },
  {
    id: 'bridge',
    title: 'COMMAND BRIDGE',
    subtitle: 'ZONE 01 - STRATEGY',
    description: 'Nervescentret. Her samles direktionen foran en 360-graders data-væg. Real-time overvågning af trusselsbilledet.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2000&q=80', // Command center
    duration: 10,
    analysis: ['WALL: 8K MATRIX', 'CAPACITY: 12 EXEC', 'STATUS: LIVE']
  },
  {
    id: 'core',
    title: 'SERVER CORE',
    subtitle: 'ZONE 02 - CONTAINMENT',
    description: 'Maskinrummet. En fysisk "Escape Room" oplevelse med haptisk feedback. Her skal I manuelt genstarte kritiske systemer.',
    image: 'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=2000&q=80', // Industrial core
    duration: 10,
    analysis: ['TEMP: RISING', 'HAPTICS: ACTIVE', 'MODE: MANUAL OVERRIDE']
  },
  {
    id: 'vr',
    title: 'NEURAL LINK',
    subtitle: 'ZONE 03 - VISUALIZATION',
    description: 'VR-Laboratoriet. Se angrebet indefra. Kompleks kode visualiseres som 3D strukturer, hvilket gør det abstrakte konkret.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80', // VR / Cyber
    duration: 9,
    analysis: ['VR: IMMERSIVE', 'DATA: 3D RENDER', 'LINK: STABLE']
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

  const containerClasses = isOverlay
    ? 'fixed inset-0 z-[100]'
    : 'absolute inset-0 w-full h-full';

  return (
    <div className={`${containerClasses} bg-black overflow-hidden font-mono text-cyan-500 select-none`}>
      
      {/* --- Viewport Layer --- */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        
        {/* Background Image with "Dolly In" Animation */}
        <div 
          key={scene.id} // Key change triggers re-render of animation
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            backgroundImage: `url(${scene.image})`,
            animation: isPlaying && !isTransitioning ? `dolly-in ${scene.duration + 2}s linear forwards` : 'none',
            transform: isPlaying ? 'scale(1)' : 'scale(1.1)' // Maintain scale if paused
          }}
        >
          {/* Filters for Cyber Look */}
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay"></div>
        </div>

        {/* Transition "Warp" Effect */}
        {!isHero && isTransitioning && (
           <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="w-full h-2 bg-cyan-500 blur-md animate-[scan_0.5s_linear]"></div>
              <div className="absolute text-4xl font-bold tracking-[1em] text-cyan-500 animate-pulse">SKIFTER</div>
           </div>
        )}

        {/* Vignette & Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      </div>

      {/* --- HUD Interface --- */}
      {!isHero && (
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        
        {/* Header HUD */}
        <div className="flex justify-between items-start">
           <div className="bg-black/70 border-l-4 border-cyan-500 p-4 backdrop-blur-sm transform transition-all duration-500 slide-in-left">
              <div className="flex items-center gap-2 mb-1">
                 {isPlaying ? <Radio className="w-4 h-4 animate-pulse text-red-500" /> : <Pause className="w-4 h-4 text-yellow-500" />}
                 <span className="text-xs font-bold tracking-widest text-cyan-400">
                    {isHero ? 'STATISK VISNING' : (isPlaying ? 'AUTO-PILOT ENGAGED' : 'SYSTEM PAUSED')}
                 </span>
              </div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">{scene.title}</h1>
              <p className="text-sm text-cyan-300 tracking-wider font-mono">{scene.subtitle}</p>
           </div>

           <div className="flex gap-4 pointer-events-auto">
              {isOverlay && onClose && (
                <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-cyan-600 hover:text-red-500 border border-transparent hover:border-red-500 transition-all rounded-full group">
                   <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                </button>
              )}
           </div>
        </div>

        {/* Center Analysis HUD (Decorational) */}
        {!isTransitioning && (
           <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 space-y-2">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
           <Scan className="w-64 h-64 text-cyan-200 stroke-[0.5]" />
        </div>

        {/* Footer HUD */}
        <div className="bg-black/80 border-t border-cyan-900/50 backdrop-blur-md p-6 pointer-events-auto rounded-t-xl mx-auto w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
           <div className="flex flex-col md:flex-row gap-6 items-center">
              
              {/* Description Text */}
              <div className="flex-1 text-center md:text-left">
                 <div className="flex items-center gap-2 text-cyan-500 mb-2 justify-center md:justify-start">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest">Facility Intel</span>
                 </div>
                 <p className="text-white/90 text-lg leading-relaxed font-light">
                   {scene.description}
                 </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 shrink-0">
                 <button onClick={handlePrev} className="p-3 hover:bg-cyan-500/20 rounded-full transition-colors text-cyan-400">
                    <Rewind className="w-6 h-6" />
                 </button>
                 
                 <button 
                   onClick={togglePlay} 
                   className="w-16 h-16 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105"
                 >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                 </button>

                 <button onClick={handleNext} className="p-3 hover:bg-cyan-500/20 rounded-full transition-colors text-cyan-400">
                    <FastForward className="w-6 h-6" />
                 </button>
              </div>
           </div>

           {/* Progress Timeline */}
           <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] text-cyan-700 font-mono">SEQ_0{currentIndex + 1}</span>
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
              <span className="text-[10px] text-cyan-700 font-mono">END</span>
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
