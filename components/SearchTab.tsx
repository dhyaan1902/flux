import React, { useState, useEffect } from 'react';
import { Search, X, PlayCircle, Star, Calendar, Film, Tv, User } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { searchMediaCatalog, getTopSearches } from '../services/gemini';

interface SearchTabProps {
    onItemClick: (item: MediaItem) => void;
}

type SearchFilter = 'ALL' | 'MOVIE' | 'TV';

export const SearchTab: React.FC<SearchTabProps> = ({ onItemClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MediaItem[]>([]);
    const [topSearches, setTopSearches] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<SearchFilter>('ALL');

    useEffect(() => {
        let active = true;
        getTopSearches().then(data => {
            if (active) setTopSearches(data);
        });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                const data = await searchMediaCatalog(query);
                setResults(data);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const filteredResults = results.filter(item => {
        if (filter === 'ALL') return true;
        if (filter === 'MOVIE') return item.type === MediaType.MOVIE;
        if (filter === 'TV') return item.type === MediaType.TV_SHOW;
        return true;
    });

    return (
        <div className="min-h-screen bg-black pt-safe pb-24">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md pb-2 border-b border-white/5">
                <div className="p-3">
                    <div className="flex items-center bg-[#262626] rounded-xl h-12 px-4 transition-all focus-within:bg-[#333] focus-within:ring-1 focus-within:ring-white/20">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search movies, shows, people..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white text-base placeholder-gray-500"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="p-1 rounded-full hover:bg-white/10">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Chips */}
                {query.length > 0 && (
                    <div className="flex items-center gap-3 px-4 pb-2">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'ALL' ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/10'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('MOVIE')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${filter === 'MOVIE' ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/10'}`}
                        >
                            <Film className="w-3 h-3" /> Movies
                        </button>
                        <button
                            onClick={() => setFilter('TV')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-2 ${filter === 'TV' ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/10'}`}
                        >
                            <Tv className="w-3 h-3" /> TV Shows
                        </button>
                    </div>
                )}
            </div>

            <div className="px-4 pt-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-32 gap-4">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : query.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">Results for "{query}"</h3>
                            <span className="text-xs text-gray-500 font-bold">{filteredResults.length} found</span>
                        </div>

                        {filteredResults.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                                <Search className="w-16 h-16 opacity-20" />
                                <p>No results found for "{query}" in {filter.toLowerCase()}.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {filteredResults.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => onItemClick(item)}
                                        className="group relative aspect-[2/3] bg-[#1a1a1a] rounded-md overflow-hidden cursor-pointer"
                                    >
                                        <img
                                            src={item.posterUrl || `https://via.placeholder.com/300x450?text=No+Poster`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            alt={item.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {item.rating && (
                                            <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                                <Star className="w-2 h-2 text-yellow-500 fill-current" />
                                                {item.rating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <h3 className="text-white font-bold text-lg mb-4">Top Searches</h3>
                        <div className="flex flex-col gap-2">
                            {topSearches.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => onItemClick(item)}
                                    className="flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#252525] p-3 rounded-lg cursor-pointer transition-colors border border-white/5 active:scale-98"
                                >
                                    <div className="relative w-24 aspect-[16/9] bg-[#333] flex-shrink-0 rounded overflow-hidden">
                                        <img
                                            src={item.backdropUrl || item.posterUrl || `https://via.placeholder.com/200x120`}
                                            className="w-full h-full object-cover"
                                            alt={item.title}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <PlayCircle className="w-8 h-8 text-white/80" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-sm truncate mb-1">{item.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span>{item.year}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                {item.rating?.toFixed(1) || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
