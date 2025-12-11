
import React, { useEffect, useState } from 'react';
import { Cast, Filter } from 'lucide-react';
import { Genre, MediaType } from '../types';

interface TopBarProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelectGenre: (id: number | null) => void;
  mediaType: MediaType | null;
  onSelectMediaType: (type: MediaType | null) => void;
  onCastClick: () => void;
  userName: string;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  genres, 
  selectedGenreId, 
  onSelectGenre, 
  mediaType, 
  onSelectMediaType, 
  onCastClick,
  userName 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [castAvailable, setCastAvailable] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Google Cast
  useEffect(() => {
      const initializeCast = () => {
        try {
            if (!(window as any).cast || !(window as any).cast.framework) return;
            
            setCastAvailable(true);
            const castContext = (window as any).cast.framework.CastContext.getInstance();
            
            castContext.setOptions({
                receiverApplicationId: (window as any).chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: (window as any).chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });

            castContext.addEventListener(
                (window as any).cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event: any) => {
                    switch (event.sessionState) {
                        case (window as any).cast.framework.SessionState.SESSION_STARTED:
                        case (window as any).cast.framework.SessionState.SESSION_RESUMED:
                            setCastSession(castContext.getCurrentSession());
                            break;
                        case (window as any).cast.framework.SessionState.SESSION_ENDED:
                            setCastSession(null);
                            break;
                    }
                }
            );
        } catch (e) {
            console.error("Cast init error", e);
        }
    };

    // Check if API available immediately
    if ((window as any).chrome && (window as any).chrome.cast && (window as any).cast && (window as any).cast.framework) {
        initializeCast();
    } else {
        // Register callback
        (window as any).__onGCastApiAvailable = (isAvailable: boolean) => {
            if (isAvailable) {
                initializeCast();
            }
        };
    }
  }, []);

  const handleRealCast = () => {
    if (castAvailable) {
      try {
          const castContext = (window as any).cast.framework.CastContext.getInstance();
          castContext.requestSession().then(
            (session: any) => {
                console.log("Session success", session);
            },
            (err: any) => {
                if (err.code !== 'cancel') {
                    console.error('Cast Error:', err);
                    onCastClick(); // Fallback
                }
            }
          );
      } catch (err) {
          console.error("Cast request error", err);
          onCastClick();
      }
    } else {
      // Fallback to simulation if API not available
      onCastClick();
    }
  };

  const handleCategoryClick = (type: MediaType | null) => {
      onSelectMediaType(type);
      if (type === null) onSelectGenre(null); // Reset genre when clicking All
  };

  const getInitials = (name: string) => {
    if (!name) return 'JS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-black/95 backdrop-blur-md shadow-md' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
            <div 
                className="flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                {/* Enhanced Stylized N */}
                <span 
                    className="text-[#E50914] font-black text-4xl md:text-5xl tracking-tighter"
                    style={{ 
                        textShadow: '0 4px 6px rgba(0,0,0,0.5)',
                        fontFamily: '"Arial Black", "Inter", sans-serif' 
                    }}
                >
                    N
                </span>
            </div>
        </div>
        
        {/* Right Icons */}
        <div className="flex items-center gap-5 text-white">
            <button onClick={handleRealCast} className="relative group">
                <Cast className={`w-5 h-5 drop-shadow-md cursor-pointer transition-colors ${castSession ? 'text-blue-500 fill-current' : 'text-white hover:text-gray-300'}`} />
            </button>
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
                {getInitials(userName)}
            </div>
        </div>
      </div>

      {/* Category Pills - Scrollable Row */}
      <div 
        className={`w-full overflow-x-auto scrollbar-hide px-4 pb-4 transition-all duration-300 ${
            scrolled ? 'opacity-0 -translate-y-4 pointer-events-none h-0 pb-0' : 'opacity-100 translate-y-0 h-auto'
        }`}
      >
        <div className="flex items-center gap-2 pr-4 min-w-max">
            {/* "All" Button */}
            <button 
                onClick={() => handleCategoryClick(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    mediaType === null && selectedGenreId === null
                    ? 'bg-white text-black border-white' 
                    : 'bg-black/30 backdrop-blur-sm border-gray-500 text-gray-200 hover:border-white'
                }`}
            >
                All
            </button>

            {/* TV & Movies Shortcuts */}
            <button 
                onClick={() => handleCategoryClick(MediaType.TV_SHOW)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    mediaType === MediaType.TV_SHOW
                    ? 'bg-white text-black border-white' 
                    : 'bg-black/30 backdrop-blur-sm border-gray-500 text-gray-200 hover:border-white'
                }`}
            >
                TV Shows
            </button>
            
            <button 
                onClick={() => handleCategoryClick(MediaType.MOVIE)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    mediaType === MediaType.MOVIE
                    ? 'bg-white text-black border-white' 
                    : 'bg-black/30 backdrop-blur-sm border-gray-500 text-gray-200 hover:border-white'
                }`}
            >
                Movies
            </button>

            {/* Separator */}
            <div className="w-px h-4 bg-gray-600 mx-1"></div>

            {/* Dynamic Genres */}
            {genres.map((genre) => (
                <button
                    key={genre.id}
                    onClick={() => onSelectGenre(genre.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                        selectedGenreId === genre.id
                        ? 'bg-white text-black border-white'
                        : 'bg-black/30 backdrop-blur-sm border-gray-500 text-gray-200 hover:border-white'
                    }`}
                >
                    {genre.name}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
