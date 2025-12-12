
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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


    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-black/95 backdrop-blur-sm`}>
            <div className="flex items-center justify-between px-4 py-2">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <img
                        src="/realnet.png"
                        alt="Netflix"
                        className="h-6 object-contain" // Slightly smaller logo
                    />
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-4 text-white">
                    <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                        {getInitials(userName)}
                    </div>
                </div>
            </div>

            {/* Category Pills - Scrollable Row */}
            <div
                className={`w-full overflow-x-auto scrollbar-hide px-4 pb-3 transition-all duration-300 ${scrolled ? 'opacity-0 -translate-y-4 pointer-events-none h-0 pb-0' : 'opacity-100 translate-y-0 h-auto'
                    }`}
            >
                <div className="flex items-center gap-2.5 pr-4 min-w-max relative">
                    {/* TV Shows */}
                    <button
                        onClick={() => handleCategoryClick(MediaType.TV_SHOW)}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${mediaType === MediaType.TV_SHOW
                            ? 'bg-white text-black font-bold'
                            : 'bg-transparent text-gray-200 border border-white/20 hover:border-white/40'
                            }`}
                    >
                        TV Shows
                    </button>

                    {/* Movies */}
                    <button
                        onClick={() => handleCategoryClick(MediaType.MOVIE)}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${mediaType === MediaType.MOVIE
                            ? 'bg-white text-black font-bold'
                            : 'bg-transparent text-gray-200 border border-white/20 hover:border-white/40'
                            }`}
                    >
                        Movies
                    </button>

                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => onSelectGenre(genre.id)}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${selectedGenreId === genre.id
                                ? 'bg-white text-black font-bold'
                                : 'bg-transparent text-gray-200 border border-white/20 hover:border-white/40'
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

