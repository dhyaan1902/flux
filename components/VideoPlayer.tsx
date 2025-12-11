
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MediaItem, MediaType, ServerProvider } from '../types';
import { getEmbedUrl } from '../services/stream';

interface VideoPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  server: ServerProvider;
  onClose: () => void;
  onProgress: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ item, season = 1, episode = 1, server, onClose, onProgress }) => {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    onProgress();
  }, []);

  // --- CONTROLS VISIBILITY ---
  useEffect(() => {
    let timeout: any;
    const reset = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    // Listen to interactions
    window.addEventListener('mousemove', reset);
    window.addEventListener('touchstart', reset);
    window.addEventListener('click', reset);
    window.addEventListener('keydown', reset);

    // Initial hide
    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('touchstart', reset);
      window.removeEventListener('click', reset);
      window.removeEventListener('keydown', reset);
      clearTimeout(timeout);
    }
  }, []);

  const src = getEmbedUrl(server, item.tmdbId, item.imdbId, item.type, season, episode);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 overflow-hidden">

      {/* HEADER OVERLAY */}
      {/* Use pointer-events-none to pass clicks through when hidden, but auto on children when visible */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent pb-12 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-1 pointer-events-auto">
          <h2 className="text-white font-bold text-shadow drop-shadow-md max-w-[70vw] truncate">{item.title}</h2>
          <div className="flex items-center gap-2">
            {item.type === MediaType.TV_SHOW && <span className="text-gray-300 text-xs font-medium">S{season}:E{episode}</span>}
          </div>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 active:scale-90 shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* PLAYER CONTENT */}
      <div className="flex-1 w-full h-full bg-black relative flex items-center justify-center">
        {server === 'vidsrc' ? (
          <iframe
            key={`vidsrc-${src}`}
            src={src}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
            referrerPolicy="origin"
            title={item.title}
          />
        ) : (
          <iframe
            key={`vidrock-${src}`}
            src={src}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
            title={item.title}
          />
        )}
      </div>
    </div>
  );
};
