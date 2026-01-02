
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Play, Plus, ThumbsUp, Share2, ChevronDown, Check, Loader2, RotateCcw } from 'lucide-react';
import { MediaItem, MediaType, Episode, WatchProgress } from '../types';
import { getMediaDetails, getSeasonEpisodes, getRecommendations } from '../services/gemini';
import { MediaCard } from './MediaCard';
import { DownloadButton } from './DownloadButton';

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

    const history = watchHistory[item.id];
    const lastSeason = history?.lastSeason || 1;
    const lastEpisode = history?.lastEpisode || 1;
    const hasStarted = !!history;

    const [currentSeason, setCurrentSeason] = useState(lastSeason);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [seasonPoster, setSeasonPoster] = useState<string | undefined>(undefined);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);



    useEffect(() => {
        let active = true;
        getMediaDetails(item.id, item.type).then(fullDetails => {
            if (active && fullDetails) setDetails(fullDetails);
        });
        return () => { active = false; };
    }, [item.id, item.type]);

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
            onPlay(lastSeason, lastEpisode);
        }
    };

    const handleEpisodeClick = (ep: Episode) => {
        onPlay(currentSeason, ep.episodeNumber);
    };

    const headerImage = details.backdropUrl || details.posterUrl || 'https://via.placeholder.com/500x281';
    const seasonCount = details.totalSeasons || 1;
    const seasonOptions = Array.from({ length: seasonCount }, (_, i) => i + 1);

    let playButtonText = "Play";
    let PlayIcon = Play;
    if (details.type === MediaType.TV_SHOW && hasStarted) {
        playButtonText = `Resume S${lastSeason}:E${lastEpisode}`;
        PlayIcon = RotateCcw;
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in slide-in-from-bottom duration-300 ease-out">
            {/* Native Android AppBar Style */}
            <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-safe flex items-center justify-between text-white gradient-overlay-top">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 rounded-full bg-black/20 backdrop-blur-md active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    {/* Placeholder for future actions if needed */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe bg-[#121212]">
                <div className="w-full aspect-video bg-black relative">
                    <img
                        src={headerImage}
                        alt={details.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <button onClick={handlePlayMain} className="w-16 h-16 rounded-full border border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-lg active:scale-90 transition-transform">
                            <Play className="w-7 h-7 fill-white text-white ml-1" />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 gradient-overlay-bottom" />
                </div>

                <div className="px-5 -mt-6 relative z-10 pb-20">
                    <h2 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{details.title}</h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-xs mb-6">
                        <span className="text-green-500 font-bold">98% Match</span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded text-[10px] text-gray-200 border border-white/5">HDR</span>
                        <span>{details.year}</span>
                        {details.type === MediaType.TV_SHOW && (
                            <span>{seasonCount} Season{seasonCount > 1 ? 's' : ''}</span>
                        )}
                    </div>

                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={handlePlayMain}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg shadow-white/5"
                        >
                            <PlayIcon className={`w-5 h-5 ${PlayIcon === Play ? 'fill-black' : ''}`} />
                            <span className="text-sm">{playButtonText}</span>
                        </button>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed mb-6 opacity-90 line-clamp-4">
                        {details.overview}
                    </p>

                    <div className="flex items-center gap-4 mb-8">
                        <button
                            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                            onClick={onToggleMyList}
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 active:bg-white/10 transition-colors">
                                {isInMyList ? <Check className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium tracking-tight">My List</span>
                        </button>

                        <DownloadButton
                            tmdbId={details.tmdbId}
                            type={details.type}
                            title={details.title}
                            season={details.type === MediaType.TV_SHOW ? currentSeason : undefined}
                            episode={details.type === MediaType.TV_SHOW ? 1 : undefined}
                        />
                    </div>

                    {/* Tabs / Content Section */}
                    <div className="border-t border-white/5 mt-4">
                        <div className="flex gap-8 px-2 bg-[#121212]">
                            {details.type === MediaType.TV_SHOW && (
                                <button
                                    onClick={() => setActiveTab('EPISODES')}
                                    className={`py-4 text-xs font-bold tracking-widest transition-all ${activeTab === 'EPISODES' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
                                >
                                    EPISODES
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('MORE')}
                                className={`py-4 text-xs font-bold tracking-widest transition-all ${activeTab === 'MORE' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
                            >
                                MORE LIKE THIS
                            </button>
                        </div>

                        <div className="pt-6">
                            {activeTab === 'EPISODES' && details.type === MediaType.TV_SHOW && (
                                <div className="space-y-6">
                                    {seasonCount > 1 && (
                                        <div className="relative inline-block mb-2">
                                            <select
                                                value={currentSeason}
                                                onChange={(e) => setCurrentSeason(Number(e.target.value))}
                                                className="appearance-none bg-[#1e1e1e] text-white pl-4 pr-10 py-2.5 rounded-lg font-bold text-xs ring-1 ring-white/10"
                                            >
                                                {seasonOptions.map(s => (
                                                    <option key={s} value={s}>Season {s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
                                        </div>
                                    )}

                                    {loadingEpisodes ? (
                                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {episodes.map(ep => {
                                                const isWatched = history?.watchedEpisodes?.includes(`S${currentSeason}E${ep.episodeNumber}`);
                                                return (
                                                    <div
                                                        key={ep.id}
                                                        onClick={() => handleEpisodeClick(ep)}
                                                        className="flex gap-4 p-3 rounded-xl transition-all active:bg-white/5 hover:bg-white/5"
                                                    >
                                                        <div className="relative w-40 aspect-video bg-[#1e1e1e] flex-shrink-0 rounded-md overflow-hidden border border-white/5 shadow-sm">
                                                            <img
                                                                src={ep.imageUrl || headerImage}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                                <Play className="w-8 h-8 fill-white text-white opacity-90 drop-shadow-md" />
                                                            </div>
                                                            {isWatched && (
                                                                <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 border border-white/10">
                                                                    <Check className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                            {/* Progress Bar (Optional - based on watch history if available) */}
                                                            {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"><div className="h-full bg-red-600 w-1/2"/></div> */}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className="text-white font-bold text-[13px] leading-tight line-clamp-2">{ep.episodeNumber}. {ep.title}</h4>
                                                                <div onClick={(e) => e.stopPropagation()}>
                                                                    <DownloadButton
                                                                        tmdbId={details.tmdbId}
                                                                        type={MediaType.TV_SHOW}
                                                                        title={`${details.title} S${currentSeason}E${ep.episodeNumber}`}
                                                                        season={currentSeason}
                                                                        episode={ep.episodeNumber}
                                                                        variant="compact"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                                                                {ep.runtime ? <span>{ep.runtime}m</span> : null}
                                                                {ep.airDate && <span>• {new Date(ep.airDate).getFullYear()}</span>}
                                                            </div>
                                                            <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed opacity-80">{ep.overview || "No description available."}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'MORE' && (
                                <div className="grid grid-cols-3 gap-3">
                                    {loadingRecommendations ? (
                                        [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[2/3] skeleton rounded-lg" />)
                                    ) : (
                                        recommendations.map(media => (
                                            <MediaCard key={media.id} item={media} onClick={onItemClick} />
                                        ))
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
