import React, { useEffect, useState } from 'react';
import { X, Play, Loader2, Download, Share2, Plus, ThumbsUp, RefreshCw, Check } from 'lucide-react';
import { AnimeItem, AnimeEpisode, WatchProgress } from '../types';
import { getAnimeEpisodes } from '../services/anime';

interface AnimeDetailModalProps {
    anime: AnimeItem;
    onClose: () => void;
    onPlay: (episode: AnimeEpisode) => void;
    watchHistory?: WatchProgress; // Optional to not break strict types if unused elsewhere
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({ anime, onClose, onPlay, watchHistory }) => {
    const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    
    // Chunking State for long anime
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const CHUNK_SIZE = 50;
    
    // History
    const history = watchHistory ? watchHistory[anime.id] : undefined;
    const lastEpNumber = history?.lastEpisode || 1;

    // Fix: Use RegExp constructor to avoid XML/Parser syntax errors with < > characters in literals
    const description = anime.description?.replace(new RegExp('<[^>]*>?', 'gm'), '') || "No description available.";

    const fetchEps = async () => {
        setLoading(true);
        setError(false);
        try {
            // Pass the English or Romaji title as a fallback if the ID lookup fails
            const title = anime.title.english || anime.title.romaji || anime.title.native;
            const data = await getAnimeEpisodes(anime.id, title);
            
            if (data && data.length > 0) {
                setEpisodes(data);
                
                // Auto-set chunk based on last watched episode
                if (history?.lastEpisode) {
                    const idx = Math.floor((history.lastEpisode - 1) / CHUNK_SIZE);
                    setCurrentChunkIndex(idx >= 0 ? idx : 0);
                } else {
                    setCurrentChunkIndex(0);
                }
            } else {
                setError(true);
            }
        } catch (e) {
            console.error("Failed to load episodes", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anime.id]);

    const handlePlayMain = () => {
        if (episodes.length === 0) return;
        
        // Find the episode object that matches the last watched number
        const nextEp = episodes.find(e => e.number === lastEpNumber) || episodes[0];
        onPlay(nextEp);
    };

    const headerImage = anime.bannerImage || anime.coverImage;

    // Calculate chunks
    const totalEpisodes = episodes.length;
    const showRangeSelector = totalEpisodes > CHUNK_SIZE;
    const chunkCount = Math.ceil(totalEpisodes / CHUNK_SIZE);

    const displayedEpisodes = showRangeSelector 
        ? episodes.slice(currentChunkIndex * CHUNK_SIZE, (currentChunkIndex + 1) * CHUNK_SIZE)
        : episodes;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center pointer-events-none">
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto transition-opacity" 
                onClick={onClose}
            />
            
            <div className="relative pointer-events-auto w-full sm:max-w-md bg-[#181818] rounded-t-2xl sm:rounded-xl shadow-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-30 p-2 bg-[#181818]/50 rounded-full text-white hover:bg-[#333] backdrop-blur-md">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe">
                    {/* Header Hero */}
                    <div className="w-full aspect-video bg-zinc-800 relative">
                        <img 
                            src={headerImage} 
                            alt={anime.title.romaji}
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 w-full">
                             <h2 className="text-3xl font-black text-white leading-none drop-shadow-xl mb-2">
                                {anime.title.english || anime.title.romaji}
                             </h2>
                        </div>
                    </div>

                    <div className="px-4 -mt-2 relative z-10">
                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-2 text-gray-300 text-xs mb-4 font-medium">
                            <span className="text-green-400 font-bold">{anime.averageScore ? `${anime.averageScore}% Match` : 'New'}</span>
                            <span>{anime.seasonYear}</span>
                            <span className="bg-[#333] px-1.5 py-0.5 rounded text-[10px] border border-gray-600">
                                {anime.status || 'Unknown'}
                            </span>
                            <span>{anime.episodes ? `${anime.episodes} Episodes` : 'Simulcast'}</span>
                        </div>

                        {/* Play Button */}
                        <button 
                            onClick={handlePlayMain}
                            disabled={loading || episodes.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 rounded mb-3 active:scale-[0.98] transition-transform disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                            {history ? `Resume Ep ${lastEpNumber}` : 'Play'}
                        </button>

                        <button className="w-full flex items-center justify-center gap-2 bg-[#262626] text-white font-bold py-2.5 rounded mb-6 active:scale-[0.98] transition-transform">
                            <Download className="w-5 h-5" />
                            Download
                        </button>

                        <p className="text-white text-sm leading-relaxed mb-6 text-gray-300 line-clamp-4">
                            {description}
                        </p>

                        {/* Action Bar */}
                        <div className="flex justify-start gap-12 px-2 mb-6 border-b border-white/10 pb-6">
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                                <Plus className="w-6 h-6" />
                                <span className="text-[10px]">My List</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                                <ThumbsUp className="w-6 h-6" />
                                <span className="text-[10px]">Rate</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                                <Share2 className="w-6 h-6" />
                                <span className="text-[10px]">Share</span>
                            </button>
                        </div>
                        
                        {/* Episodes Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white text-base">Episodes</h3>
                            <span className="text-xs text-gray-500 font-medium">
                                {episodes.length > 0 ? `${episodes.length} Eps` : ''}
                            </span>
                        </div>

                        {/* Chunk/Range Selector for Long Anime */}
                        {showRangeSelector && (
                            <div className="flex overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide snap-x">
                                {Array.from({ length: chunkCount }).map((_, idx) => {
                                    const start = idx * CHUNK_SIZE + 1;
                                    const end = Math.min((idx + 1) * CHUNK_SIZE, totalEpisodes);
                                    const isActive = currentChunkIndex === idx;
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentChunkIndex(idx)}
                                            className={`flex-none px-4 py-1.5 rounded-full text-xs font-bold transition-all snap-start whitespace-nowrap ${
                                                isActive 
                                                ? 'bg-white text-black scale-105' 
                                                : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                                            }`}
                                        >
                                            {start}-{end}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Episode List */}
                        <div className="space-y-4 pb-10">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <p className="text-gray-500 text-sm text-center">
                                        Unable to load episodes.<br/>Source might be unavailable.
                                    </p>
                                    <button 
                                        onClick={fetchEps}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Retry
                                    </button>
                                </div>
                            ) : displayedEpisodes.length > 0 ? (
                                displayedEpisodes.map((ep) => {
                                    const epKey = `S1E${ep.number}`; // Anime usually S1
                                    const isWatched = history?.watchedEpisodes?.includes(epKey);

                                    return (
                                        <div 
                                            key={ep.id} 
                                            onClick={() => onPlay(ep)}
                                            className={`group flex items-center gap-3 p-2 -mx-2 rounded hover:bg-white/10 cursor-pointer transition-colors ${isWatched ? 'opacity-60' : ''}`}
                                        >
                                            <div className="relative w-32 aspect-video bg-[#222] rounded overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={ep.image || anime.coverImage} 
                                                    className={`w-full h-full object-cover transition-opacity ${isWatched ? 'grayscale opacity-50' : 'group-hover:opacity-100 opacity-80'}`} 
                                                    alt={`Ep ${ep.number}`}
                                                />
                                                {/* Gradient for text readability */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                
                                                {/* Center Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                     {isWatched ? (
                                                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center border border-white/50">
                                                            <Check className="w-5 h-5 text-white" />
                                                        </div>
                                                     ) : (
                                                        <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                                                        </div>
                                                     )}
                                                </div>
                                                
                                                {isWatched && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold leading-tight line-clamp-1 ${isWatched ? 'text-gray-400' : 'text-white'}`}>
                                                        {ep.number}. {ep.title || `Episode ${ep.number}`}
                                                    </h4>
                                                </div>
                                                <p className="text-[10px] text-gray-400 line-clamp-2 leading-snug">
                                                    {ep.description || 'No summary available.'}
                                                </p>
                                            </div>

                                            {/* Download Icon */}
                                            <div className="flex-shrink-0 text-gray-500 group-hover:text-white transition-colors">
                                                <Download className="w-5 h-5" />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded">
                                    No episodes found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};