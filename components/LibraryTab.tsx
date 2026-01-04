import React from 'react';
import { MediaItem } from '../types';
import { PlayCircle, X } from 'lucide-react';

interface LibraryTabProps {
    items: MediaItem[];
    onItemClick: (item: MediaItem) => void;
    onRemoveFromLibrary: (item: MediaItem) => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
    items,
    onItemClick,
    onRemoveFromLibrary
}) => {
    return (
        <div className="min-h-screen pb-24 pt-24 px-4 bg-black">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">My Library</h1>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-500">
                    <p className="text-lg font-bold text-gray-400 mb-2">Your library is empty</p>
                    <p className="text-xs text-gray-600">Add movies and shows to your list to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            className="group relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] transition-transform hover:scale-105 cursor-pointer"
                        >
                            {item.posterUrl ? (
                                <img
                                    src={item.posterUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#262626] text-gray-500">
                                    <span className="text-xs text-center px-2">{item.title}</span>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <PlayCircle className="w-12 h-12 text-white opacity-80" />
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFromLibrary(item);
                                }}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 active:bg-red-500 active:text-white transition-all"
                                title="Remove from Library"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            <div className="absolute top-1 left-1 bg-red-600 text-[8px] font-bold px-1 rounded-sm text-white pointer-events-none">N</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
