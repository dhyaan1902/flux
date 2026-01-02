
import React, { useState } from 'react';
import { MediaItem } from '../types';

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
      className="relative w-full aspect-[2/3] rounded-md overflow-hidden cursor-pointer active:scale-[0.96] transition-all duration-200 shadow-xl shadow-black/50 border border-white/5"
      onClick={() => onClick(item)}
    >
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton z-0" />
      )}

      <img
        src={imageUrl}
        alt={item.title}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover rounded-md ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
      />

      {/* Tap Overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 active:opacity-100 transition-opacity" />
    </div>
  );
};
