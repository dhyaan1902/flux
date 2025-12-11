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
    <div className="mb-6 md:mb-8">
      <h2 className="text-white text-md md:text-lg font-bold mb-3 px-4">{title}</h2>
      <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
        {items.map((item) => (
          <div key={item.id} className="flex-none w-[110px] md:w-[160px] snap-start">
            <MediaCard item={item} onClick={onItemClick} />
          </div>
        ))}
      </div>
    </div>
  );
};
