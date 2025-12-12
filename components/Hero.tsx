
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

  // Prioritize backdrop (landscape) for Hero, fallback to poster
  const rawUrl = item.backdropUrl || item.posterUrl || `https://picsum.photos/seed/${seed}/800/1200`;
  const backgroundUrl = rawUrl.replace('w342', 'original').replace('w1280', 'original');

  return (
    <div className="relative w-full aspect-[2/3] max-h-[80vh] overflow-hidden bg-[#000000]">
      {/* Background Image - Static, no zoom */}
      <div className="absolute inset-0">
        <img
          src={backgroundUrl}
          alt={item.title}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Bottom vignette only */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 flex flex-col items-center text-center z-10 w-full">
        {/* Title - Enhanced typography */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tighter text-center max-w-5xl leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {item.title}
        </h1>

        {/* Genre Tags - Simple text with dots */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-6 px-8">
          {item.genres.slice(0, 4).map((g, i) => (
            <React.Fragment key={i}>
              <span className="text-[11px] text-white/90 font-medium tracking-wide shadow-black drop-shadow-md">
                {g}
              </span>
              {i < Math.min(3, item.genres.length - 1) && <span className="text-white/60 text-[10px]">•</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Buttons Row - Netflix Mobile Exact Style */}
        <div className="flex items-center justify-between w-full px-10 max-w-md mx-auto">
          {/* My List - Vertical Stack */}
          <button
            className="flex flex-col items-center gap-1 min-w-[60px]"
            onClick={onToggleMyList}
          >
            {isInMyList ? <Check className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
            <span className="text-[10px] text-[#b3b3b3] font-medium">My List</span>
          </button>

          {/* Play Button - White Block */}
          <button
            onClick={onPlay}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-[4px] font-bold min-w-[110px] h-[40px] active:opacity-80 transition-opacity"
          >
            <Play className="w-5 h-5 fill-black" />
            <span className="text-[16px]">Play</span>
          </button>

          {/* Info Button - Vertical Stack */}
          <button
            className="flex flex-col items-center gap-1 min-w-[60px]"
            onClick={onInfo}
          >
            <Info className="w-6 h-6 text-white" />
            <span className="text-[10px] text-[#b3b3b3] font-medium">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};
