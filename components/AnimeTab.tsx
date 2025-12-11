

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Play, Info } from 'lucide-react';
import { AnimeItem, AnimeEpisode, AnimePreference, AnimeLanguage, AnimeProvider, AnimeTabProps } from '../types';
import { getTrendingAnime, getPopularAnime, searchAnime, getAnimeEpisodes } from '../services/anime';
import { AnimeDetailModal } from './AnimeDetailModal';
import { AnimePlayer } from './AnimePlayer';

export const AnimeTab: React.FC<AnimeTabProps> = ({ 
    animePreference, 
    animeLanguage, 
    animeSource, 
    onAnimeSourceChange,
    watchHistory,
    onUpdateHistory
}) => {
    const [trending, setTrending] = useState<AnimeItem[]>([]);
    const [popular, setPopular] = useState<AnimeItem[]>([]);
    const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    
    const [heroAnime, setHeroAnime] = useState<AnimeItem | null>(null);
    const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);
    
    // Player State
    const [playingEpisode, setPlayingEpisode] = useState<AnimeEpisode | null>(null);
    const [playingAnime, setPlayingAnime] = useState<AnimeItem | null>(null);
    const [launchingHero, setLaunchingHero] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const [t, p] = await Promise.all([getTrendingAnime(), getPopularAnime()]);
            setTrending(t);
            setPopular(p);
            
            if (t.length > 0) {
                setHeroAnime(t[0]);
            }
            
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                setSearching(true);
                const results = await searchAnime(searchQuery);
                setSearchResults(results);
                setSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handlePlayEpisode = (episode: AnimeEpisode, anime: AnimeItem) => {
        setSelectedAnime(null); // Close modal
        setPlayingAnime(anime);
        setPlayingEpisode(episode);
        
        // REQUEST FULLSCREEN for native app feel
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => {});
        } else if ((docEl as any).webkitRequestFullscreen) {
            (docEl as any).webkitRequestFullscreen();
        }
    };

    const handlePlayHero = async () => {
        if (!heroAnime) return;
        setLaunchingHero(true);
        try {
            // Fetch episodes for hero to play the first one
            // Pass title for fallback
            const title = heroAnime.title.english || heroAnime.title.romaji || heroAnime.title.native;
            const episodes = await getAnimeEpisodes(heroAnime.id, title);
            
            if (episodes && episodes.length > 0) {
                handlePlayEpisode(episodes[0], heroAnime);
            } else {
                // If fails, just open info
                setSelectedAnime(heroAnime);
            }
        } catch (e) {
            setSelectedAnime(heroAnime);
        } finally {
            setLaunchingHero(false);
        }
    };

    const handleClosePlayer = () => {
        setPlayingEpisode(null);
        setPlayingAnime(null);
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        }
    };

    return (
        <div className="min-h-screen bg-black pb-24 text-white">
            
            {/* Transparent Search Header */}
            <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${searchQuery.length > 0 ? 'bg-black' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
                <div className="px-4 py-3">
                    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-lg border border-white/5 px-3 py-2 focus-within:bg-black/80 focus-within:border-white/20 transition-all">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input 
                            type="text"
                            placeholder="Search Anime..."
                            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                    </div>
                </div>
            </div>

            {/* Search Results Overlay */}
            {searchQuery.length > 2 && (
                <div className="fixed inset-0 top-16 z-30 bg-black overflow-y-auto pb-24 px-4 pt-4 animate-in fade-in duration-200">
                     <h3 className="text-gray-400 font-bold mb-4">Top Results</h3>
                     <div className="grid grid-cols-3 gap-3">
                         {searchResults.map(anime => (
                             <div 
                                key={anime.id} 
                                onClick={() => setSelectedAnime(anime)}
                                className="relative aspect-[2/3] bg-[#222] rounded overflow-hidden cursor-pointer"
                             >
                                 <img src={anime.coverImage} className="w-full h-full object-cover" alt={anime.title.english} />
                                 <div className="absolute top-1 right-1 bg-indigo-600 text-[8px] font-bold px-1 rounded text-white">
                                     {anime.averageScore}%
                                 </div>
                             </div>
                         ))}
                    </div>
                    {searchResults.length === 0 && !searching && (
                        <div className="text-center py-20 text-gray-500">
                            No results found.
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <span className="text-xs text-gray-500 font-medium">Loading Anime Catalog...</span>
                </div>
            ) : (
                <>
                    {/* Anime Hero Section */}
                    {heroAnime && !searchQuery && (
                        <div className="relative w-full aspect-[2/3] md:aspect-video max-h-[80vh] overflow-hidden">
                            <img 
                                src={heroAnime.bannerImage || heroAnime.coverImage} 
                                alt={heroAnime.title.english} 
                                className="w-full h-full object-cover"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 flex flex-col items-center text-center">
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-2xl tracking-tight leading-none">
                                    {heroAnime.title.english || heroAnime.title.romaji}
                                </h1>

                                <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-gray-200 font-medium drop-shadow-md">
                                    {heroAnime.genres.slice(0, 3).join(' • ')}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={handlePlayHero}
                                        disabled={launchingHero}
                                        className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-[4px] font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                                    >
                                        {launchingHero ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                        <span className="text-base">Play</span>
                                    </button>

                                    <button 
                                        onClick={() => setSelectedAnime(heroAnime)}
                                        className="flex items-center gap-2 bg-gray-500/40 backdrop-blur-md text-white px-6 py-2.5 rounded-[4px] font-bold hover:bg-white/20 active:scale-95 transition-all"
                                    >
                                        <Info className="w-5 h-5" />
                                        <span className="text-base">Info</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Rows */}
                    <div className="relative z-10 px-4 space-y-8 -mt-4">
                        {/* Trending Row */}
                        <div>
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                Trending Now
                            </h2>
                            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                                {trending.map(anime => (
                                    <div 
                                        key={anime.id} 
                                        onClick={() => setSelectedAnime(anime)}
                                        className="flex-none w-[120px] snap-start cursor-pointer group"
                                    >
                                        <div className="aspect-[2/3] bg-[#222] rounded overflow-hidden mb-2 relative">
                                            <img src={anime.coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                                            <div className="absolute top-1 left-1 bg-indigo-600 text-[8px] font-bold px-1 rounded text-white">
                                                #{trending.indexOf(anime) + 1}
                                            </div>
                                        </div>
                                        <h3 className="text-xs font-medium text-gray-300 line-clamp-1 group-hover:text-white transition-colors">
                                            {anime.title.english || anime.title.romaji}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Popular Row */}
                         <div>
                            <h2 className="text-lg font-bold text-white mb-3">
                                All Time Popular
                            </h2>
                            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                                {popular.map(anime => (
                                    <div 
                                        key={anime.id} 
                                        onClick={() => setSelectedAnime(anime)}
                                        className="flex-none w-[120px] snap-start cursor-pointer group"
                                    >
                                        <div className="aspect-[2/3] bg-[#222] rounded overflow-hidden mb-2 relative">
                                            <img src={anime.coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                                        </div>
                                        <h3 className="text-xs font-medium text-gray-300 line-clamp-1 group-hover:text-white transition-colors">
                                            {anime.title.english || anime.title.romaji}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            {selectedAnime && (
                <AnimeDetailModal 
                    anime={selectedAnime} 
                    onClose={() => setSelectedAnime(null)} 
                    onPlay={(ep) => handlePlayEpisode(ep, selectedAnime)}
                    watchHistory={watchHistory}
                />
            )}

            {/* Player */}
            {playingEpisode && playingAnime && (
                <AnimePlayer 
                    episode={playingEpisode}
                    animeTitle={playingAnime.title.english || playingAnime.title.romaji}
                    imdbId={playingAnime.imdbId}
                    anilistId={playingAnime.id}
                    mode={animePreference}
                    language={animeLanguage}
                    sourceProvider={animeSource}
                    onSourceProviderChange={onAnimeSourceChange}
                    onClose={handleClosePlayer}
                    onProgress={() => {
                        const title = playingAnime.title.english || playingAnime.title.romaji || playingAnime.title.native;
                        onUpdateHistory(playingAnime.id, playingEpisode.number, title, playingAnime.coverImage);
                    }}
                />
            )}
        </div>
    );
};
