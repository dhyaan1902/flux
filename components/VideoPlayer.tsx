/**
 * Video Player Component - Embed Only
 * Simple iframe-based player with swipe-to-close from middle area only
 */

import React, { useEffect, useState, useRef } from 'react';
import { MediaItem, ServerProvider } from '../types';
import { getEmbedUrl } from '../services/stream';

interface VideoPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  server: ServerProvider;
  onClose: () => void;
  onProgress: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  season = 1,
  episode = 1,
  server,
  onClose,
  onProgress
}) => {
  const [showControls, setShowControls] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onProgress();
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: any;
    const reset = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', reset);
    window.addEventListener('touchstart', reset);
    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('touchstart', reset);
      clearTimeout(timeout);
    };
  }, []);

  // Check if touch is in the middle swipe zone (center 40% horizontally, top 30% vertically)
  const isInSwipeZone = (clientX: number, clientY: number): boolean => {
    if (!containerRef.current) return false;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Middle 40% of width
    const leftBound = rect.width * 0.3;
    const rightBound = rect.width * 0.7;
    // Top 25% of height (the drag handle area)
    const topBound = rect.height * 0.25;

    return relativeX >= leftBound && relativeX <= rightBound && relativeY <= topBound;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (isInSwipeZone(touch.clientX, touch.clientY)) {
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      setIsDragging(true);
      e.stopPropagation();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      setDragY(diff);
      e.stopPropagation();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 150) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const src = getEmbedUrl(server, item.tmdbId, item.imdbId, item.type, season, episode);
  const opacity = Math.max(0.3, 1 - dragY / 300);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 overflow-hidden"
      style={{
        transform: `translateY(${dragY}px)`,
        opacity: opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }}
    >
      {/* Swipe-to-close Header Overlay - pointer-events-none to let clicks pass through to iframe */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 flex flex-col items-center pt-3 pb-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${showControls || isDragging ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Swipe Zone - pointer-events-auto to capture swipes only in this middle area */}
        <div
          className="flex flex-col items-center pointer-events-auto px-8 py-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle Pill */}
          <div className="w-12 h-1.5 bg-white/50 rounded-full mb-2" />
          <p className="text-white/60 text-xs">Swipe down to close</p>
        </div>
      </div>

      {/* Video iframe - full interaction allowed */}
      <iframe
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
