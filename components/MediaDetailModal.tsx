

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Download, Plus, ThumbsUp, Share2, ChevronDown, Check, Loader2, RotateCcw } from 'lucide-react';
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
    onItemClick: (item: MediaItem) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ item, onClose, onPlay, isInMyList, onToggleMyList, watchHistory, onItemClick }) => {
    const [details, setDetails] = useState<MediaItem>(item);
    const [activeTab, setActiveTab] = useState<'EPISODES' | 'MORE'>(item.type === MediaType.MOVIE ? 'MORE' : 'EPISODES');

    // History Check
    const history = watchHistory[item.id];
    const lastSeason = history?.lastSeason || 1;
    const lastEpisode = history?.lastEpisode || 1;
    const hasStarted = !!history;

    const [currentSeason, setCurrentSeason] = useState(lastSeason);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [seasonPoster, setSeasonPoster] = useState<string | undefined>(undefined);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    // Recommendations
    const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Handle Android Back Button
    useEffect(() => {
        // Push a new state so the back button has something to pop
        window.history.pushState({ modal: 'mediaDetail' }, '');

        const handlePopState = () => {
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

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
            getSeasonEpisodes(details.tmdbId, currentSeason).then(data => {
                setEpisodes(data.episodes);
                setSeasonPoster(data.seasonPoster);
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
        <div className="fixed inset-0 z-50 flex flex-col bg-[#121212] animate-in slide-in-from-right duration-300">
            {/* Header / Back Button - Moved to Right */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-end">
                <button
                    onClick={() => {
                        window.history.back(); // Use history back to be consistent with the pushState
                    }}
                    className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe">
                {/* Standard Mobile Detail Layout */}

                {/* Video Player Placeholder / Trailer Auto-play */}
                <div className="w-full aspect-video bg-black relative">
                    <img
                        src={headerImage}
                        alt={details.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <button onClick={handlePlayMain} className="w-12 h-12 rounded-full border border-white/30 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                        </button>
                    </div>
                </div>

                <div className="px-4 pt-3 pb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">{details.title}</h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400 text-[11px] mb-4">
                        <span className="text-[#46d369] font-bold">98% Match</span>
                        <span>{details.year}</span>
                        <span className="bg-[#333] px-1 py-0.5 rounded text-[9px] text-gray-300">HD</span>
                        {details.type === MediaType.TV_SHOW && (
                            <span>{seasonCount} Season{seasonCount > 1 ? 's' : ''}</span>
                        )}
                    </div>

                    {/* Primary Actions - Full Width Block Buttons */}
                    <button
                        onClick={handlePlayMain}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 rounded-[4px] mb-2.5 active:opacity-90"
                    >
                        <PlayIcon className="w-6 h-6 fill-current" />
                        <span className="text-[15px]">{playButtonText}</span>
                    </button>

                    <div className="text-white text-[13px] leading-snug mb-4 line-clamp-4">
                        {details.overview}
                    </div>

                    <div className="space-y-1 mb-6 text-[11px] text-[#b3b3b3]">
                        <div className="line-clamp-1">
                            <span className="text-[#737373]">Cast: </span>
                            {details.cast.slice(0, 4).join(', ')}...
                        </div>
                        {details.director && (
                            <div className="line-clamp-1">
                                <span className="text-[#737373]">Director: </span>
                                {details.director}
                            </div>
                        )}
                    </div>

                    {/* Action Row */}
                    <div className="flex justify-start gap-8 px-4 mb-6 overflow-x-auto no-scrollbar">
                        <button
                            className="flex flex-col items-center gap-1 min-w-[50px]"
                            onClick={onToggleMyList}
                        >
                            {isInMyList ? <Check className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                            <span className="text-[10px] text-[#b3b3b3]">My List</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 min-w-[50px]">
                            <ThumbsUp className="w-6 h-6 text-white" />
                            <span className="text-[10px] text-[#b3b3b3]">Rate</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 min-w-[50px]">
                            <Share2 className="w-6 h-6 text-white" />
                            <span className="text-[10px] text-[#b3b3b3]">Share</span>
                        </button>
                    </div>

                    <div className="border-t border-white/10 mt-2">
                        {/* Tabs */}
                        <div className="flex items-center gap-6 px-4 pt-0 mb-4 sticky top-0 bg-[#121212] z-10">
                            {details.type === MediaType.TV_SHOW && (
                                <button
                                    onClick={() => setActiveTab('EPISODES')}
                                    className={`py-3 text-sm font-bold border-t-4 transition-colors ${activeTab === 'EPISODES' ? 'border-[#E50914] text-white' : 'border-transparent text-gray-400'}`}
                                >
                                    EPISODES
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('MORE')}
                                className={`py-3 text-sm font-bold border-t-4 transition-colors ${activeTab === 'MORE' ? 'border-[#E50914] text-white' : 'border-transparent text-gray-400'}`}
                            >
                                MORE LIKE THIS
                            </button>
                        </div>

                        {/* Episodes View */}
                        {activeTab === 'EPISODES' && details.type === MediaType.TV_SHOW && (
                            <div className="px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Season Selector */}
                                {seasonCount > 1 && (
                                    <div className="mb-4">
                                        <div className="relative inline-block">
                                            <select
                                                value={currentSeason}
                                                onChange={(e) => setCurrentSeason(Number(e.target.value))}
                                                className="appearance-none bg-[#262626] text-white pl-4 pr-10 py-2 rounded font-bold text-sm focus:outline-none"
                                            >
                                                {seasonOptions.map(s => (
                                                    <option key={s} value={s}>Season {s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                {loadingEpisodes ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {episodes.map(ep => {
                                            const isWatched = history?.watchedEpisodes?.includes(`S${currentSeason}E${ep.episodeNumber}`);
                                            return (
                                                <div
                                                    key={ep.id}
                                                    onClick={() => handleEpisodeClick(ep)}
                                                    className={`flex items-center gap-4 py-4 border-b border-white/5 cursor-pointer active:bg-white/5 px-2 rounded-lg transition-colors ${isWatched ? 'opacity-60' : ''}`}
                                                >
                                                    <div className="relative w-28 aspect-video bg-[#333] flex-shrink-0 rounded overflow-hidden">
                                                        <img
                                                            src={ep.imageUrl || details.backdropUrl || headerImage}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                            <Play className="w-6 h-6 fill-white text-white opacity-90" />
                                                        </div>
                                                        {isWatched && (
                                                            <div className="absolute bottom-1 right-1">
                                                                <div className="bg-black/60 rounded-full p-0.5"><Check className="w-3 h-3 text-red-500" /></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="text-white font-bold text-sm truncate">{ep.episodeNumber}. {ep.title}</h4>
                                                            <span className="text-gray-400 text-xs">{ep.runtime ? `${ep.runtime}m` : ''}</span>
                                                        </div>
                                                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{ep.overview || "No description available."}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recommendations View */}
                        {activeTab === 'MORE' && (
                            <div className="px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {loadingRecommendations ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {recommendations.map(media => (
                                            <MediaCard key={media.id} item={media} onClick={onItemClick} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
