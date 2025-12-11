

import React, { useEffect, useState } from 'react';
import { X, Play, Download, Plus, ThumbsUp, Share2, ChevronDown, Check, Loader2, RotateCcw } from 'lucide-react';
import { MediaItem, MediaType, Episode, WatchProgress } from '../types';
import { getMediaDetails, getSeasonEpisodes, getRecommendations } from '../services/gemini';
import { MediaCard } from './MediaCard';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (season?: number, episode?: number) => void;
  isInMyList: boolean;
  onToggleMyList: () => void;
  watchHistory: WatchProgress;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ item, onClose, onPlay, isInMyList, onToggleMyList, watchHistory }) => {
  const [details, setDetails] = useState<MediaItem>(item);
  const [activeTab, setActiveTab] = useState<'EPISODES' | 'MORE'>(item.type === MediaType.MOVIE ? 'MORE' : 'EPISODES');
  
  // History Check
  const history = watchHistory[item.id];
  const lastSeason = history?.lastSeason || 1;
  const lastEpisode = history?.lastEpisode || 1;
  const hasStarted = !!history;

  const [currentSeason, setCurrentSeason] = useState(lastSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Recommendations
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Fetch full details
  useEffect(() => {
    let active = true;
    getMediaDetails(item.id, item.type).then(fullDetails => {
        if (active && fullDetails) {
            setDetails(fullDetails);
        }
    });
    return () => { active = false; };
  }, [item.id, item.type]);

  // Fetch episodes
  useEffect(() => {
    if (details.type === MediaType.TV_SHOW && activeTab === 'EPISODES') {
        setLoadingEpisodes(true);
        getSeasonEpisodes(details.tmdbId, currentSeason).then(eps => {
            setEpisodes(eps);
            setLoadingEpisodes(false);
        });
    }
  }, [details.tmdbId, details.type, currentSeason, activeTab]);

  // Fetch Recommendations (More Like This)
  useEffect(() => {
      if (activeTab === 'MORE' && recommendations.length === 0) {
          setLoadingRecommendations(true);
          getRecommendations(String(details.tmdbId || details.id), details.type).then(recs => {
              setRecommendations(recs);
              setLoadingRecommendations(false);
          });
      }
  }, [activeTab, details.tmdbId, details.id, details.type]);

  const handlePlayMain = () => {
    if (details.type === MediaType.MOVIE) {
        onPlay(1, 1);
    } else {
        // Resume from last watched or start S1E1
        onPlay(lastSeason, lastEpisode);
    }
  };

  const handleEpisodeClick = (ep: Episode) => {
    onPlay(currentSeason, ep.episodeNumber);
  };
  
  const headerImage = details.backdropUrl || details.posterUrl || 'https://via.placeholder.com/500x281';
  const seasonCount = details.totalSeasons || 1;
  const seasonOptions = Array.from({ length: seasonCount }, (_, i) => i + 1);

  // Determine button text
  let playButtonText = "Play";
  let PlayIcon = Play;
  if (details.type === MediaType.TV_SHOW && hasStarted) {
      playButtonText = `Resume S${lastSeason}:E${lastEpisode}`;
      PlayIcon = RotateCcw; // Or keep Play icon
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative pointer-events-auto w-full sm:max-w-md bg-[#181818] rounded-t-2xl sm:rounded-xl shadow-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
        
        <div className="flex justify-end p-2 absolute top-0 right-0 z-30">
            <button onClick={onClose} className="p-2 bg-[#181818]/50 rounded-full text-white hover:bg-[#333] backdrop-blur-sm">
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe">
            {/* Hero */}
            <div className="w-full aspect-video bg-zinc-800 relative">
                 <img 
                    src={headerImage} 
                    alt={details.title}
                    className="w-full h-full object-cover opacity-80"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={handlePlayMain} className="bg-white/20 border border-white/30 rounded-full p-4 backdrop-blur-sm hover:scale-105 transition-transform active:scale-95">
                        <Play className="w-8 h-8 fill-white text-white pl-1" />
                    </button>
                 </div>
            </div>

            <div className="px-4 -mt-6 relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{details.title}</h2>
                
                <div className="flex flex-wrap items-center gap-2 text-gray-400 text-xs mb-4">
                    <span className="text-green-400 font-bold">{details.rating ? `${(details.rating * 10).toFixed(0)}% Match` : 'New'}</span>
                    <span>{details.year}</span>
                    <span className="bg-[#333] px-1.5 py-0.5 rounded text-[10px] text-gray-300 border border-gray-600">HD</span>
                    {details.type === MediaType.TV_SHOW && (
                        <span>{seasonCount} Season{seasonCount > 1 ? 's' : ''}</span>
                    )}
                </div>

                <button 
                    onClick={handlePlayMain}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 rounded mb-3 active:scale-[0.98] transition-transform"
                >
                    <PlayIcon className="w-5 h-5 fill-current" />
                    {playButtonText}
                </button>

                <button className="w-full flex items-center justify-center gap-2 bg-[#262626] text-white font-bold py-2.5 rounded mb-4 active:scale-[0.98] transition-transform">
                    <Download className="w-5 h-5" />
                    Download
                </button>

                <div className="text-white text-sm leading-snug mb-4 text-gray-300 line-clamp-4">
                    {details.overview}
                </div>

                <div className="space-y-1 mb-6">
                    <div className="text-xs text-gray-400">
                        <span className="text-gray-500">Cast: </span>
                        {details.cast.slice(0, 3).join(', ')}...
                    </div>
                    {details.director && (
                        <div className="text-xs text-gray-400">
                            <span className="text-gray-500">Director: </span>
                            {details.director}
                        </div>
                    )}
                </div>

                <div className="flex justify-start gap-12 px-2 mb-6">
                    <button 
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
                        onClick={onToggleMyList}
                    >
                        {isInMyList ? <Check className="w-5 h-5 text-green-500" /> : <Plus className="w-5 h-5" />}
                        <span className="text-[10px]">My List</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-[10px]">Rate</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="text-[10px]">Share</span>
                    </button>
                </div>

                <div className="mt-4">
                    <div className="flex border-t border-gray-800 mb-2 sticky top-0 bg-[#181818] z-10 pt-2 gap-6">
                         {details.type === MediaType.TV_SHOW && (
                            <button 
                                className={`pb-2 text-sm font-bold uppercase border-b-2 transition-colors ${activeTab === 'EPISODES' ? 'border-red-600 text-white' : 'border-transparent text-gray-500'}`}
                                onClick={() => setActiveTab('EPISODES')}
                            >
                                Episodes
                            </button>
                         )}
                        <button 
                            className={`pb-2 text-sm font-bold uppercase border-b-2 transition-colors ${activeTab === 'MORE' ? 'border-red-600 text-white' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('MORE')}
                        >
                            More Like This
                        </button>
                    </div>

                    {activeTab === 'EPISODES' && details.type === MediaType.TV_SHOW && (
                        <div className="min-h-[300px]">
                            <div className="relative mb-4 bg-[#333] rounded overflow-hidden w-fit">
                                <select 
                                    value={currentSeason}
                                    onChange={(e) => setCurrentSeason(Number(e.target.value))}
                                    className="appearance-none bg-transparent text-white font-bold text-sm py-2 pl-4 pr-10 focus:outline-none cursor-pointer"
                                >
                                    {seasonOptions.map(num => (
                                        <option key={num} value={num} className="bg-[#333] text-white">Season {num}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="space-y-4 pb-10">
                                {loadingEpisodes ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                                    </div>
                                ) : episodes.length > 0 ? (
                                    episodes.map((ep) => {
                                        const epKey = `S${ep.seasonNumber}E${ep.episodeNumber}`;
                                        const isWatched = history?.watchedEpisodes?.includes(epKey);

                                        return (
                                            <div 
                                                key={ep.id} 
                                                className={`group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors ${isWatched ? 'opacity-60' : ''}`} 
                                                onClick={() => handleEpisodeClick(ep)}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Episode Thumbnail */}
                                                    <div className="relative w-36 aspect-video bg-[#333] rounded overflow-hidden flex-shrink-0">
                                                            <img 
                                                                src={ep.imageUrl || headerImage} 
                                                                className={`w-full h-full object-cover transition-opacity ${isWatched ? 'grayscale' : ''}`} 
                                                                alt={ep.title}
                                                            />
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
                                                    
                                                    <div className="flex-1 min-w-0 py-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`text-sm font-bold truncate leading-tight ${isWatched ? 'text-gray-400' : 'text-white'}`}>
                                                                {ep.episodeNumber}. {ep.title}
                                                            </h4>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 line-clamp-3 leading-relaxed">
                                                            {ep.overview || "No description available."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 text-gray-500 text-sm">
                                        No episodes available.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'MORE' && (
                        <div className="min-h-[300px] pb-10">
                            {loadingRecommendations ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                                </div>
                            ) : recommendations.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {recommendations.map(rec => (
                                        <div key={rec.id} className="w-full">
                                            <MediaCard 
                                                item={rec} 
                                                onClick={() => {
                                                    // Quick navigation: update details directly to new item
                                                    setDetails(rec);
                                                    setEpisodes([]); // Reset eps
                                                    setRecommendations([]); // Reset recs
                                                    // If switching type or needing full refresh, one might close/open, but this works for in-modal browsing
                                                }} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    No similar content found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
