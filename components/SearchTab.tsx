
import React, { useState, useEffect } from 'react';
import { Search, X, PlayCircle, Star, Film, Tv } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { MediaCard } from './MediaCard';
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
            <div className="sticky top-0 z-30 glass backdrop-blur-3xl pb-4 border-b border-white/5">
                <div className="p-4">
                    <div className="flex items-center bg-white/5 rounded-xl h-14 px-5 transition-all focus-within:bg-white/10 ring-1 ring-white/10 focus-within:ring-red-600/50">
                        <Search className="w-5 h-5 text-gray-500 mr-4" />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Movies, shows, more..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white text-base placeholder-gray-600 font-medium"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-transform">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Chips - MD3 Style */}
                {query.length > 0 && (
                    <div className="flex items-center gap-3 px-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-6 py-2 rounded-md text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('MOVIE')}
                            className={`px-5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${filter === 'MOVIE' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                        >
                            <Film className="w-3.5 h-3.5" /> Movies
                        </button>
                        <button
                            onClick={() => setFilter('TV')}
                            className={`px-5 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${filter === 'TV' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                        >
                            <Tv className="w-3.5 h-3.5" /> TV
                        </button>
                    </div>
                )}
            </div>

            <div className="px-5 pt-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-32">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-red-900/20" />
                    </div>
                ) : query.length > 0 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            {filteredResults.map(item => (
                                <div key={item.id} className="animate-in fade-in duration-500">
                                    <MediaCard item={item} onClick={onItemClick} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700">
                        <h3 className="text-white font-black text-xl mb-6 tracking-tight">Top Searches</h3>
                        <div className="space-y-3">
                            {topSearches.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onItemClick(item)}
                                    className="flex items-center gap-4 bg-white/5 p-3 rounded-xl cursor-pointer transition-all border border-white/5 active:bg-white/10 active:scale-[0.98]"
                                >
                                    <div className="relative w-28 aspect-[16/9] bg-[#1e1e1e] flex-shrink-0 rounded-md overflow-hidden border border-white/5">
                                        <img
                                            src={item.backdropUrl || item.posterUrl}
                                            className="w-full h-full object-cover"
                                            alt={item.title}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <PlayCircle className="w-9 h-9 text-white/90" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-sm truncate mb-1">{item.title}</h4>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold">
                                            <span>{item.year}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                {item.rating?.toFixed(1)}
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
