
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

  const backgroundUrl = item.backdropUrl || item.posterUrl || `https://picsum.photos/seed/${seed}/800/1200`;

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
      <div className="absolute bottom-0 left-0 right-0 pb-12 flex flex-col items-center text-center z-20 w-full px-6 px-safe">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight text-center max-w-[90%] md:max-w-4xl leading-tight">
          {item.title}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8 items-center">
          {item.genres.slice(0, 3).map((g, i) => (
            <React.Fragment key={i}>
              <span className="text-[12px] text-gray-300 font-medium">
                {g}
              </span>
              {i < Math.min(2, item.genres.length - 1) && (
                <div className="w-1 h-1 rounded-full bg-gray-600" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-10 w-full max-w-sm justify-center group">
          <button
            className="flex flex-col items-center gap-2 active:scale-95 transition-all text-white/30"
            onClick={onToggleMyList}
          >
            {isInMyList ? <Check className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6" />}
            <span className="text-[10px] font-medium uppercase tracking-tighter">My List</span>
          </button>

          <button
            onClick={onPlay}
            className="px-12 flex items-center justify-center gap-2 bg-white text-black py-3 rounded-md font-bold active:scale-[0.98] transition-all"
          >
            <Play className="w-5 h-5 fill-black" />
            <span className="text-[14px] uppercase tracking-tighter">Play</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 active:scale-95 transition-all text-white/30"
            onClick={onInfo}
          >
            <Info className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-tighter">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};
