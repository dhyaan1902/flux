
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
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-50 pb-safe">
      <div className="flex justify-around items-center px-2 py-2 h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-all active:scale-90"
            >
              {/* Material You Active Indicator */}
              <div className={`absolute top-0 w-12 h-8 rounded-full transition-all duration-300 ${isActive ? 'bg-red-600/20 scale-100 opacity-100' : 'scale-75 opacity-0'}`} />

              <item.icon
                className={`w-6 h-6 mb-1 transition-colors duration-300 ${isActive ? 'text-red-500' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] transition-all duration-300 ${isActive ? 'text-white font-semibold' : 'text-gray-500 font-medium'}`}>
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
          <div className={`absolute top-0 w-12 h-8 rounded-full transition-all duration-300 ${activeTab === 'my-netflix' ? 'bg-red-600/20 scale-100 opacity-100' : 'scale-75 opacity-0'}`} />

          <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold border transition-all duration-300 mb-1 ${activeTab === 'my-netflix'
            ? 'bg-red-600 text-white border-red-500 scale-110'
            : 'bg-[#262626] text-gray-400 border-white/10'
            }`}>
            {getInitials(userName)}
          </div>
          <span className={`text-[10px] transition-all duration-300 ${activeTab === 'my-netflix' ? 'text-white font-semibold' : 'text-gray-500 font-medium'}`}>
            My Profile
          </span>
        </button>
      </div>
    </div>
  );
};
