
import React from 'react';
import { Home, Search, Download, Ghost } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userName: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, userName }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'anime', icon: Ghost, label: 'Anime' },
    { id: 'downloads', icon: Download, label: 'Downloads' },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'JS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 pb-safe transition-all duration-300">
      <div className="flex justify-between items-center px-2 sm:px-4 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className="flex flex-col items-center gap-1 w-full py-1 group relative"
            >
              {/* Active Indicator Glow */}
              {isActive && (
                 <div className="absolute -top-3 w-8 h-1 bg-red-600 rounded-b-full shadow-[0_0_10px_rgba(220,38,38,0.6)] animate-in fade-in duration-300" />
              )}
              
              <item.icon 
                className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-white scale-110 drop-shadow-md' : 'text-gray-500 group-hover:text-gray-300'}`} 
                strokeWidth={isActive ? 2.5 : 2} 
                fill={isActive && item.id !== 'search' && item.id !== 'downloads' ? 'currentColor' : 'none'}
              />
              <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* My Netflix Tab */}
        <button 
            onClick={() => onTabChange('my-netflix')}
            className="flex flex-col items-center gap-1 w-full py-1 group relative"
        >
            {activeTab === 'my-netflix' && (
                 <div className="absolute -top-3 w-8 h-1 bg-red-600 rounded-b-full shadow-[0_0_10px_rgba(220,38,38,0.6)] animate-in fade-in duration-300" />
            )}
            
            <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                activeTab === 'my-netflix' 
                ? 'bg-white text-black border-2 border-white scale-110 shadow-lg' 
                : 'bg-blue-600 text-white border border-transparent opacity-80 group-hover:opacity-100'
            }`}>
                {getInitials(userName)}
            </div>
            <span className={`text-[10px] font-medium transition-colors duration-300 ${activeTab === 'my-netflix' ? 'text-white' : 'text-gray-500'}`}>
                My Netflix
            </span>
        </button>
      </div>
    </div>
  );
};
