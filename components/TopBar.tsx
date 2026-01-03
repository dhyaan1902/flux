
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
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out pt-safe ${scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'
            }`}>
            <div className="flex items-center justify-between px-5 px-safe h-16">
                <div className="flex items-center">
                    {/* Minimal status indicator */}
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-20" />
                </div>

                {/* Right Profile */}
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/5 active:scale-95 transition-all text-white/50">
                        {getInitials(userName)}
                    </div>
                </div>
            </div>

            {/* Category Pills - Scrollable Row */}
            <div className={`w-full overflow-x-auto overflow-y-hidden scrollbar-hide px-5 px-safe transition-all duration-300 ease-in-out ${scrolled ? 'h-0 opacity-0 pointer-events-none' : 'h-12 opacity-100'
                }`}>
                <div className="flex items-center gap-2 pr-5 min-w-max h-8 mb-4">
                    {[
                        { id: null, label: 'All', type: null },
                        { id: 'tv', label: 'TV Shows', type: MediaType.TV_SHOW },
                        { id: 'movie', label: 'Movies', type: MediaType.MOVIE },
                    ].map((cat) => (
                        <button
                            key={cat.id || 'all'}
                            onClick={() => handleCategoryClick(cat.type)}
                            className={`px-4 h-full rounded-md text-[13px] font-medium transition-all ${mediaType === cat.type
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-white/40 border border-white/5'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => onSelectGenre(genre.id)}
                            className={`px-4 h-full rounded-md text-[13px] font-medium transition-all whitespace-nowrap ${selectedGenreId === genre.id
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-white/40 border border-white/5'
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
