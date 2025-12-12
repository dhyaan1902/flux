
import React from 'react';
import { Home, Search, Download, Ghost, Library } from 'lucide-react';
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
    { id: 'anime', icon: Ghost, label: 'Anime' },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'JS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-[#262626] z-50 pb-safe">
      <div className="flex justify-between items-center px-4 py-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className="flex flex-col items-center gap-1 w-full"
            >
              <item.icon
                className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#808080]'}`}
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && item.id !== 'search' && item.id !== 'downloads' ? 'currentColor' : 'none'}
              />
              <span className={`text-[10px] ${isActive ? 'text-white font-medium' : 'text-[#808080]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* My Netflix Tab */}
        <button
          onClick={() => onTabChange('my-netflix')}
          className="flex flex-col items-center gap-1 w-full"
        >
          <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold border ${activeTab === 'my-netflix'
            ? 'bg-transparent text-white border-white'
            : 'bg-transparent text-transparent border-[#808080] overflow-hidden'
            }`}>
            {/* Simulate User Avatar or Empty Frame */}
            {activeTab !== 'my-netflix' && <div className="w-full h-full bg-blue-600"></div>}
            {activeTab === 'my-netflix' && getInitials(userName)}
          </div>
          <span className={`text-[10px] ${activeTab === 'my-netflix' ? 'text-white font-medium' : 'text-[#808080]'}`}>
            My Netflix
          </span>
        </button>
      </div>
    </div>
  );
};
