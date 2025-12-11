
import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Play } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const seed = item.imdbId || item.title;
  const imageUrl = (item.posterUrl && item.posterUrl !== 'N/A')
    ? item.posterUrl
    : `https://picsum.photos/seed/${seed}/300/450`;

  return (
    <div
      className="relative w-full aspect-[2/3] rounded-lg bg-[#1a1a1a] overflow-hidden cursor-pointer group transition-all duration-300 hover:z-10"
      onClick={() => onClick(item)}
    >
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-shimmer z-0" />
      )}

      <img
        src={imageUrl}
        alt={item.title}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      />

      {/* Hover Overlay with Play Button (Visible on Hover) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
        <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Netflix Mobile Logo Overlay for branding effect */}
      <div className="absolute top-1.5 left-1.5 opacity-90">
        <div className="text-[10px] font-black text-red-600 tracking-tighter drop-shadow-md"></div>
      </div>
    </div>
  );
};

