
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

const CategoryPill: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
}> = ({
    active,
    onClick,
    label
}) => (
        <button
            onClick={onClick}
            className={`px-4 h-full rounded-full text-[13px] font-medium transition-all duration-300 whitespace-nowrap border shadow-sm ${active
                ? 'bg-white text-black border-white shadow-white/10'
                : 'bg-white/[0.06] text-white/50 border-white/[0.08] hover:bg-white/[0.12] hover:text-white/70 hover:border-white/[0.15]'
                }`}
        >
            {label}
        </button>
    );

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
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out pt-safe ${scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'
            }`}>
            <div className="flex items-center justify-between px-6 px-safe h-16">
                <div className="flex items-center gap-2">
                    {/* Placeholder for future branding or left-aligned content */}
                </div>

                <div className="flex items-center gap-4">
                    {/* Profile badge removed */}
                </div>
            </div>

            {/* Category Pills - Scrollable Row */}
            <div className={`w-full overflow-x-auto overflow-y-hidden scrollbar-hide px-6 px-safe transition-all duration-300 ease-in-out ${scrolled ? 'h-0 opacity-0 pointer-events-none' : 'h-14 opacity-100'
                }`}>
                <div className="flex items-center gap-2.5 pr-6 min-w-max h-9 mb-4">
                    <CategoryPill
                        active={mediaType === null}
                        onClick={() => handleCategoryClick(null)}
                        label="All"
                    />
                    <CategoryPill
                        active={mediaType === MediaType.TV_SHOW}
                        onClick={() => handleCategoryClick(MediaType.TV_SHOW)}
                        label="TV Shows"
                    />
                    <CategoryPill
                        active={mediaType === MediaType.MOVIE}
                        onClick={() => handleCategoryClick(MediaType.MOVIE)}
                        label="Movies"
                    />

                    <div className="w-px h-5 bg-white/10 mx-2" />

                    {genres.map((genre) => (
                        <CategoryPill
                            key={genre.id}
                            active={selectedGenreId === genre.id}
                            onClick={() => onSelectGenre(genre.id)}
                            label={genre.name}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
