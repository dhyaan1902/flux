
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
    <div className="relative w-full md:aspect-video aspect-[2/3] max-h-[85vh] overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundUrl}
          alt={item.title}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 md:pb-24 flex flex-col items-center text-center z-20 w-full px-8 px-safe">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter text-center max-w-[90%] md:max-w-5xl leading-[0.8] animate-in fade-in slide-in-from-bottom-12 duration-1000">
          {item.title}
        </h1>

        <div className="flex flex-wrap justify-center gap-1.5 mb-8 animate-in fade-in duration-1000 delay-300">
          {item.genres.slice(0, 3).map((g, i) => (
            <span key={i} className="text-[11px] text-white/80 font-bold bg-[#333]/40 px-3 py-1 rounded-md border border-white/5">
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-8 w-full max-w-sm justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <button
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            onClick={onToggleMyList}
          >
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/10 shadow-lg">
              {isInMyList ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <span className="text-[9px] text-white/60 font-black tracking-widest uppercase">My List</span>
          </button>

          <button
            onClick={onPlay}
            className="px-8 flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-full font-bold active:scale-[0.97] transition-all shadow-xl shadow-white/5"
          >
            <Play className="w-4 h-4 fill-black" />
            <span className="text-[13px] tracking-tight font-black">PLAY</span>
          </button>

          <button
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            onClick={onInfo}
          >
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/10 shadow-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <span className="text-[9px] text-white/60 font-black tracking-widest uppercase">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};
