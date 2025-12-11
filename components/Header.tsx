import React from 'react';
import { Film, Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#0f1014]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
            <Film className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CineVerse
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Movies</a>
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">TV Shows</a>
          <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Lists</a>
        </nav>

        <div className="flex items-center space-x-4">
           <button className="text-gray-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
           </button>
           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0f1014] flex items-center justify-center text-xs font-bold text-white">
                JS
              </div>
           </div>
        </div>
      </div>
    </header>
  );
};