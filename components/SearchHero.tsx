import React, { useState } from 'react';
import { Search, Loader2, Database } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  return (
    <div className="relative w-full py-20 lg:py-32 flex flex-col items-center text-center px-4 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
          <Database className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-medium text-gray-300">Powered by OMDb API</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Find any movie or show,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            instantly cataloged.
          </span>
        </h1>

        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Search the global database for movies and TV shows. Get real-time IMDb IDs, ratings, cast info, and official posters.
        </p>

        <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
            <div className="relative flex items-center bg-[#1a1b26] rounded-md border border-white/10 shadow-2xl">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search 'Inception', 'Breaking Bad', '90s Sci-Fi'..."
                className="w-full bg-transparent py-4 pl-12 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-0 rounded-md"
                disabled={isLoading}
              />
              <div className="absolute right-2">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mr-2" />
                ) : (
                  <button
                    type="submit"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
                  >
                    <span className="sr-only">Search</span>
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['Interstellar', 'The Office', 'The Matrix', 'Friends'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setInputValue(term);
                onSearch(term);
              }}
              className="px-4 py-1.5 rounded-full text-sm bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition-all"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};