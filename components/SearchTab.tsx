import React, { useState, useEffect } from 'react';
import { Search, X, PlayCircle, Star, Calendar, Film, Tv } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { searchMediaCatalog, getTopSearches } from '../services/gemini';

interface SearchTabProps {
  onItemClick: (item: MediaItem) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ onItemClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [topSearches, setTopSearches] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-black pt-safe pb-24">
       {/* Sticky Header */}
       <div className="sticky top-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-md p-3 w-full border-b border-white/5">
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

       <div className="px-4 pt-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center pt-32 gap-4">
                 <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : query.length > 0 ? (
             <div className="space-y-4">
                 <h3 className="text-white font-bold text-lg mb-2">Results for "{query}"</h3>
                 
                 {results.length === 0 ? (
                     <div className="text-center py-20 text-gray-500">
                         <p>No results found.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {results.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => onItemClick(item)}
                                className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
                            >
                                <div className="aspect-[2/3] relative">
                                    <img 
                                        src={item.posterUrl || `https://via.placeholder.com/300x450?text=No+Poster`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        alt={item.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                                    
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        {item.rating || 'N/A'}
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h4 className="text-white text-sm font-bold line-clamp-2 leading-tight mb-1">{item.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-300">
                                            <span>{item.year || 'Unknown'}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-500" />
                                            <div className="flex items-center gap-1">
                                                {item.type === MediaType.MOVIE ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                                                {item.type === MediaType.MOVIE ? 'Movie' : 'TV'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>
          ) : (
             <div>
                <h3 className="text-white font-bold text-lg mb-4">Trending Searches</h3>
                <div className="flex flex-col gap-2">
                    {topSearches.map((item, index) => (
                        <div 
                            key={item.id}
                            onClick={() => onItemClick(item)} 
                            className="flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#252525] p-3 rounded-lg cursor-pointer transition-colors border border-white/5"
                        >
                             <div className="relative w-16 aspect-[2/3] bg-[#333] flex-shrink-0 rounded overflow-hidden">
                                  <img 
                                    src={item.posterUrl || `https://via.placeholder.com/100x150`}
                                    className="w-full h-full object-cover"
                                    alt={item.title}
                                  />
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                 <h4 className="text-white font-bold text-sm truncate mb-1">{item.title}</h4>
                                 <div className="flex items-center gap-3 text-xs text-gray-400">
                                     <span>{item.year}</span>
                                     <div className="flex items-center gap-1">
                                         <Star className="w-3 h-3 text-yellow-500" />
                                         {item.rating}
                                     </div>
                                 </div>
                             </div>

                             <PlayCircle className="w-8 h-8 text-white/20 group-hover:text-white transition-colors" />
                        </div>
                    ))}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
