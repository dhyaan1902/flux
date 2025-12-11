
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
  const backgroundUrl = item.backdropUrl || item.posterUrl || `https://picsum.photos/seed/${seed}/800/1200`;

  return (
    <div className="relative w-full aspect-[2/3] md:aspect-video max-h-[85vh] overflow-hidden bg-[#121212]">
      {/* Background Image with Zoom Animation */}
      <div className="absolute inset-0 overflow-hidden">
          <img 
            src={backgroundUrl} 
            alt={item.title} 
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover animate-ken-burns transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
      </div>
      
      {/* Refined Gradients for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#000000] z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent z-0" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 flex flex-col items-center text-center z-10">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl tracking-tight text-center max-w-4xl leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">
            {item.title}
        </h1>

        {/* Genre Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xs md:text-sm text-gray-200 font-medium drop-shadow-md opacity-90 animate-in fade-in slide-in-from-bottom-5 duration-1000">
           <span className="flex items-center gap-2">
             {item.genres.slice(0, 3).join(' • ')}
           </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-center w-full gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <button 
                className="flex flex-col items-center gap-1.5 text-white group hover:scale-105 transition-transform active:scale-95" 
                onClick={onToggleMyList}
            >
                {isInMyList ? <Check className="w-6 h-6 text-green-500" /> : <Plus className="w-6 h-6" />}
                <span className="text-[10px] font-medium text-gray-200 group-hover:text-white">My List</span>
            </button>

            <button 
                onClick={onPlay}
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-[4px] font-bold hover:bg-white/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                <Play className="w-6 h-6 fill-black" />
                <span className="text-lg">Play</span>
            </button>

            <button 
                className="flex flex-col items-center gap-1.5 text-white group hover:scale-105 transition-transform active:scale-95" 
                onClick={onInfo}
            >
                <Info className="w-6 h-6" />
                <span className="text-[10px] font-medium text-gray-200 group-hover:text-white">Info</span>
            </button>
        </div>
      </div>
    </div>
  );
};
