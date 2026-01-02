
import React from 'react';
import { MediaItem } from '../types';
import { MediaCard } from './MediaCard';

interface RowProps {
  title: string;
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
}

export const Row: React.FC<RowProps> = ({ title, items, onItemClick }) => {
  return (
    <div className="mb-6">
      <h2 className="text-white text-[12px] font-black mb-3 px-6 uppercase tracking-widest opacity-60">{title}</h2>
      <div className="flex overflow-x-auto gap-3 px-6 pb-2 scrollbar-hide snap-x snap-mandatory">
        {items.map((item) => (
          <div key={item.id} className="flex-none w-[115px] md:w-[170px] snap-start">
            <MediaCard item={item} onClick={onItemClick} />
          </div>
        ))}
      </div>
    </div>
  );
};
