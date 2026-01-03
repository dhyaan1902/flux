
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
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/5 z-50 pb-safe px-safe">
      <div className="flex justify-around items-center px-2 h-20">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all"
            >
              <div className={`relative px-6 py-1.5 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/10' : ''}`}>
                <item.icon
                  className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/30'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[11px] mt-1 transition-all duration-300 ${isActive ? 'text-white font-medium' : 'text-white/20 font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* My Netflix Tab */}
        <button
          onClick={() => onTabChange('my-netflix')}
          className="relative flex flex-col items-center justify-center flex-1 h-full transition-all"
        >
          <div className={`relative px-6 py-1.5 rounded-lg transition-all duration-300 ${activeTab === 'my-netflix' ? 'bg-white/10' : ''}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${activeTab === 'my-netflix'
              ? 'bg-white text-black border-white'
              : 'bg-white/5 text-white/30 border-white/5'
              }`}>
              {getInitials(userName)}
            </div>
          </div>
          <span className={`text-[11px] mt-1 transition-all duration-300 ${activeTab === 'my-netflix' ? 'text-white font-medium' : 'text-white/20 font-medium'}`}>
            Profile
          </span>
        </button>
      </div>
    </div>
  );
};
