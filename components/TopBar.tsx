
import React, { useEffect, useState } from 'react';
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
    userName
}) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCategoryClick = (type: MediaType | null) => {
        onSelectMediaType(type);
        if (type === null) onSelectGenre(null);
    };

    const getInitials = (name: string) => {
        if (!name) return 'JS';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 pt-safe ${scrolled ? 'glass pb-2' : 'bg-gradient-to-b from-black/80 to-transparent pb-4'
            }`}>
            <div className="flex items-center justify-between px-5 py-3">
                {/* Logo or Brand */}
                <div className="flex items-center gap-4">
                    <h1 className="text-red-600 font-black text-2xl tracking-tighter">FLUX</h1>
                </div>

                {/* Right Profile */}
                <div className="flex items-center gap-4 text-white">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] font-bold border border-white/20 active:scale-90 transition-transform shadow-lg shadow-blue-900/20">
                        {getInitials(userName)}
                    </div>
                </div>
            </div>

            {/* Category Pills - Scrollable Row */}
            <div className={`w-full overflow-x-auto scrollbar-hide px-5 transition-all duration-500 overflow-hidden ${scrolled ? 'h-0 opacity-0 pointer-events-none' : 'h-10 opacity-100'
                }`}>
                <div className="flex items-center gap-3 pr-4 min-w-max">
                    <button
                        onClick={() => handleCategoryClick(null)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${mediaType === null && selectedGenreId === null
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-gray-300 border-white/10'
                            }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => handleCategoryClick(MediaType.TV_SHOW)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${mediaType === MediaType.TV_SHOW
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-gray-300 border-white/10'
                            }`}
                    >
                        TV Shows
                    </button>

                    <button
                        onClick={() => handleCategoryClick(MediaType.MOVIE)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${mediaType === MediaType.MOVIE
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-gray-300 border-white/10'
                            }`}
                    >
                        Movies
                    </button>

                    {genres.slice(0, 10).map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => onSelectGenre(genre.id)}
                            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all border whitespace-nowrap ${selectedGenreId === genre.id
                                    ? 'bg-white text-black border-white'
                                    : 'bg-white/5 text-gray-300 border-white/10'
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
