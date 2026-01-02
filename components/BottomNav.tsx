
import React from 'react';
import { Home, Search, Library } from 'lucide-react';
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
    { id: 'library', icon: Library, label: 'Library' },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'JS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 pb-safe px-safe">
      <div className="flex justify-around items-center px-4 h-14">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-all active:scale-90"
            >
              <item.icon
                className={`w-5 h-5 mb-1 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[9px] tracking-tight transition-all duration-200 ${isActive ? 'text-white font-bold' : 'text-gray-600 font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* My Netflix Tab */}
        <button
          onClick={() => onTabChange('my-netflix')}
          className="relative flex flex-col items-center justify-center w-full h-full transition-all active:scale-90"
        >
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold border transition-all duration-200 mb-1 ${activeTab === 'my-netflix'
            ? 'bg-red-600 text-white border-red-500 scale-110 shadow-lg shadow-red-600/20'
            : 'bg-[#1a1a1a] text-gray-500 border-white/5'
            }`}>
            {getInitials(userName)}
          </div>
          <span className={`text-[9px] tracking-tight transition-all duration-200 ${activeTab === 'my-netflix' ? 'text-white font-bold' : 'text-gray-600 font-medium'}`}>
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};
