
import React, { useState } from 'react';
import { Plus, Info, Play, Check } from 'lucide-react';
import { MediaItem } from '../types';

interface HeroProps {
  item: MediaItem;
  onPlay: () => void;
  onInfo: () => void;
  isInMyList: boolean;
  onToggleMyList: () => void;
}

export const Hero: React.FC<HeroProps> = ({ item, onPlay, onInfo, isInMyList, onToggleMyList }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const seed = item.imdbId || 'hero';

  const rawUrl = item.backdropUrl || item.posterUrl || `https://picsum.photos/seed/${seed}/800/1200`;
  const backgroundUrl = rawUrl.replace('w342', 'original').replace('w1280', 'original');

  return (
    <div className="relative w-full aspect-[2/3] max-h-[85vh] overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundUrl}
          alt={item.title}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-[60%] gradient-overlay-bottom z-10" />
        <div className="absolute inset-x-0 top-0 h-32 gradient-overlay-top z-10" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 flex flex-col items-center text-center z-20 w-full px-6">
        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl tracking-tighter text-center max-w-5xl leading-[0.85] animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {item.title}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-in fade-in duration-1000 delay-300">
          {item.genres.slice(0, 3).map((g, i) => (
            <span key={i} className="text-[12px] text-white/70 font-bold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-6 w-full max-w-sm justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <button
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
            onClick={onToggleMyList}
          >
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
              {isInMyList ? <Check className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
            </div>
            <span className="text-[10px] text-white/60 font-bold tracking-widest">MY LIST</span>
          </button>

          <button
            onClick={onPlay}
            className="flex-1 flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black active:scale-[0.97] transition-all shadow-xl shadow-white/5"
          >
            <Play className="w-6 h-6 fill-black" />
            <span className="text-base tracking-tight">PLAY NOW</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
            onClick={onInfo}
          >
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] text-white/60 font-bold tracking-widest">INFO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
