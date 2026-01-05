
import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it enters the viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const seed = item.imdbId || item.title;
  const imageUrl = (item.posterUrl && item.posterUrl !== 'N/A')
    ? item.posterUrl
    : `https://picsum.photos/seed/${seed}/300/450`;

  return (
    <div
      ref={cardRef}
      className="relative w-full aspect-[2/3] rounded-lg overflow-hidden cursor-pointer active:scale-[0.96] transition-all duration-200 bg-black shadow-lg shadow-black/40"
      onClick={() => onClick(item)}
    >
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton z-0" />
      )}

      {isInView && (
        <img
          src={imageUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} transition-all duration-500`}
        />
      )}

      {/* Tap Overlay */}
      <div className="absolute inset-0 bg-white/[0.08] opacity-0 active:opacity-100 transition-opacity duration-100" />
    </div>
  );
};
