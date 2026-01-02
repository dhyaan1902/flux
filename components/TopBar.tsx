
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
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top)] ${scrolled ? 'bg-black border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.9)]' : 'bg-black/90 border-b border-white/5'
            }`}>
            <div className="flex items-center justify-between px-6 px-safe py-2.5">
                {/* Logo or Brand */}
                <div className="flex items-center gap-4">
                    <h1 className="text-red-600 font-extrabold text-2xl tracking-tighter">FLUX</h1>
                </div>

                {/* Right Profile */}
                <div className="flex items-center gap-4 text-white">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold border border-white/20 active:scale-95 transition-transform shadow-lg">
                        {getInitials(userName)}
                    </div>
                </div>
            </div>

            {/* Category Pills - Scrollable Row */}
            <div className={`w-full overflow-x-auto scrollbar-hide px-6 px-safe transition-all duration-300 ease-in-out ${scrolled ? 'h-0 opacity-0 pointer-events-none' : 'h-11 opacity-100'
                }`}>
                <div className="flex items-center gap-2 pr-6 min-w-max pb-3">
                    {[
                        { id: null, label: 'All', type: null },
                        { id: 'tv', label: 'TV Shows', type: MediaType.TV_SHOW },
                        { id: 'movie', label: 'Movies', type: MediaType.MOVIE },
                    ].map((cat) => (
                        <button
                            key={cat.id || 'all'}
                            onClick={() => handleCategoryClick(cat.type)}
                            className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${mediaType === cat.type && selectedGenreId === null
                                ? 'bg-white text-black'
                                : 'bg-[#1a1a1a] text-gray-400 border border-white/5'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}

                    <div className="w-px h-4 bg-white/10 mx-2" />

                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => onSelectGenre(genre.id)}
                            className={`px-5 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${selectedGenreId === genre.id
                                ? 'bg-white text-black'
                                : 'bg-[#1a1a1a] text-gray-400 border border-white/5'
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
