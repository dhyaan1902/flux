
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
            <div className="absolute top-0 left-0 right-0 z-40 p-4 pt-[calc(env(safe-area-inset-top)+8px)] flex items-center justify-between text-white gradient-overlay-top">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 rounded-full bg-black/60 active:scale-90 transition-transform shadow-lg border border-white/10"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    {/* Placeholder for future actions if needed */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pb-safe bg-black">
                <div className="w-full aspect-video bg-black relative">
                    <img
                        src={headerImage}
                        alt={details.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <button onClick={handlePlayMain} className="w-14 h-14 rounded-full border border-white/20 bg-black/60 flex items-center justify-center active:scale-90 transition-transform shadow-2xl">
                            <Play className="w-6 h-6 fill-white text-white ml-1" />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
                </div>

                <div className="px-6 -mt-8 relative z-10 pb-20">
                    <h2 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-2xl">{details.title}</h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 text-xs mb-6 font-medium">
                        <span>{details.year}</span>
                        {details.type === MediaType.TV_SHOW && (
                            <>
                                <span>•</span>
                                <span>{seasonCount} Season{seasonCount > 1 ? 's' : ''}</span>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={handlePlayMain}
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-4 rounded-xl active:scale-[0.98] transition-all duration-150"
                        >
                            <PlayIcon className={`w-5 h-5 ${PlayIcon === Play ? 'fill-black' : ''}`} />
                            <span className="text-sm">{playButtonText}</span>
                        </button>
                    </div>

                    <p className="text-gray-400 text-[13px] leading-relaxed mb-8 opacity-90 line-clamp-4 font-medium">
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
                            <span className="text-xs text-gray-500 font-medium">My List</span>
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
                    <div className="border-t border-white/10 mt-4">
                        <div className="flex gap-10 px-2 bg-black">
                            {details.type === MediaType.TV_SHOW && (
                                <button
                                    onClick={() => setActiveTab('EPISODES')}
                                    className={`py-4 text-xs font-bold transition-all ${activeTab === 'EPISODES' ? 'text-white border-t-2 border-white' : 'text-gray-600'}`}
                                >
                                    Episodes
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('MORE')}
                                className={`py-4 text-xs font-bold transition-all ${activeTab === 'MORE' ? 'text-white border-t-2 border-white' : 'text-gray-600'}`}
                            >
                                More Like This
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
                                                        className="flex gap-4 p-2 rounded-xl transition-all active:bg-white/5"
                                                    >
                                                        <div className="relative w-36 aspect-video bg-[#0a0a0a] flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                                                            <img
                                                                src={ep.imageUrl || headerImage}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                <Play className="w-6 h-6 fill-white text-white opacity-90 drop-shadow-md" />
                                                            </div>
                                                            {isWatched && (
                                                                <div className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5 border border-white/20">
                                                                    <Check className="w-2.5 h-2.5 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className="text-white font-bold text-[13px] leading-tight line-clamp-2">{ep.episodeNumber}. {ep.title}</h4>
                                                                <div className="flex-shrink-0">
                                                                    <DownloadButton
                                                                        tmdbId={details.tmdbId}
                                                                        type={MediaType.TV_SHOW}
                                                                        title={`${details.title} - S${currentSeason}E${ep.episodeNumber}`}
                                                                        season={currentSeason}
                                                                        episode={ep.episodeNumber}
                                                                        variant="compact"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                                                                {ep.runtime ? <span>{ep.runtime}m</span> : null}
                                                                {ep.airDate && <span>• {new Date(ep.airDate).getFullYear()}</span>}
                                                            </div>
                                                            <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed font-medium">{ep.overview || "No description available."}</p>
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
